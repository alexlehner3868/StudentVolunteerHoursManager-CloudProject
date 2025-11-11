import React from 'react';
import '../../styles/SearchBar.css';

const SearchBar = ({ nameSearched, onSearchChange }) => {
  return (
    <div className="sb-container">
      <input
        type="text"
        placeholder="Search by student name..."
        value={nameSearched}
        onChange={(e) => onSearchChange(e.target.value)}
        className="sb-searchInput"
        aria-label="Search students"
      />
      {nameSearched && (
        <button 
          onClick={() => onSearchChange('')}
          className="sb-clearButton"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;
