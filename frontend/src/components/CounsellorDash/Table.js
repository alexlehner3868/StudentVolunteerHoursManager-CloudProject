import { useState, useEffect } from 'react';
import "../../styles/Table.css";


const Table = ({ submissions, onRowClick }) => {
  // format date to be displayed as MMM(short-hand ex: Oct) DD, YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // to be displayed when there are no submissions
  if (submissions.length === 0) {
    return (
      <div className="tb-container">
        <div className="no-submissions">
          <p>No submissions found matching your criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tb-container">
      <table className="table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Hours</th>
            <th>Date Volunteered</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <tr 
              key={submission.submissionid} 
              onClick={() => onRowClick(submission)}
            >
              <td>{submission.studentname}</td>
              <td>{submission.hours}</td>
              <td>{formatDate(submission.datevolunteered)}</td>
              <td>
                <span className={`tb-status-badge tb-status-${submission.guidancecounsellorapproved}`}>
                  {submission.guidancecounsellorapproved}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;