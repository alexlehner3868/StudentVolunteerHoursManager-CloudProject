const pool = require('../config/database');

const getProfile = async (req, res) => {
  const { gcId } = req.params;

  try {
    const query = `
      SELECT 
        g.CounsellorName AS name,
        g.SchoolName,
        g.SchoolID,
        u.Email
      FROM GuidanceCounsellor g
      JOIN Users u ON g.UserID = u.UserID
      WHERE g.UserID = $1;
    `;
    const result = await pool.query(query, [gcId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Guidance Counsellor not found' });
    }

    const counsellor = result.rows[0];

    const studentCountQuery = 'SELECT COUNT(*) AS studentcount FROM Student WHERE SchoolID = $1';
    const countResult = await pool.query(studentCountQuery, [counsellor.SchoolID]);

    res.json({
      name: counsellor.name,
      email: counsellor.email,
      SchoolName: counsellor.SchoolName,
      StudentCount: parseInt(countResult.rows[0].studentcount, 10)
    });
  } catch (err) {
    console.error('Error getting GC profile:', err);
    res.status(500).json({ error: err.message });
  }
};


const getCounsellorsAtStudentSchool = async (req, res) => {
  const { studentId } = req.params;

  try {
    const schoolResult = await pool.query('SELECT SchoolID FROM Student WHERE UserID = $1', [studentId]);
    if (schoolResult.rows.length === 0) return res.status(404).json({ error: 'Student not found' });

    const schoolID = schoolResult.rows[0].schoolid;

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
