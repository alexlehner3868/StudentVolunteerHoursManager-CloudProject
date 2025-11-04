import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SubmissionForm from './components/SubmissionForm';
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import PasswordReset from "./components/PasswordReset";
import CounsellorDashboard from "./components/CounsellorDash/CounsellorDashboard";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/password-reset" element={<PasswordReset />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/submit-hours" element={<SubmissionForm />} />
      </Routes>
    </Router>
  );
}

export default App;
