const pool = require('../config/database');

// Submit volunteer hours
const submitHours = async (req, res) => {
    try {
        const { studentId, activityName, hours, date, description } = req.body;

        if (!studentId || !activityName || !hours || !date) {
            return res.status(422).json({
                success: false,
                message: 'Student ID, activity name, hours, and date are required.'
            });
        }

        const query = `INSERT INTO volunteerhoursubmission (StudentID, Hours, DateVolunteered, ExternSupEmail, ExternSupStatus, Description, GuidanceCounsellorFlag) VALUES ($1, $2, $3, $4, 'Pending', $5, FALSE) RETURNING *;`;


        const result = await pool.query(query, [studentID, totalTime,date_volunteered, extern_sup_email, description]);

        return res.status(201).json({
            success: true,
            message: 'Volunteer hours submitted successfully.',
            submission: result.rows[0]
        });
    } catch (error) {
        console.error('Error submitting volunteer hours:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while submitting hours.'
        });
    }
};


module.exports = {submitHours};

