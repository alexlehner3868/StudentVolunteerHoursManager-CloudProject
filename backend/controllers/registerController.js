const bcrypt = require("bcrypt");
const validator = require("validator");
const pool = require("../config/database");

const registerUser = async (req, res) => {
  const { email, password, type } = req.body;

  // --- 1️⃣ Validate required fields ---
  if (!email || !password || !type) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // --- 2️⃣ Validate email format ---
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  // --- 3️⃣ Validate password complexity ---
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[{\]};:'",<.>/?\\|`~]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
    });
  }

  try {
    // --- 4️⃣ Check if user exists in Users table ---
    const existingUser = await pool.query(
      "SELECT * FROM Users WHERE Email = $1",
      [email]
    );

    if (existingUser.rowCount === 0) {
      return res.status(404).json({
        error:
          "Email not found. Please contact your school administrator to be added to the system.",
      });
    }

    const user = existingUser.rows[0];

    // --- 5️⃣ Check if password is already set (means activated) ---
    if (user.passwordhash && user.passwordhash.trim() !== "") {
      return res.status(409).json({
        error: "This account has already been activated. Please log in instead.",
      });
    }

    // --- 6️⃣ Hash and update password ---
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "UPDATE Users SET PasswordHash = $1 WHERE Email = $2",
      [hashedPassword, email]
    );

    console.log(`✅ User registered: ${email}`);

    // --- 7️⃣ Respond to client ---
    return res.status(200).json({
      message: "✅ Account activated successfully. You can now log in.",
      email,
      type: user.type || type,
    });
  } catch (err) {
    console.error("❌ Database error:", err);
    return res.status(500).json({ error: "Internal server error occurred" });
  }
};

module.exports = { registerUser };
