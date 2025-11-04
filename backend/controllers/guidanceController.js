const pool = require("../config/database");

const addGuidanceInfo = async (req, res) => {
  const { email, counsellorname, schoolid, schoolname } = req.body;

  if (!email || !counsellorname) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const nameRegex = /^[A-Za-z\s'-]+$/;
  if (!nameRegex.test(counsellorname)) {
    return res.status(400).json({
      error: "Invalid name. Counsellor name must contain only letters and spaces.",
    });
  }

  try {
    const userResult = await pool.query(
      "SELECT userid, type FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({
        error: "No user found with that email. Please contact your school administrator.",
      });
    }

    const user = userResult.rows[0];
    const userId = user.userid || user.UserID;

    // ✅ Normalize both DB and expected type
    const normalizeType = (t) =>
      t ? t.toLowerCase().replace(/[\s_]+/g, "").trim() : "";

    const dbType = normalizeType(user.type);
    if (dbType !== "guidancecounsellor") {
      return res.status(403).json({
        error: "User type mismatch. Only Guidance Counsellor accounts can update this information.",
      });
    }

    const existing = await pool.query(
      "SELECT * FROM guidancecounsellor WHERE userid = $1",
      [userId]
    );

    if (existing.rowCount === 0) {
      await pool.query(
        "INSERT INTO guidancecounsellor (userid, counsellorname, schoolid, schoolname) VALUES ($1, $2, $3, $4)",
        [userId, counsellorname, schoolid || null, schoolname || null]
      );
      console.log(`✅ Inserted new counsellor for ${email}`);
    } else {
      await pool.query(
        "UPDATE guidancecounsellor SET counsellorname = $1, schoolid = $2, schoolname = $3 WHERE userid = $4",
        [counsellorname, schoolid || null, schoolname || null, userId]
      );
      console.log(`✅ Updated counsellor info for ${email}`);
    }

    return res
      .status(200)
      .json({ message: "✅ Guidance counsellor information saved successfully." });
  } catch (err) {
    console.error("❌ Error saving guidance info:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { addGuidanceInfo };
