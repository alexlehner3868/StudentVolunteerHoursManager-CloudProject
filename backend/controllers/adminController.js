const pool = require('../config/database');

const createUser = async (req, res) => {
  try {
    const { role, email, name, schoolid, schoolname } = req.body;

    // Validate fields
    if (!role || !email || !name) {
      return res.status(422).json({ message: "Missing required fields." });
    }

    // Insert into users table
    const insertUserQuery = `
      INSERT INTO Users (Type, Email, PasswordHash)
      VALUES ($1, $2, '')
      RETURNING UserID;
    `;

    const userResult = await pool.query(insertUserQuery, [role, email]);
    const newUserId = userResult.rows[0].userid;

    //  Insert into role specific table
    if (role.toLowerCase() === 'student') {
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
    } 
    else if (role.toLowerCase() === 'guidancecounsellor') {
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

    return res.status(200).json({
      success: true,
      message: "User created successfully",
      userId: newUserId
    });

  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {createUser};
