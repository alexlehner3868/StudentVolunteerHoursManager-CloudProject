import React, {useState} from "react";
import { useNavigate,Link } from 'react-router-dom';
import "../styles/Page.css";
import PopUp from "./PopUp"
const Login=()=>{
    const [email, setEmail]=useState("");
    const [password, setPassword]=useState("");
    const [submitting,setSubmitting]=useState(false);
    const [showPopUp, setShowPopUp]=useState(false);
    const [popUpMessage, setPopUpMessage]=useState("");
    const navigate = useNavigate();
    const handleChange=(e)=>{
        const {name, value} = e.target;
        if (name === 'email'){
            setEmail(value);
        }
        else if (name === 'password'){
            setPassword(value);
        }
    }

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setSubmitting(true);
        const requestBody={email,password};
        try {   
            const response = await fetch("/api/login",{
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(requestBody)
            });
            if (!response.ok){
                setPopUpMessage('Invalid Email or Password. Please try again.');
                setShowPopUp(true);
            }
            else{
                const data = await response.json();
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate("/dashboard");
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
            <h1>Login</h1>
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
                type= "password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={handleChange}
                disabled={submitting}
                required
            />
            <button
                className="button"
                type="submit"
                disabled={submitting}
            >
                {submitting ? 'Logging in...' : 'Login'}
            </button>
            <div>
                <Link to="/forgot-password">
                    Forgot Password?
                </Link>
            </div>
            <div>
                Don't have an account?{" "}
                <Link to="/signup">
                    Sign Up
                </Link>
            </div>
        </form>
        <PopUp
            isVisible={showPopUp}
            message={popUpMessage}
            onClose={()=>setShowPopUp(false)}
        />
    </div>
    );
};

export default Login;