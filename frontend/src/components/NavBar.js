import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NavBar.css'; 

function NavBar({ userType }) {
  const isStudent = userType.toLowerCase() === 'student';

  const leftLinks = isStudent
    ? [
        { label: 'Home', path: '/dashboard' },
        { label: 'Submit Hours', path: '/submit-hours' },
      ]
    : [
        { label: 'Home', path: '/dashboard' },
        { label: 'Review', path: '/review' },
      ];

  const rightLinks = [
    { label: 'Profile', path: `/profile` },
    { label: 'Logout', path: '/logout' },
  ];

  return (
    <nav className="navbar">
      <div className="nav-left">
        {leftLinks.map(link => (
          <Link key={link.path} to={link.path} className="nav-link">
            {link.label}
          </Link>
        ))}
      </div>

      <div className="nav-right">
        {rightLinks.map(link => (
          <Link key={link.path} to={link.path} className="nav-link">
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default NavBar;
