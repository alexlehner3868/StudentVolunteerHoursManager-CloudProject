import React, {useState} from "react";
import { useNavigate,Link } from 'react-router-dom';
import "../styles/Page.css";
import PopUp from "./PopUp"
const ForgotPassword=()=>{
    const [email, setEmail]=useState("");
    const [submitting,setSubmitting]=useState(false);
    const [showPopUp, setShowPopUp]=useState(false);
    const [popUpMessage, setPopUpMessage]=useState("");
    const navigate = useNavigate();

    // set the value passed in as email 
    const handleChange=(e)=>{
        const {name, value} = e.target;
        if (name === 'email'){
            setEmail(value);
        }
    }

    // the http request to send verification code to email
    const handleSubmit = async (e) =>{
        e.preventDefault();
        setSubmitting(true);
        try {
            const requestBody={email};   
            const response = await fetch("/api/forgot-password",{
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(requestBody)
            });
            if (!response.ok){
                setPopUpMessage('Invalid Email. Please try again.');
                setShowPopUp(true);
            }
            else{
                navigate("/password-reset");
            }
            
        } catch (error) {
            console.error('Error login:', error);
            setPopUpMessage('Network error. Please try again.');
            setShowPopUp(true);
        }
        setSubmitting(false)
    }

    return(
    <div className="page">
        <header className="pageHeader">
            <h1>Forgot Password?</h1>
            <p> No worries, we'll send instructions to your email</p>
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
            <button
                className="button"
                type="submit"
                disabled={submitting}
            >
                {submitting ? 'Submiting ...' : 'Send verification code'}
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

export default ForgotPassword;