import React from 'react';
import '../../styles/SearchBar.css';

const SearchBar = ({ nameSearched, onSearchChange }) => {
  return (
    <div className="container">
      <input
        type="text"
        placeholder="Search by student name..."
        value={nameSearched}
        onChange={(e) => onSearchChange(e.target.value)}
        className="searchInput"
        aria-label="Search students"
      />
      {nameSearched && (
        <button 
          onClick={() => onSearchChange('')}
          className="clearButton"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;
