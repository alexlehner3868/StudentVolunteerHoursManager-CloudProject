const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const {sendEmail} = require('../config/sendGrid');
const crypto = require('crypto');

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
        } else if (user.type === "Admin") {
            userDetails = {
                ...userDetails,
                name: "Admin",
                schoolId: null,
                schoolName: null
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
        // create the code to be sent users email
        const verificationCode = crypto.randomInt(100000,999999).toString();
        // set expiry to 30 minutes from now
        const verificationExpiryTime = new Date(Date.now() + 30*60*1000);

        // store verification code to database
        const verificationQuery ='UPDATE Users SET VerificationCode=$1, VerificationExpiryTime=$2 WHERE UserId=$3';
        const verificationResult = await pool.query(verificationQuery, [verificationCode, verificationExpiryTime, user.userid]);

        // send email to user
        try {
            await sendEmail({
                to: user.email,
                subject: 'Volunteer Hour Password Rest',
                html:`
                    <h2>Password Resest Request</h2>
                    <p>Hello,</p>
                    <br>
                    <p>You requested to reset your password. Use the verification code below:</p>
                    <h1 style="background-color: #8aaeeb; padding: 20px; text-align: center; color:#242425">
                        ${verificationCode}
                    </h1>
                    <br>
                    <p><strong>This code will expire in 30 minutes.</strong></p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>Best regards,<br>Volunteer Hours Team</p>
                `
            });
        } catch (error) {
            console.error("Error sending email:",error);
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification email. please try again.'
            });  
        }
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

        // get the user from db based on email
        const userQuery ='SELECT UserID, Type, Email, VerificationCode, VerificationExpiryTime, PasswordHash FROM Users WHERE Email=$1';
        const userResult = await pool.query(userQuery, [email.toLowerCase()]);

        // check if user exists
        if (userResult.rowCount === 0 ){
            return res.status(404).json({
                success: false,
                message: 'Invalid email. Try again.'
            });

        }

        // store user info
        const user = userResult.rows[0];

        // check if verification code and expiry time exist
        if (!user.verificationcode || !user.verificationexpirytime){
            return res.status(404).json({
                success: false,
                message: 'Verification code does not exist. Please request a new one.'
            });

        }

        // check if code expired
        const now= new Date();
        const expiry = new Date(user.verificationexpirytime)
        if (now>expiry){
            const expiredQuery ='UPDATE Users SET VerificationCode=NULL, VerificationExpiryTime=NULL WHERE UserId=$1';
            const expiredResult = await pool.query(expiredQuery, [user.userid]);
            return res.status(400).json({
                success: false,
                message: 'Verification code was expired. Please request a new one.'
            });
        }

        // check if verification codes match
        if (user.verificationcode !== verificationCode){
            return res.status(404).json({
                success: false,
                message: 'Verification does not match. Please request a new one.'
            });

        } 

        // hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // update password
        // potentially UPDATE VERIFICATION CODE
        const updateQuery='UPDATE Users SET PasswordHash =$1, VerificationCode=NULL, VerificationExpiryTime=NULL WHERE UserId=$2 RETURNING UserID';
        const updateResult = await pool.query(updateQuery, [hashedPassword,user.userid]);

        // Check if query returns a value to ensure update was successful
        if (updateResult.rowCount === 0){
            return res.status(400).json({
                success: false,
                message: 'Failed to update password'
            });
        }

        // send email to user
        try {
            await sendEmail({
                to: user.email,
                subject: 'Volunteer Hour Password Successfully Rest',
                html:`
                    <h2>Password Resest Successful</h2>
                    <p>You request to reset your password is now complete.</p>
                    <p>You can now log in with your new password.</p>
                    <p>Best regards,<br>Volunteer Hours Team</p>
                `
            });
        } catch (error) {
            console.error("Error sending email:",error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update password. Please request a new verification code.'
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