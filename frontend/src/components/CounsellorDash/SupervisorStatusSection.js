import React from 'react';
import '../../styles/SupervisorStatusSection.css';
// format date to be displayed as MMM(short-hand ex: Oct) DD, YYYY
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

const SupervisorStatusSection = ({ submission}) => {
  return (
    <section className="sss-container">
      <h4>Supervisor Verification</h4>
      <div>
        <div>
          <label>Status</label>
          <span className={`sss-status-badge sss-status-${submission.externsupstatus}`}>
            {submission.externsupstatus}
          </span>
        </div>
        <div>
          <label>Response Date</label>
          <p>{submission.externsupdate ? formatDate(submission.externsupdate) : 'N/A'}</p>
        </div>
      </div>
      <div>
        <label>Supervisor Comments</label>
        <p className="sss-supervisor-comment">
          {submission.externsupcomments || 'No comments left by the supervisor.'}
        </p>
      </div>
    </section>
  );
};

export default SupervisorStatusSection;