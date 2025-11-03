import React from 'react';
import NavBar from './NavBar';
import StudentDashboard from './StudentDashboard';
function Dashboard({ userType }) {

  const isStudent = userType === 'student'; //Temp - set dynam ically based on user
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = (user && user.userId) || 0;
  return (
    <div>
      <NavBar userType={userType} />

      <div style={{ padding: '20px' }}>
        {isStudent ? (
          <StudentDashboard studentId={userId} />
        ) : (
          <>
            <h1>Guidance Counsellor Dashboard</h1>
            <p>In progress</p>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
