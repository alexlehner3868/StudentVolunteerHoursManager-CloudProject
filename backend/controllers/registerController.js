const bcrypt = require("bcrypt");
const validator = require("validator");
const pool = require("../config/database");

const registerUser = async (req, res) => {
  const { email, password, type } = req.body;

  if (!email || !password || !type) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[{\]};:'",<.>/?\\|`~]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
    });
  }

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({
        error: "Email not found in the system. Please contact your school administrator.",
      });
    }

    const user = userResult.rows[0];

    // Normalize both DB type and request type
    const normalizeType = (t) =>
      t ? t.toLowerCase().replace(/[\s_]+/g, "").trim() : "";

    const dbType = normalizeType(user.type);
    const reqType = normalizeType(type);

    if (dbType !== reqType) {
      return res.status(403).json({
        error: `User type mismatch. Expected '${dbType}', received '${reqType}'. Please select the correct account type.`,
      });
    }

    if (user.passwordhash && user.passwordhash.trim() !== "") {
      return res.status(409).json({
        error: "This account has already been activated. Please log in instead.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("UPDATE users SET passwordhash = $1 WHERE email = $2", [
      hashedPassword,
      email,
    ]);

    console.log(`User activated: ${email} (${dbType})`);

    return res.status(200).json({
      message: "Account activated successfully.",
      email,
      type: dbType,
    });
  } catch (err) {
    console.error("Database error in registerUser:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { registerUser };
