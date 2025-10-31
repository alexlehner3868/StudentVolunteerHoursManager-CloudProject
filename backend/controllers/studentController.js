// StudentVolunteerHoursManager-CloudProject/backend/controllers/studentController.js
const pool = require("../config/database");

const addStudentInfo = async (req, res) => {
  const { email, studentname, schoolid, schoolname, graduationdate } = req.body;

  if (!email || !studentname || !schoolid || !schoolname)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    // --- 1️⃣ Get UserID from email ---
    const userResult = await pool.query(
      "SELECT UserID FROM Users WHERE Email = $1",
      [email]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({
        error: "No user found with that email. Please register first.",
      });
    }

    const userId = userResult.rows[0].userid;

    // --- 2️⃣ Insert or update Student info ---
    await pool.query(
      `INSERT INTO Student (UserID, StudentName, SchoolID, SchoolName, GraduationDate)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (UserID) DO UPDATE SET
         StudentName = EXCLUDED.StudentName,
         SchoolID = EXCLUDED.SchoolID,
         SchoolName = EXCLUDED.SchoolName,
         GraduationDate = EXCLUDED.GraduationDate`,
      [userId, studentname, schoolid, schoolname, graduationdate || null]
    );

    res.status(200).json({
      message: "✅ Student info saved successfully",
    });
  } catch (err) {
    console.error("❌ Error saving student info:", err);
    res.status(500).json({ error: "Database error occurred" });
  }
};

module.exports = { addStudentInfo };
