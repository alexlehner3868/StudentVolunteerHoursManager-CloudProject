import React from 'react';
import "../../styles/FilterBar.css";

const FilterBar = ({ status, onStatusChange }) => {
  return (
    <div className="container">
      <label className="label">Filter by Status:</label>
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="select"
      >
        <option value="All">All Statuses</option>
        <option value="Pending">Pending</option>
        <option value="Approved">Approved</option>
        <option value="Denied">Denied</option>
        <option value="Flagged">Flagged</option>
      </select>

      {status !== 'All' && (
        <button
          onClick={() => onStatusChange('All')}
          className="clear"
          aria-label="Clear status filter"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default FilterBar;
