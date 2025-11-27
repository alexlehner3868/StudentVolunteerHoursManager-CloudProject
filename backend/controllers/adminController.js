const pool = require('../config/database');
const { sendEmail } = require("../config/sendGrid");

const createUser = async (req, res) => {
  try {
    const { role, email, name, schoolid, schoolname } = req.body;

    // Validate fields
    if (!role || !email || !name) {
      return res.status(422).json({ message: "Missing required fields." });
    }

    // Insert into Users table
    const insertUserQuery = `
      INSERT INTO Users (Type, Email, PasswordHash)
      VALUES ($1, $2, '')
      RETURNING UserID;
    `;
    const userResult = await pool.query(insertUserQuery, [role, email]);
    const newUserId = userResult.rows[0].userid;

    // Insert into the correct role-specific table
    if (role.toLowerCase() === "student") {
      const insertStudentQuery = `
        INSERT INTO Student (UserID, StudentName, SchoolID, SchoolName)
        VALUES ($1, $2, $3, $4);
      `;
      await pool.query(insertStudentQuery, [
        newUserId,
        name,
        schoolid,
        schoolname
      ]);
    } else if (role.toLowerCase() === "guidancecounsellor") {
      const insertGCQuery = `
        INSERT INTO GuidanceCounsellor (UserID, CounsellorName, SchoolID, SchoolName)
        VALUES ($1, $2, $3, $4);
      `;
      await pool.query(insertGCQuery, [
        newUserId,
        name,
        schoolid,
        schoolname
      ]);
    }

    // Use SendGrid to send  registration email
    await sendEmail({
      to: email,
      subject: "Welcome to VolunCloud!",
      text: `Hello ${name}, you're school has added you to VolunCloud: the student volunteer hour management system. 
Visit the link to finish setting up your login.`,
      html: `
        <p>Hello ${name},</p>
        <p>You have been added to the <strong>Student Volunteer Hours Manager</strong> system.</p>
        <p>Please click the button below to finish creating your account:</p>

        <p>
          <a href="http://178.128.232.57/register"
             style="padding: 12px 20px; background: #4CAF50; color: white; text-decoration: none; 
                    border-radius: 6px; font-size: 16px;">
            Set Up Your Account
          </a>
        </p>

        <br/>
        <p>— Student Volunteer Hours Manager Team</p>
      `
    });

    return res.status(200).json({
      success: true,
      message: "User created and email sent successfully",
      userId: newUserId
    });

  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createUser };
