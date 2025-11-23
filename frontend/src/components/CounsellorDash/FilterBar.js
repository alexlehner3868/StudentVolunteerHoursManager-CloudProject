import React from 'react';
import "../../styles/FilterBar.css";

const FilterBar = ({ status, onStatusChange }) => {
  return (
    <div className="fb-button">
      <label className="fb-label">Filter by Status:</label>

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="fb-select"
      >
        <option value="All Statuses">All Statuses</option>
        <option value="Pending">Pending</option>
        <option value="Approved">Approved</option>
        <option value="Rejected">Rejected</option>
        <option value="Flagged">Flagged</option>
      </select>
    </div>
  );
};

export default FilterBar;
