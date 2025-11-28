const pool = require('../config/database');
const {sendEmail} = require('../config/sendGrid');
const crypto = require('crypto');

// Submit volunteer hours
const submitHours = async (req, res) => {
  try {
    const {
      studentId,
      organization,
      date_volunteered,
      hours,
      minutes,
      extern_sup_name,
      extern_sup_email,
      description,
    } = req.body;

    // Calculate total time as decimal
    const totalTime = parseFloat(hours) + parseFloat(minutes || 0) / 60;

    if (!studentId || !organization || !date_volunteered || isNaN(totalTime)) {
      return res.status(422).json({
        success: false,
        message: 'Student ID, organization, date, and hours are required.',
      });
    }

<<<<<<< Updated upstream
    // Insert new submission into the table
=======
    // create token to be used by superviosr to approve or deny submission
    const supToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 7*24*60*60*1000);
    // Update database with values
>>>>>>> Stashed changes
    const query = `
      INSERT INTO volunteerhoursubmission
      (StudentID, Organization, Hours, DateVolunteered, ExternSupEmail, ExternSupStatus, Description, GuidanceCounsellorFlag, GuidanceCounsellorID, supervisor_token, supervisor_token_expiry)
      VALUES ($1, $2, $3, $4, $5, 'Pending', $6, FALSE, 1, $7, $8)
      RETURNING *;
    `;

<<<<<<< Updated upstream
    const result = await pool.query(query, [studentId, organization, totalTime, date_volunteered, extern_sup_email, description]);
=======
    const result = await pool.query(query, [
      studentId,
      organization,
      totalTime,
      date_volunteered,
      extern_sup_email,
      description,
      supToken,
      tokenExpiry

    ]);
    // check if update was successful
    if (result.rowCount === 0){
      return res.status(404).json({
          success: false,
          message: 'Failed to update submission.'
      });
    }
>>>>>>> Stashed changes

    const submission = result.rows[0];
    console.log('Volunteer submission inserted:', submission);

    // get the student name and school from db based on userID
    const studentQuery ='SELECT StudentName, SchoolName FROM Student WHERE UserID=$1';
    const studentResult = await pool.query(studentQuery, [submission.studentid]);
    // check if select was successful
    if (studentResult.rowCount === 0){
      return res.status(404).json({
          success: false,
          message: 'Failed to send email.'
      });
    }

    const student = studentResult.rows[0];
    console.log('Student info retrived:', student);

    // try to send email to supervisor
    try {
      await sendEmail({
        to: submission.externsupemail,
        subject: 'Volunteer Hour Approval Request',
        html:`
            <p>Hello ${extern_sup_name},</p>
            <br>
            <p><strong>A student that has volunteered for ${submission.organization} requires your apporval for the following hours:</strong></p>
            <p>Student: ${student.studentname}</p>
            <p>School: ${student.schoolname}</p>
            <p>Hours: ${submission.hours}</p>
            <p>Date Volunteered: ${submission.datevolunteered}</p>
            <p>Description: ${submission.description}</p>
            <br>
            <p>Click the link below to open the review page:</p>
            <a href="http://178.128.232.57/approve/${submission.submissionid}/${supToken}" style="background-color: #8aaeeb; padding: 20px; text-align: center; color:#242425">Review Submission</a>
            <p><strong>This code will expire in 7 days.</strong></p>
            <p>Best regards,<br>Volunteer Hours Team</p>
        `
      });
    } catch (error) {
        console.error("Error sending supervisor email:",error); 
      }

    return res.status(201).json({
      success: true,
      message: 'Volunteer hours submitted successfully.',
      submission: result.rows[0],
    });
  } catch (error) {
    console.error('Error submitting volunteer hours:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while submitting hours.',
    });
  }
};

<<<<<<< Updated upstream
// Remove a submission from the table
const deleteSubmission = async (req, res) => {
  try {
    const { submissionId, studentId } = req.body;

    if (!submissionId || !studentId) {
      return res.status(400).json({
        success: false,
        message: "submissionId and studentId are required",
      });
    }

    const query = `
      DELETE FROM volunteerhoursubmission
      WHERE submissionid = $1 AND studentid = $2
      RETURNING submissionid;
    `;

    const result = await pool.query(query, [submissionId, studentId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Submission not found or does not belong to this student.",
      });
    }

    return res.json({
      success: true,
      message: "Submission deleted successfully.",
    });

  } catch (error) {
    console.error("Error deleting submission:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting submission.",
    });
  }
};

