const pool = require('../config/database');

const getMonthlyHours = async (req, res) => {
  const { studentId } = req.params;

  try {
    const query = `
      SELECT
        TO_CHAR(datevolunteered, 'YYYY-MM') AS month,
        CASE
          WHEN externsupstatus = 'Pending' THEN 'waiting_supervisor'
          WHEN externsupstatus = 'Approved' AND (guidancecounsellorapproved IS NULL OR guidancecounsellorapproved = 'Pending')
            THEN 'waiting_gc'
          WHEN externsupstatus = 'Approved' AND guidancecounsellorapproved = 'Accepted'
            THEN 'approved'
          WHEN externsupstatus = 'Rejected' OR guidancecounsellorapproved = 'Rejected'
            THEN 'rejected'
        END AS status,
        SUM(hours) AS hours
      FROM volunteerhoursubmission
      WHERE studentid = $1
      GROUP BY month, status
      ORDER BY month;
    `;
    const result = await pool.query(query, [studentId]);
    res.json(result.rows);

  } catch (err) {
    console.error('Error Getting Monthly View:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get summary (approved and total submitted hours) for a student
const getSummary = async (req, res) => {
  const { studentId } = req.params;

  try {
    const query = `
      SELECT 
        SUM(CASE WHEN externsupstatus = 'Approved' AND guidancecounsellorapproved = 'Accepted' THEN hours ELSE 0 END) AS approved_hours,
        SUM(hours) AS total_submitted
      FROM volunteerhoursubmission
      WHERE studentid = $1;
    `;
    const result = await pool.query(query, [studentId]);
    res.json(result.rows[0]);

  } catch (err) {
    console.error('Error Getting Agg Summary:', err);
    res.status(500).json({ error: err.message });
  }
};

const getStudentName = async (req, res) => {
  const { studentId } = req.params;

  try {
    const query = 'SELECT StudentName FROM student WHERE UserID = $1;';
    const result = await pool.query(query, [studentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ name: result.rows[0].studentname });
  } catch (err) {
    console.error('Error getting student name:', err);
    res.status(500).json({ error: err.message });
  }
};

const getProfile = async (req, res) => {
  const { studentId } = req.params;

  try {
    const query = `
      SELECT 
        s.StudentName AS name,
        s.SchoolName AS "SchoolName",
        s.GraduationDate AS "GraduationDate",
        u.Email AS email
      FROM Student s
      JOIN Users u ON s.UserID = u.UserID
      WHERE s.UserID = $1;
    `;

    const result = await pool.query(query, [studentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting student profile:', err);
    res.status(500).json({ error: err.message });
  }
};

const updateGraduationDate = async (req, res) => {
  const { studentId } = req.params;
  const { GraduationDate } = req.body;

  try {
    console.log("Updating GraduationDate:", GraduationDate, "for studentId:", studentId);

    const query = `
      UPDATE Student
      SET graduationdate = $1
      WHERE userid = $2
      RETURNING studentname, schoolname, graduationdate;
    `;

    const result = await pool.query(query, [GraduationDate, studentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const userResult = await pool.query('SELECT email FROM Users WHERE userid = $1', [studentId]);

    const profile = {
      name: result.rows[0].studentname,
      SchoolName: result.rows[0].schoolname,
      GraduationDate: result.rows[0].graduationdate,
      email: userResult.rows[0]?.email || ''
    };

    res.json(profile);
  } catch (err) {
    console.error('Error updating graduation date:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get individual volunteer submissions for StudentDashboard list
const getStudentSubmissions = async (req, res) => {
  const { studentId } = req.params;

  try {
    const query = `
      SELECT 
        submissionid,
        organization,
        datevolunteered,
        hours,
        externsupstatus,
        guidancecounsellorapproved
      FROM volunteerhoursubmission
      WHERE studentid = $1
      ORDER BY datevolunteered DESC;
    `;

    const result = await pool.query(query, [studentId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error getting student submissions:", err);
    res.status(500).json({ error: err.message });
  }
};






module.exports = { getMonthlyHours, getSummary, getStudentName, getProfile, updateGraduationDate, getStudentSubmissions };
