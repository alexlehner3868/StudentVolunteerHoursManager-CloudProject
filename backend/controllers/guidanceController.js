//StudentVolunteerHoursManager-CloudProject/backend/controllers/guidanceController.js
const pool = require("../config/database");

const addGuidanceInfo = async (req, res) => {
  const { email, counsellorname, schoolid, schoolname } = req.body;

  if (!email || !counsellorname || !schoolid || !schoolname)
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

    // --- 2️⃣ Insert or update Guidance info ---
    await pool.query(
      `INSERT INTO GuidanceCounsellor (UserID, CounsellorName, SchoolID, SchoolName)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (UserID) DO UPDATE SET
         CounsellorName = EXCLUDED.CounsellorName,
         SchoolID = EXCLUDED.SchoolID,
         SchoolName = EXCLUDED.SchoolName`,
      [userId, counsellorname, schoolid, schoolname]
    );

    res.status(200).json({
      message: "✅ Guidance counsellor info saved successfully",
    });
  } catch (err) {
    console.error("❌ Error saving guidance info:", err);
    res.status(500).json({ error: "Database error occurred" });
  }
};

module.exports = { addGuidanceInfo };
