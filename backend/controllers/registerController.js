const bcrypt = require("bcrypt");
const validator = require("validator");
const pool = require("../config/database");

const registerUser = async (req, res) => {
  const { email, password, type } = req.body;

  // --- 1️⃣ Basic field check ---
  if (!email || !password || !type) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // --- 2️⃣ Validate email format ---
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  // --- 3️⃣ Validate password strength ---
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[{\]};:'",<.>/?\\|`~]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
    });
  }

  try {
    // --- 4️⃣ Look up user in Users table ---
    const userResult = await pool.query(
      "SELECT * FROM Users WHERE Email = $1",
      [email]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({
        error:
          "Email not found in the system. Please contact your school administrator to be added.",
      });
    }

    const user = userResult.rows[0];

    // --- 5️⃣ Validate type consistency ---
    const dbType = user.type?.toLowerCase().trim();
    const reqType = type.toLowerCase().trim();
    if (dbType !== reqType) {
      return res.status(403).json({
        error: `User type mismatch. Expected '${dbType}', received '${reqType}'. Please select the correct account type.`,
      });
    }

    // --- 6️⃣ Check if already activated (password set) ---
    if (user.passwordhash && user.passwordhash.trim() !== "") {
      return res.status(409).json({
        error:
          "This account has already been activated. Please log in instead.",
      });
    }

    // --- 7️⃣ Hash and update password ---
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "UPDATE Users SET PasswordHash = $1 WHERE Email = $2",
      [hashedPassword, email]
    );

    console.log(`✅ User activated: ${email} (${dbType})`);

    // --- 8️⃣ Respond to frontend ---
    return res.status(200).json({
      message: "✅ Account activated successfully.",
      email,
      type: dbType,
    });
  } catch (err) {
    console.error("❌ Database error in registerUser:", err);
    return res
      .status(500)
      .json({ error: "Internal server error occurred. Please try again." });
  }
};

module.exports = { registerUser };
