import React from 'react';
import '../../styles/StudentInfoSection.css';

// format date to be displayed as MMM..M(long-hand ex: October) DD, YYYY
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const StudentInfoSection = ({ submission }) => {
  return (
    <section>
      <h4>Student Information</h4>
      <div className="container">
        <div className="content">
          <label>Student Name</label>
          <p>{submission.studentname || 'N/A'}</p>
        </div>
        <div className="content">
          <label>Hours Volunteered</label>
          <p>{submission.hours ? `${submission.hours} hours` : 'N/A'}</p>
        </div>
        <div className="content">
          <label>Date Volunteered</label>
          <p>{formatDate(submission.datevolunteered)}</p>
        </div>
        <div className="content">
          <label>Organization</label>
          <p>{submission.organization || 'N/A'}</p>
        </div>
        <div className="content">
          <label>Supervisor Email</label>
          <p>{submission.externsupemail || 'N/A'}</p>
        </div>
      </div>
      <div className="content full-width">
        <label>Activity Description</label>
        <p>{submission.description || 'No description provided.'}</p>
      </div>
    </section>
  );
};

export default StudentInfoSection;