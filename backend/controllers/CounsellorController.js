const pool = require('../config/database');
const {sendEmail} = require('../config/sendGrid');

const getSubmissions = async(req,res)=>{
    try {
        // check counsellorId is not empty
        const { counsellorId }=req.query;
        if(!counsellorId){
            return res.status(422).json({
                message: 'counsellorId is required.'
            });
        }

        // get the which school the counsellor is associated with
        const counsellorQuery ='SELECT SchoolID FROM GuidanceCounsellor WHERE UserID=$1';
        const counsellorResult = await pool.query(counsellorQuery, [counsellorId]);

        // check if counsellor exists
        if (counsellorResult.rowCount === 0){
            return res.status(404).json({
                message: 'Counsellor does not exist.'
            });

        }

        // the schoolID for the counsellor
        const schoolId = counsellorResult.rows[0].schoolid;

        // get the submission data from db based on schoolId and joining with student table to get student name
        const submissionsQuery =`
            SELECT 
                v.SubmissionID,
                s.StudentName,
                v.Hours,
                v.DateVolunteered,
                v.Description,
                v.Organization,
                v.ExternSupEmail,
                v.ExternSupStatus,
                v.ExternSupDate,
                v.ExternSupComments,
                v.GuidanceCounsellorApproved, 
                v.GuidanceCounsellorComments,
                v.GuidanceCounsellorFlag
            FROM VolunteerHourSubmission v
            INNER JOIN Student s ON v.StudentID = s.UserID    
            WHERE s.SchoolID=$1
            ORDER BY v.DateVolunteered DESC`;
            // later when sendgrid is implemented implement AND v.ExternSupStatus='Approved'
        const submissionsResult = await pool.query(submissionsQuery, [schoolId]);

        // return valid response with submissions
        return res.status(200).json({
            message: 'Submission Retrival Sucessful',
            submissions: submissionsResult.rows
        }); 

    } catch (error) {
        console.error("Error getting submissions:",error);
        return res.status(500).json({
            message: 'Internal server error'
        });   
    }
}

const updateSubmission = async (req, res) => {
  try {
    const {
      submissionid,
      guidancecounsellorid,
      guidancecounsellorcomments,
      guidancecounsellorapproved,
      guidancecounsellorflag
    } = req.body;
    // check submission is not empty
    if (!submissionid) {
      return res.status(422).json({
        message: 'submissionid is required.'
      });
    }

    // send query to db to check submission exists
    const submissionQuery = `
      SELECT SubmissionID
      FROM VolunteerHourSubmission
      WHERE SubmissionID=$1
    `;
    const submissionResult = await pool.query(submissionQuery, [submissionid]);

    // check there is an actual result from the query
    if (submissionResult.rowCount === 0) {
      return res.status(404).json({
        message: 'Submission does not exist.'
      });
    }

    // Normalize values
    const newStatus = guidancecounsellorapproved || null;
    const newFlag = guidancecounsellorflag === true;
    const verdictdate = new Date();

    // send query to upadate submission 
    const updateQuery = `
      UPDATE VolunteerHourSubmission
      SET 
        GuidanceCounsellorApproved = $1,
        GuidanceCounsellorComments = $2,
        GuidanceCounsellorFlag = $3,
        VerdictDate = $4,
        GuidanceCounsellorID = $5
      WHERE SubmissionID = $6
      RETURNING *
    `;

    const updateResult = await pool.query(updateQuery, [
      newStatus,
      guidancecounsellorcomments,
      newFlag,
      verdictdate,
      guidancecounsellorid,
      submissionid
    ]);

    // send email to student if they were approved or denied
    const submission = updateResult.rows[0];
    if (newStatus && updateResult.rowCount !== 0){
      const studentInfoQuery ='SELECT u.Email, s.StudentName FROM Users u JOIN Student s on u.UserID=s.UserID WHERE s.UserID=$1';
      const studentInfoResult = await pool.query(studentInfoQuery, [submission.studentid]);
      if (studentInfoResult.rowCount !== 0){
        const studentInfo = studentInfoResult.rows[0];
        try {
            await sendEmail({
                to: studentInfo.email,
                subject: `Volunteer Hour Submission ${submission.guidancecounsellorapproved}`,
                html:`
                    <p>Hello ${studentInfo.studentname},</p>
                    <br>
                    <p><strong> The following submission has been ${submission.guidancecounsellorapproved}</strong></p>
                    <p>Hours: ${submission.hours}</p>
                    <p>Date Volunteered: ${submission.datevolunteered}</p>
                    <p>Description: ${submission.description}</p>
                    <p>Organization: ${submission.organization}</p>
                    <p>Supervisor Email: ${submission.externsupemail}</p>
                    <br>
                    <p>Comments from your Counsellor: ${submission.guidancecounsellorcomments ||'N/A'}</p>
                    <p>If you believe there has been a mistake please contact your guidance counsellor.</p>
                    <p>Best regards,<br>Volunteer Hours Team</p>
                `
            });
        } catch (error) {
            console.error("Error sending volunteer hour status email:",error);
        }

      }
      
            

    }

    return res.status(200).json({
      message: "Submission Update Successful",
      updated: updateResult.rows[0]
    });

  } catch (error) {
    console.error("Error updating submission:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = {getSubmissions, updateSubmission};