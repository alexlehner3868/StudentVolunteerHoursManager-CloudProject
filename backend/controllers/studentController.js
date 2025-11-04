const pool = require("../config/database");

const addStudentInfo = async (req, res) => {
  const { email, studentname, graduationdate } = req.body;

  // --- 1️⃣ Input validation ---
  if (!email || !studentname) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // --- 2️⃣ Validate name ---
  const nameRegex = /^[A-Za-z\s'-]+$/;
  if (!nameRegex.test(studentname)) {
    return res.status(400).json({
      error: "Invalid name. Student name must contain only letters and spaces.",
    });
  }

  try {
    // --- 3️⃣ Retrieve user ---
    const userResult = await pool.query(
      'SELECT "UserID", "Type" FROM "Users" WHERE "Email" = $1',
      [email]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({
        error: "No user found with that email. Please contact your school administrator.",
      });
    }

    const user = userResult.rows[0];
    const userId = user.userid || user.UserID;

    // --- 4️⃣ Normalize Type for tolerance (spaces, underscores, case) ---
    const normalizeType = (t) =>
      t ? t.toLowerCase().replace(/[\s_]+/g, "").trim() : "";

    const dbType = normalizeType(user.type);
    if (dbType !== "student") {
      return res.status(403).json({
        error: "User type mismatch. Only Student accounts can update this information.",
      });
    }

    // --- 5️⃣ Validate graduation date (cannot be in the past) ---
    if (graduationdate) {
      const today = new Date().toISOString().split("T")[0];
      if (new Date(graduationdate) < new Date(today)) {
        return res
          .status(400)
          .json({ error: "Graduation date cannot be in the past." });
      }
    }

    // --- 6️⃣ Prepare graduation date safely ---
    const gradDate =
      graduationdate && graduationdate.trim() !== "" ? graduationdate : null;

    // --- 7️⃣ Check if Student record exists ---
    const existing = await pool.query("SELECT * FROM student WHERE userid = $1", [userId]);

    if (existing.rowCount === 0) {
      // Insert new record
      await pool.query(
        "INSERT INTO student (userid, studentname, graduationdate) VALUES ($1, $2, $3)",
        [userId, studentname, gradDate]
      );
      console.log(`✅ Inserted new student record for ${email}`);
    } else {
      // Update existing record
      await pool.query(
        "UPDATE student SET studentname = $1, graduationdate = $2 WHERE userid = $3",
        [studentname, gradDate, userId]
      );
      console.log(`✅ Updated student info for ${email}`);
    }

    // --- 8️⃣ Success ---
    return res
      .status(200)
      .json({ message: "✅ Student information saved successfully." });
  } catch (err) {
    console.error("❌ Error saving student info:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { addStudentInfo };
