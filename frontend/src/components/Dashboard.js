import React, { useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import StudentDashboard from './StudentDashboard';
import CounsellorDashboard from '../components/CounsellorDash/CounsellorDashboard'
import UserManagement from "./UserManagement";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  useEffect(() => {
    if (!user){
      navigate('/');
    }
  },[user, navigate]);
   
  if (!user) {
    return null; 
  }

  const userType = user?.type;
  const userId =user?.userId;

  const isStudent = (userType === 'Student'); 

  return (
    <div>
      <NavBar userType={userType} />

      <div style={{ padding: '20px' }}>
        {userType === 'Student' ? (
            <StudentDashboard studentId={userId} />
          ) : userType === 'GuidanceCounsellor' ? (
            <CounsellorDashboard />
          ) : userType === 'Admin' ? (
            <UserManagement /> 
          ) : (
            <p>Invalid user type</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
