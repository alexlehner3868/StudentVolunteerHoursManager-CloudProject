// backend/controllers/checkEmailController.js
const pool = require("../config/database");

const checkEmail = async (req, res) => {
  const { email, type } = req.body;

  if (!email || !type)
    return res.status(400).json({ error: "Missing required fields." });

  try {
    // Case-insensitive lookup for both email and type
    const user = await pool.query(
      "SELECT * FROM Users WHERE LOWER(Email) = LOWER($1) AND LOWER(Type) = LOWER($2)",
      [email, type]
    );

    if (user.rowCount === 0) {
      return res.status(404).json({
        error:
          "User not found in system. Please contact your school administrator to be added.",
      });
    }

    const dbUser = user.rows[0];

    // If already activated (password not empty)
    if (dbUser.passwordhash && dbUser.passwordhash.trim() !== "") {
      return res.status(409).json({
        error:
          "This account has already been activated. Please log in instead.",
      });
    }

    console.log(`✅ Email verified: ${email} (${dbUser.type})`);

    return res.status(200).json({
      message: "✅ Email verified successfully.",
      email: dbUser.email,
      type: dbUser.type.toLowerCase(),
    });
  } catch (err) {
    console.error("❌ Error verifying email:", err);
    return res.status(500).json({ error: "Database error occurred." });
  }
};

module.exports = { checkEmail };
