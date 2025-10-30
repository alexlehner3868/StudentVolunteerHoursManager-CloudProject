const bcrypt = require("bcrypt");
const validator = require("validator");
const pool = require("../config/database");

const registerUser = async (req, res) => {
  const { fullname, email, password } = req.body;

  // --- 1️⃣ Field validation ---
  if (!fullname || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  if (!validator.isEmail(email))
    return res.status(400).json({ error: "Invalid email address" });

  // --- 2️⃣ Password complexity ---
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[{\]};:'",<.>/?\\|`~]).{8,}$/;
  if (!passwordRegex.test(password))
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
    });

  try {
    // --- 3️⃣ Look up user by email ---
    const existingUser = await pool.query(
      "SELECT * FROM Users WHERE Email = $1",
      [email]
    );

    if (existingUser.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Email not found. Please contact your school administrator." });
    }

    const user = existingUser.rows[0];

    // --- 4️⃣ Instead of checking 'isactivated', check if PasswordHash is null ---
    if (user.passwordhash !== null) {
      return res
        .status(409)
        .json({ error: "This account has already been activated. Please log in instead." });
    }

    // --- 5️⃣ Verify name consistency based on type ---
    if (user.type === "student") {
      const match = await pool.query(
        "SELECT 1 FROM Student WHERE UserID = $1 AND LOWER(StudentName) = LOWER($2)",
        [user.userid, fullname]
      );
      if (match.rowCount === 0) {
        return res.status(403).json({
          error: "Name does not match our student records. Please check your entry.",
        });
      }
    } else if (user.type === "guidance_counsellor") {
      const match = await pool.query(
        "SELECT 1 FROM GuidanceCounsellor WHERE UserID = $1 AND LOWER(CounsellorName) = LOWER($2)",
        [user.userid, fullname]
      );
      if (match.rowCount === 0) {
        return res.status(403).json({
          error: "Name does not match our guidance counsellor records.",
        });
      }
    }

    // --- 6️⃣ Hash password and update ---
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "UPDATE Users SET PasswordHash = $1 WHERE Email = $2",
      [hashedPassword, email]
    );

    return res.status(200).json({
      message: "✅ Account activated successfully. You can now log in.",
      email,
      type: user.type,
    });
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ error: "Database error occurred" });
  }
};

module.exports = { registerUser };
