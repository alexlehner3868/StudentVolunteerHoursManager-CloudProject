const pool = require('../config/database');

const getProfile = async (req, res) => {
  try {
    const { gcId } = req.params;

    // Query database to get info of the counsellor
    const query = `
      SELECT 
        u.userid,
        u.email,
        gc.counsellorname AS name,
        gc.schoolid,
        gc.schoolname
      FROM Users u
      JOIN GuidanceCounsellor gc
          ON u.userid = gc.userid
      WHERE u.userid = $1
    `;

    // Get resposne from database
    const result = await pool.query(query, [gcId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Guidance counsellor not found" });
    }

    return res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error("Error fetching GC profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Return all counsellors at a student's school
const getCounsellorsAtStudentSchool = async (req, res) => {
  const { studentId } = req.params;

  try {
    // Get student's school
    const schoolResult = await pool.query('SELECT SchoolID FROM Student WHERE UserID = $1', [studentId]);
    if (schoolResult.rows.length === 0) return res.status(404).json({ error: 'Student not found' });

    const schoolID = schoolResult.rows[0].schoolid;

    // Get GC at the school 
    const gcResult = await pool.query(`
      SELECT g.UserID, g.CounsellorName AS name, u.Email
      FROM GuidanceCounsellor g
      JOIN Users u ON g.UserID = u.UserID
      WHERE g.SchoolID = $1
    `, [schoolID]);

    res.json(gcResult.rows);
  } catch (err) {
    console.error('Error fetching guidance counsellors:', err);
    res.status(500).json({ error: err.message });
  }
};

// End point to return all students who belong to the guidance counsellor's school
const getStudentsAtCounsellorSchool = async (req, res) => {
  const { counsellorId } = req.query;

  try {
    // Get school 
    const schoolQuery = `
      SELECT SchoolID
      FROM GuidanceCounsellor
      WHERE UserID = $1
    `;
    const schoolResult = await pool.query(schoolQuery, [counsellorId]);

    if (schoolResult.rows.length === 0) {
      return res.status(404).json({ error: "Guidance Counsellor not found" });
    }

    const schoolID = schoolResult.rows[0].schoolid;

    // Get students at the school
    const studentsQuery = `
      SELECT UserID, StudentName
      FROM Student
      WHERE SchoolID = $1
      ORDER BY StudentName
    `;
    const studentsResult = await pool.query(studentsQuery, [schoolID]);

    res.json({ students: studentsResult.rows });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: err.message });
  }
};


module.exports = { getProfile, getCounsellorsAtStudentSchool, getStudentsAtCounsellorSchool};
