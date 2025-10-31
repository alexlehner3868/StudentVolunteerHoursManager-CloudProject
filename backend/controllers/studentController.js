const pool = require("../config/database");

const addStudentInfo = async (req, res) => {
  const { email, studentname, graduationdate } = req.body;

  // --- 1️⃣ Input validation ---
  if (!email || !studentname) {
    return res.status(400).json({ error: "Missing required fields." });
  }

    // 🔹 Validate that name has letters only
  const nameRegex = /^[A-Za-z\s'-]+$/;
  if (!nameRegex.test(studentname)) {
    return res.status(400).json({
      error: "Invalid name. Student name must contain only letters and spaces.",
    });
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
    if (user.type.toLowerCase() !== "student") {
      return res.status(403).json({
        error:
          "User type mismatch. Only Student accounts can update this information.",
      });
    }

    // --- 4️⃣ Validate graduation date (cannot be in the past) ---
    if (graduationdate) {
      const today = new Date().toISOString().split("T")[0];
      if (graduationdate < today) {
        return res.status(400).json({
          error: "Graduation date cannot be in the past.",
        });
      }
    }

    // --- 5️⃣ Check if Student entry exists ---
    const existing = await pool.query("SELECT * FROM Student WHERE UserID = $1", [userId]);

    if (existing.rowCount === 0) {
      // Case A: Not prepopulated → insert minimal record
      await pool.query(
        `INSERT INTO Student (UserID, StudentName, GraduationDate)
         VALUES ($1, $2, $3)`,
        [userId, studentname, graduationdate || null]
      );
      console.log(`✅ Inserted new student record for ${email}`);
    } else {
      // Case B: Prepopulated → only update name/date
      await pool.query(
        `UPDATE Student
         SET StudentName = $1,
             GraduationDate = $2
         WHERE UserID = $3`,
        [studentname, graduationdate || null, userId]
      );
      console.log(`✅ Updated student info for ${email}`);
    }

    // --- 6️⃣ Send success response ---
    return res
      .status(200)
      .json({ message: "✅ Student information saved successfully." });
  } catch (err) {
    console.error("❌ Error saving student info:", err);
    return res.status(500).json({ error: "Database error occurred." });
  }
};

module.exports = { addStudentInfo };
