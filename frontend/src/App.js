import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SubmissionForm from './components/SubmissionForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div><h1>Hello! Frontend is working. v2</h1></div>} />
        <Route path="/submit-hours" element={<SubmissionForm />} />
      </Routes>
    </Router>
  );
}

export default App;
