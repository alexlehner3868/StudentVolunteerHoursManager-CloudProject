const pool = require('../config/database');

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

    // Insert new submission into the table
    const query = `
      INSERT INTO volunteerhoursubmission
      (StudentID, Organization, Hours, DateVolunteered, ExternSupEmail, ExternSupStatus, Description, GuidanceCounsellorFlag, GuidanceCounsellorID)
      VALUES ($1, $2, $3, $4, $5, 'Pending', $6, FALSE, 1)
      RETURNING *;
    `;

    const result = await pool.query(query, [studentId, organization, totalTime, date_volunteered, extern_sup_email, description]);

    console.log('Volunteer submission inserted:', result.rows[0]);

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

