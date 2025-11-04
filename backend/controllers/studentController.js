const pool = require("../config/database");

const addStudentInfo = async (req, res) => {
  const { email, studentname, graduationdate } = req.body;
  console.log("📩 Incoming request /api/student-info:", req.body);

  if (!email || !studentname) {
    console.warn("⚠️ Missing email or studentname");
    return res.status(400).json({ error: "Missing required fields." });
  }

  const nameRegex = /^[A-Za-z\s'-]+$/;
  if (!nameRegex.test(studentname)) {
    console.warn("⚠️ Invalid name format:", studentname);
    return res.status(400).json({
      error:
        "Invalid name. Student name must contain only letters, spaces, hyphens, or apostrophes.",
    });
  }

  try {
    // ✅ Verify DB connection
    await pool.query("SELECT 1");
    console.log("🟢 Database connection confirmed.");

    // ✅ Check if user exists
    let userRes;
    try {
      userRes = await pool.query(
        "SELECT userid, type FROM users WHERE email = $1",
        [email]
      );
    } catch (dbErr) {
      console.error("❌ Query error [users lookup]:", dbErr.message);
      return res.status(500).json({ error: "Database lookup failed (users)." });
    }

    if (userRes.rowCount === 0) {
      console.warn("⚠️ No user found for:", email);
      return res
        .status(404)
        .json({ error: "User not found. Please contact your administrator." });
    }

    const user = userRes.rows[0];
    const userId = user.userid;
    const type = (user.type || "").toLowerCase();

    console.log("🧠 User found:", { userId, type, email });

    if (type !== "student") {
      console.warn("🚫 Non-student type attempted student-info:", type);
      return res
        .status(403)
        .json({ error: "Only student accounts can add student info." });
    }

    // ✅ Graduation date validation
    if (graduationdate) {
      const today = new Date().toISOString().split("T")[0];
      if (new Date(graduationdate) < new Date(today)) {
        console.warn("⚠️ Invalid graduation date:", graduationdate);
        return res
          .status(400)
          .json({ error: "Graduation date cannot be in the past." });
      }
    }

    const gradDate =
      graduationdate && graduationdate.trim() !== "" ? graduationdate : null;

    // ✅ Check if student already exists
    let existing;
    try {
      existing = await pool.query(
        "SELECT userid FROM student WHERE userid = $1",
        [userId]
      );
    } catch (dbErr) {
      console.error("❌ Query error [student lookup]:", dbErr.message);
      return res.status(500).json({ error: "Database lookup failed (student)." });
    }

    if (existing.rowCount === 0) {
      console.log("🆕 Inserting new student record:", { userId, studentname, gradDate });
      try {
        await pool.query(
          "INSERT INTO student (userid, studentname, graduationdate) VALUES ($1, $2, $3)",
          [userId, studentname, gradDate]
        );
      } catch (dbErr) {
        console.error("❌ Insert failed:", dbErr.message);
        return res.status(500).json({ error: "Failed to insert student record." });
      }
      console.log(`✅ Inserted new student record for ${email}`);
    } else {
      console.log("✏️ Updating existing student record:", { userId, studentname, gradDate });
      try {
        await pool.query(
          "UPDATE student SET studentname = $1, graduationdate = $2 WHERE userid = $3",
          [studentname, gradDate, userId]
        );
      } catch (dbErr) {
        console.error("❌ Update failed:", dbErr.message);
        return res.status(500).json({ error: "Failed to update student record." });
      }
      console.log(`✅ Updated student record for ${email}`);
    }

    return res
      .status(200)
      .json({ message: "✅ Student information saved successfully." });
  } catch (err) {
    console.error("💥 Unhandled error in addStudentInfo:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = { addStudentInfo };
