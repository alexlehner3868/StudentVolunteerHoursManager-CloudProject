import React, {useState} from "react";
import { useNavigate,Link } from 'react-router-dom';
import "../styles/Page.css";
import PopUp from "./PopUp"
const PasswordReset=()=>{
    const [email, setEmail]=useState("");
    const [verificationCode, setVerificationCode]=useState("");
    const [newPassword, setNewPassword]=useState("");
    const [confirmationPassword, setConfirmationPassword]=useState("");
    const [submitting,setSubmitting]=useState(false);
    const [showPopUp, setShowPopUp]=useState(false);
    const [popUpMessage, setPopUpMessage]=useState("");
    const navigate = useNavigate();

    const handleChange=(e)=>{
        const {name, value} = e.target;
        if (name === 'email'){
            setEmail(value);
        }
        else if (name === 'verificationCode'){
            setVerificationCode(value);
        }
        else if (name === 'newPassword'){
            setNewPassword(value);
        }
        else if (name === 'confirmationPassword'){
            setConfirmationPassword(value);
        }
    }

    const validatePassword =()=>{
        if(newPassword.length<8){
            return {isValid:false, message:"Password must be at least 8 characters long. Please try again."};
        }
        const hasUpperCase = /[A-Z]/.test(newPassword);
        if(!hasUpperCase){
            return {isValid:false, message:"Password must contain an uppercase character. Please try again."};
        }
        const hasLowerCase = /[a-z]/.test(newPassword);
        if(!hasLowerCase){
            return {isValid:false, message:"Password must contain a lowercase character. Please try again."};
        }
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
        if(!hasSpecialChar){
            return {isValid:false, message:"Password must contain a special character. Please try again."};
        }
        return {isValid:true, message:""};

    }

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setSubmitting(true);
        const validation =validatePassword();
        if(!validation.isValid){
            setPopUpMessage(validation.message);
            setShowPopUp(true);
        }
        else if (newPassword!=confirmationPassword){
            setPopUpMessage('Passwords do not match. Please try again.');
            setShowPopUp(true);
        }
        else{
            const requestBody={email,verificationCode,newPassword};
            try {   
                const response = await fetch("/api/password-reset",{
                    method: "POST",
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(requestBody)
                });
                if (!response.ok){
                    setPopUpMessage('Invalid Email or Verification Code. Please try again.');
                    setShowPopUp(true);
                }
                else{
                    navigate("/");
                }
                
            } catch (error) {
                console.error('Error reseting password:', error);
                setPopUpMessage('Network error. Please try again.');
                setShowPopUp(true);
            }
        }
        setSubmitting(false)
    }

    return(
    <div className="page">
        <header className="pageHeader">
            <h1>Set Up New Password</h1>
        </header>
        <form onSubmit={handleSubmit}>
            <input
                className="input"
                type= "email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleChange}
                disabled={submitting}
                required
            />
            <input
                className="input"
                type= "text"
                id="verificationCode"
                name="verificationCode"
                placeholder="Enter your verification code"
                value={verificationCode}
                onChange={handleChange}
                disabled={submitting}
                required
            />
            <input
                className="input"
                type= "password"
                id="newPassword"
                name="newPassword"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={handleChange}
                disabled={submitting}
                required
            />
            <input
                className="input"
                type= "password"
                id="confirmationPassword"
                name="confirmationPassword"
                placeholder="Confirm password"
                value={confirmationPassword}
                onChange={handleChange}
                disabled={submitting}
                required
            />
            <button
                className="button"
                type="submit"
                disabled={submitting}
            >
                {submitting ? 'Submitting ...' : 'Reset Password'}
            </button>
        </form>
        <PopUp
            isVisible={showPopUp}
            message={popUpMessage}
            onClose={()=>setShowPopUp(false)}
        />
    </div>
    );
};

export default PasswordReset;