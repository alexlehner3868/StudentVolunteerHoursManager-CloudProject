import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/NavBar.css';

function NavBar({ userType }) {
  const navigate = useNavigate();
  const normalizedType = userType?.toLowerCase();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };


  let leftLinks = [];
  let rightLinks = [];

  if (normalizedType === "admin") {
    leftLinks = [
      { label: 'Home', path: '/dashboard' }
    ];
    rightLinks = []; 
  } 
  else if (normalizedType === "student") {
    leftLinks = [
      { label: 'Home', path: '/dashboard' },
      { label: 'Submit Hours', path: '/submit-hours' }
    ];
    rightLinks = [
      { label: 'Profile', path: '/profile' }
    ];
  } 
  else if (normalizedType === "guidancecounsellor") {
    leftLinks = [
      { label: 'Home', path: '/dashboard' }
    ];
    rightLinks = [
      { label: 'Profile', path: '/profile' }
    ];
  }

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

        <button onClick={handleLogout} className="nav-link logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
