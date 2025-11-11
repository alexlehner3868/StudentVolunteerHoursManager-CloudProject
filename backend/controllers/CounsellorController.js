const pool = require('../config/database');

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
                v.GuidanceCounsellorComments
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

const updateSubmission = async(req,res)=>{
    try {
        // check counsellorId is not empty
        const { submissionid, guidancecounsellorid, guidancecounsellorcomments, guidancecounsellorapproved}=req.body;
        if(!submissionid){
            return res.status(422).json({
                message: 'submissionid is required.'
            });
        }
        else if(!guidancecounsellorapproved){
            return res.status(422).json({
                message: 'guidancecounsellorapproved status is required.'
            });
        }

        // get the submission data 
        const submissionQuery ='SELECT SubmissionID FROM VolunteerHourSubmission WHERE SubmissionID=$1';
        const submissionResult = await pool.query(submissionQuery, [submissionid]);

        // check if submission exists
        if (submissionResult.rowCount === 0){
            return res.status(404).json({
                message: 'Submission does not exist.'
            });

        }

        // update submission data 
        const subUpdateQuery =`
            UPDATE VolunteerHourSubmission
            SET
                GuidanceCounsellorApproved=$1,
                GuidanceCounsellorComments=$2,
                VerdictDate=$3
            WHERE SubmissionID=$4 AND GuidanceCounsellorID=$5
            RETURNING GuidanceCounsellorApproved`;
            const verdictdate = new Date();
        const subUpdateResult = await pool.query(subUpdateQuery, [ guidancecounsellorapproved, guidancecounsellorcomments, verdictdate, submissionid, guidancecounsellorid]);

        // check if submission was updated
        if (subUpdateResult.rowCount === 0){
            return res.status(404).json({
                message: 'Submission was not updated'
            });

        }
        // TO DO: Implment SendGrid email to student
        const status = subUpdateResult.rows[0].guidancecounsellorapproved;
        if (status === 'Approved' || status === 'Denied'){
            console.log("student needs an email")
        }

        // return valid response with submissions
        return res.status(200).json({
            message: 'Submission Update Sucessful'
        }); 

    } catch (error) {
        console.error("Error updating submissions:",error);
        return res.status(500).json({
            message: 'Internal server error'
        });   
    }
}

module.exports = {getSubmissions, updateSubmission};