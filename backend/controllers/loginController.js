const pool = require('../config/databse');
const bcrypt = require('bcryptjs');

// handle user login
const login = async(req,res)=>{
    try {
        // get email and password from request and check that they  arent empty
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(422).json({
                success: false,
                message: 'Both email and password are required.'
            });
        }

        // get the user from db based on email
        const userQuery ='SELECT UserID, Type, Email, PasswordHash FROM Users WHERE Email=$1';
        const userResult = await pool.query(userQuery, [email.toLowerCase()]);

        // check if user exists
        if (userResult.rowCount === 0){
            return res.status(404).json({
                success: false,
                message: 'Email does not exist.'
            });

        }

        const user = userResult.rows[0];

        // compare passowrds
        const passwordMatch = await bcrypt.compare(password, user.passwordhash);
        if(!passwordMatch){
            return res.status(401).json({
                success: false,
                message: 'Password is not valid.'
            });
        }

        // set up user details to send in response
        let userDetails={
            userId: user.userid,
            email: user.email,
            type: user.type
        }
        // set up additional details based on whether user is a student or counsellor
        if (user.type ==='Student'){
            // get the student from db based on userId
            const studentQuery ='SELECT UserID, StudentName, SchoolID, SchoolName, GraduationDate FROM Student WHERE UserID=$1';
            const studentResult = await pool.query(studentQuery, [user.userid]);
            
            // check if student exists
            if (studentResult.rowCount=== 0){
                return res.status(404).json({
                    success: false,
                    message: 'Student does not exist.'
                });
            }
            // update the details before sending the response
            const student =studentResult.rows[0];
            userDetails={
                ...userDetails,
                name: student.studentname,
                schoolId: student.schoolid,
                schoolName: student.schoolname,
                graduationDate: student.graduationdate
            };
        }
        else if (user.type ==='GuidanceCounsellor'){
            // get the student from db based on userId
            const counsellorQuery ='SELECT UserID, CounsellorName, SchoolID, SchoolName FROM GuidanceCounsellor WHERE UserID=$1';
            const counsellorResult = await pool.query(counsellorQuery, [user.userid]);
            
            // check if student exists
            if (counsellorResult.rowCount === 0){
                return res.status(404).json({
                    success: false,
                    message: 'Counsellor does not exist.'
                });
            }
            // update the details before sending the response
            const counsellor =counsellorResult.rows[0];
            userDetails={
                ...userDetails,
                name: counsellor.counsellorname,
                schoolId: counsellor.schoolid,
                schoolName: counsellor.schoolname
            };
        }
        // return valid response with user details
        return res.status(200).json({
            success: true,
            message: 'Login Sucessful',
            user: userDetails
        }); 

    } catch (error) {
        console.error("Error Loging in:",error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });   
    }
}

// handle user forgot password
const forgotPassword = async(req,res)=>{
    try {
        // get email from request and check that its not empty
        const {email}=req.body;
        if(!email){
            return res.status(422).json({
                success: false,
                message: 'Email is required.'
            });
        }

        // get the user from db based on email
        const userQuery ='SELECT UserID, Type, Email, PasswordHash FROM Users WHERE Email=$1';
        const userResult = await pool.query(userQuery, [email.toLowerCase()]);

        // check if user exists
        if (userResult.rowCount === 0){
            return res.status(404).json({
                success: false,
                message: 'Email does not exist.'
            });
        }

        const user = userResult.rows[0];
        // TO DO IMPLEMENT SENDGRID must implement email expiry and email clear later 
        
        // return valid response with user details
        return res.status(200).json({
            success: true,
            message: 'Password resent email sent'
        }); 

    } catch (error) {
        console.error("Error Loging in:",error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });   
    }
}

// handle user password update
const passwordReset = async(req,res)=>{
    try {
        // get email and password from request and check that they  arent empty
        const {email,verificationCode,newPassword}=req.body;
        if(!email || !verificationCode || !newPassword){
            return res.status(422).json({
                success: false,
                message: 'Email, verification code, and password are required.'
            });
        }

        // UPDATE TO INCLUDE VERIFICATION CODE
        // get the user from db based on email
        const userQuery ='SELECT UserID, Type, Email, PasswordHash FROM Users WHERE Email=$1';
        const userResult = await pool.query(userQuery, [email.toLowerCase()]);

        // check if user exists
        if (userResult.rowCount === 0){
            return res.status(404).json({
                success: false,
                message: 'Invalid email or verfication code does not exist.'
            });

        }

        const userId = userResult.rows[0].userid;

        // hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // update password
        // potentially UPDATE VERIFICATION CODE
        const updateQuery='UPDATE Users SET PasswordHash =$1 WHERE UserId=$2 RETURNING UserID';
        const updateResult = await pool.query(updateQuery, [hashedPassword,userId]);

        if (updateResult.rowCount === 0){
            return res.status(400).json({
                success: false,
                message: 'Failed to update password'
            });
        }

        // return valid response with user details
        return res.status(200).json({
            success: true,
            message: 'Password sucessful reset. Log in now.'
        }); 

    } catch (error) {
        console.error("Error Loging in:",error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });   
    }
}

module.exports = {login, forgotPassword, passwordReset};