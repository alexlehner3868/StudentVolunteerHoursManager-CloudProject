import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SubmissionForm from './components/SubmissionForm';
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import PasswordReset from "./components/PasswordReset";
import CounsellorDashboard from "./components/CounsellorDash/CounsellorDashboard";
import RegisterForm from "./components/RegisterForm";
import StudentInfo from "./components/StudentInfo";
import GuidanceInfo from "./components/GuidanceInfo";
import SystemMetrics from "./components/SystemMetrics";
import Profile from './components/Profile';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/password-reset" element={<PasswordReset />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/submit-hours" element={<SubmissionForm />} />
        <Route path="/student-info" element={<StudentInfo />} />
        <Route path="/guidance-info" element={<GuidanceInfo />} />
        <Route path="/system-metrics" element={<SystemMetrics />} />
        <Route path="/profile" element={<Profile/>} />
      </Routes>
    </Router>
  );
}

export default App;
