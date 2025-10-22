import React from 'react';
import { Link } from 'react-router-dom';

function NavBar({ userType }) {
  const isStudent = userType === 'student';

  const navStyle = {
    backgroundColor: isStudent ? '#007bff' : '#6f42c1',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
  };

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
    { label: 'Profile', path: '/profile' },
    { label: 'Logout', path: '/logout' },
  ];

  return (
    <nav style={navStyle}>
      <div style={{ display: 'flex', gap: '20px' }}>
        {leftLinks.map(link => (
          <Link
            key={link.path}
            to={link.path}
            style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        {rightLinks.map(link => (
          <Link
            key={link.path}
            to={link.path}
            style={{ color: 'white', textDecoration: 'none' }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default NavBar;
