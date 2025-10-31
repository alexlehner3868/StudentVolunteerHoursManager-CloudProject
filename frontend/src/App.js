import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SubmissionForm from './components/SubmissionForm';
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import SignUp from "./components/SignUp";
import PasswordReset from "./components/PasswordReset";
import Profile from './components/Profile';


// Hardcode user type for now
const userType = 'student'; // or 'counsellor'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/password-reset" element={<PasswordReset />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard userType={userType} />} />
        <Route path="/submit-hours" element={<SubmissionForm />} />
        <Route path="/profile" element={<Profile userType={userType} />} />
      </Routes>
    </Router>
  );
}

export default App;
