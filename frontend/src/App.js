import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components
import Dashboard from './components/Dashboard';
import SubmissionForm from './components/SubmissionForm';
import RegisterForm from './components/RegisterForm'; // ✅ Add this import

// Hardcode user type for now
const userType = 'student'; // or 'counsellor'

function App() {
  return (
    <Router>
      <Routes>
        {/* Registration page */}
        <Route path="/register" element={<RegisterForm />} />

        {/* Redirect root (/) to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Student or counsellor dashboard */}
        <Route path="/dashboard" element={<Dashboard userType={userType} />} />

        {/* Volunteer hour submission form */}
        <Route path="/submit-hours" element={<SubmissionForm />} />
      </Routes>
    </Router>
  );
}

export default App;
