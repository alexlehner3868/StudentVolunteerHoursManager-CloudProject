import React from 'react';
import NavBar from './NavBar';
import StudentDashboard from './StudentDashboard';
function Dashboard({ userType }) {

  const isStudent = userType === 'student'; //Temp - set dynam ically based on user
  const userID = JSON.parse(localStorage.getItem("user"));
  return (
    <div>
      <NavBar userType={userType} />

      <div style={{ padding: '20px' }}>
        {isStudent ? (
          <StudentDashboard studentId={userID} />
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