// Update the info in a table
const updateSubmission = async (req, res) => {
  try {
    const { studentId, submissionId } = req.params;

    const {
      organization,
      date_volunteered,
      hours,
      minutes,
      extern_sup_email,
      description
    } = req.body;

    if (!submissionId || !studentId) {
      return res.status(400).json({
        success: false,
        message: "submissionId and studentId are required"
      });
    }

    // Get the current status of the submission
    const checkQuery = `
      SELECT externsupstatus 
      FROM volunteerhoursubmission 
      WHERE submissionid = $1 AND studentid = $2;
    `;

    const check = await pool.query(checkQuery, [submissionId, studentId]);

    if (check.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    // Check if the student can edit it
    if (check.rows[0].externsupstatus !== "Pending") {
      return res.status(403).json({
        success: false,
        message: "Cannot edit after supervisor response."
      });
    }

    // Calculate hours
    const totalHours = parseFloat(hours) + (parseFloat(minutes) || 0) / 60;

    // Query to update the submission
    const updateQuery = `
      UPDATE volunteerhoursubmission
      SET organization = $1,
          datevolunteered = $2,
          hours = $3,
          externsupemail = $4,
          description = $5
      WHERE submissionid = $6 AND studentid = $7
      RETURNING *;
    `;

    const result = await pool.query(updateQuery, [
      organization,
      date_volunteered,
      totalHours,
      extern_sup_email,
      description,
      submissionId,
      studentId
    ]);

    return res.json({
      success: true,
      message: "Submission updated successfully",
      submission: result.rows[0]
    });

  } catch (err) {
    console.error("Error updating submission:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { submitHours, deleteSubmission, updateSubmission };

=======
// get the submission data for the review page
const getSubmissionDetails = async(req, res) =>{
  const {submissionid, token} =req.params;

  try {
    // get submission from db based on userID
    const subQuery ='SELECT s.StudentName, s.SchoolName, v.Hours, v.DateVolunteered, v.Description, v.Organization, v.supervisor_token_expiry FROM VolunteerHourSubmission v INNER JOIN Student s ON v.StudentID = s.UserID WHERE SubmissionID=$1 AND supervisor_token=$2';
    const subResult = await pool.query(subQuery, [submissionid, token]);
    // check if select was successful
    if (subResult.rowCount === 0){
      return res.status(404).json({
          success: false,
          message: 'Failed to get submission.'
      });
    }

    const submission = subResult.rows[0];

    // compare expiry date to current date to see if Supervisor is still allowed to update submission status
    const now = new Date();
    const expiry = new Date(submission.supervisor_token_expiry);
    if (now>expiry){
      return res.status(404).json({
          success: false,
          message: '7 day window has expired. The student must resubmit. '
      });
    }
    // send back submission data
    return res.status(200).json({
      success: true,
      message: 'Submission details successfully retrieved.',
      submission: submission,
    });
  } catch (error) {
    console.error('Error retreiving volunteer hour info:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while retreiving volunteer hour info.',
    });
  }
}

// update the submission data based on the info from supervisor review page
const supUpdatesHours = async(req, res) =>{
  const {submissionid, token, status, comments} =req.body;
  if(!submissionid || !token || !status){
            return res.status(422).json({
                success: false,
                message: 'All submissionid, token, and status are required.'
            });
        }

  try {
    // get submission from db based on userID, and token
    const checkQuery ='SELECT v.supervisor_token, v.supervisor_token_expiry FROM VolunteerHourSubmission v WHERE SubmissionID=$1 AND supervisor_token=$2';
    const checkResult = await pool.query(checkQuery, [submissionid, token]);
    // check if select was successful
    if (checkResult.rowCount === 0){
      return res.status(404).json({
          success: false,
          message: 'Failed to get submission.'
      });
    }

    const submission = checkResult.rows[0];

    // compare expiry date to current date to see if Supervisor is still allowed to update submission status
    const now = new Date();
    const expiry = new Date(submission.supervisor_token_expiry);
    if (now>expiry){
      return res.status(404).json({
          success: false,
          message: '7 day window has expired. The student must resubmit. '
      });
    }
    // update the submission
    const updateQuery = `
      UPDATE VolunteerHourSubmission
      SET
        ExternSupStatus = $1,
        ExternSupDate = $2,
        ExternSupComments =$3,
        supervisor_token = NULL, 
        supervisor_token_expiry = NULL
      WHERE SubmissionID = $4
      RETURNING *;
    `;
    const updateResult = await pool.query(updateQuery, [status, now, comments, submissionid]);
    
    // send back submission data
    return res.status(200).json({
      success: true,
      message: 'Submission details successfully updated.',
      submission: submission,
    });
  } catch (error) {
    console.error('Error retreiving volunteer hour info:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating volunteer hour info.',
    });
  }
}


module.exports = { submitHours, getSubmissionDetails, supUpdatesHours};
>>>>>>> Stashed changes
