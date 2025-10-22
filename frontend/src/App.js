import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SubmissionForm from './components/SubmissionForm';

// Hardcode user type for now
const userType = 'student'; // or 'counsellor'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard userType={userType} />} />
        <Route path="/submit-hours" element={<SubmissionForm />} />
      </Routes>
    </Router>
  );
}

export default App;
