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

    const query = `
      INSERT INTO volunteerhoursubmission
      (StudentID, Organization, Hours, DateVolunteered, ExternSupEmail, ExternSupStatus, Description, GuidanceCounsellorFlag)
      VALUES ($1, $2, $3, $4, $5, 'Pending', $6, FALSE)
      RETURNING *;
    `;

    const result = await pool.query(query, [
      studentId,
      organization,
      totalTime,
      date_volunteered,
      extern_sup_email,
      description,
    ]);

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

module.exports = { submitHours };
