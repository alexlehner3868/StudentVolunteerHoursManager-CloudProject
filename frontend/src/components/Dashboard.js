import React from 'react';
import NavBar from './NavBar';

function Dashboard({ userType }) {
  const isStudent = userType === 'student';

  return (
    <div>
      <NavBar userType={userType} />

      <div style={{ padding: '20px' }}>
        {isStudent ? (
          <>
            <h1>Student Dashboard</h1>
            <p>Welcome, student! Here you can track your volunteer hours and submit new ones.</p>
          </>
        ) : (
          <>
            <h1>Guidance Counsellor Dashboard</h1>
            <p>Welcome, counsellor! Review student submissions and manage records here.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
