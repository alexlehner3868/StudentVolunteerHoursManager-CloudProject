const pool = require("../config/database");

const addGuidanceInfo = async (req, res) => {
  const { email, counsellorname } = req.body;

  // --- 1️⃣ Input validation ---
  if (!email || !counsellorname) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // --- 2️⃣ Retrieve user from Users table ---
    const userResult = await pool.query(
      "SELECT UserID, Type FROM Users WHERE Email = $1",
      [email]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({
        error:
          "No user found with that email. Please contact your school administrator.",
      });
    }

    const user = userResult.rows[0];
    const userId = user.userid;

    // --- 3️⃣ Ensure correct user type ---
    if (user.type.toLowerCase() !== "guidance_counsellor") {
      return res.status(403).json({
        error:
          "User type mismatch. Only Guidance Counsellor accounts can update this information.",
      });
    }

    // --- 4️⃣ Check if GuidanceCounsellor entry exists ---
    const existing = await pool.query(
      "SELECT * FROM GuidanceCounsellor WHERE UserID = $1",
      [userId]
    );

    if (existing.rowCount === 0) {
      // Case A: No record yet → insert only CounsellorName
      await pool.query(
        `INSERT INTO GuidanceCounsellor (UserID, CounsellorName)
         VALUES ($1, $2)`,
        [userId, counsellorname]
      );
      console.log(`✅ Inserted new counsellor for ${email}`);
    } else {
      // Case B: Prepopulated → update only CounsellorName, keep SchoolID/SchoolName intact
      await pool.query(
        `UPDATE GuidanceCounsellor
         SET CounsellorName = $1
         WHERE UserID = $2`,
        [counsellorname, userId]
      );
      console.log(`✅ Updated counsellor name for ${email}`);
    }

    // --- 5️⃣ Success response ---
    return res
      .status(200)
      .json({ message: "✅ Guidance counsellor information saved successfully." });
  } catch (err) {
    console.error("❌ Error saving guidance info:", err);
    return res.status(500).json({ error: "Database error occurred." });
  }
};

module.exports = { addGuidanceInfo };
