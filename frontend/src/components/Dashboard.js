import React, { useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import StudentDashboard from './StudentDashboard';
import CounsellorDashboard from '../components/CounsellorDash/CounsellorDashboard'
function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  useEffect(() => {
    if (!user){
      navigate('/login');
    }
  },[user, navigate]);

  const userType = user?.type;
  const userId =user?.userId;

  const isStudent = (userType === 'Student'); 

  return (
    <div>
      <NavBar userType={userType} />

      <div style={{ padding: '20px' }}>
        {isStudent ? (
          <StudentDashboard studentId={userId} />
        ) : (
          <CounsellorDashboard />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
