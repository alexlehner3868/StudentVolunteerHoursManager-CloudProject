import React, { useState, useEffect } from "react";
import "../../styles/CounsellorDashboard.css";
import SearchBar from "./SearchBar";
import FilterBar from "./FilterBar";
import Table from './Table';
import Submission from './Submission';
import PopUp from "../../components/PopUp";

const CounsellorDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showPopUp, setShowPopUp] = useState(false);
  const [popUpMessage, setPopUpMessage] = useState("");
  const [nameSearched, setNameSearched] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setLoading(false);
      setPopUpMessage('User not found. Please log in again.');
      setShowPopUp(true);
    }
  }, []);

  useEffect(() => {
    if (user?.userId) {
      fetchSubmissions();
    }
  }, [user]);


  const fetchSubmissions = async () => {
    setLoading(true);
    // attempt to get the submissions for the counsellor
    try {
      const response = await fetch(`/api/submissions?counsellorId=${user.userId}`, {
        method: "GET",
        headers: { 'Content-Type': 'application/json' },
      });
      // if unsuccesful request then display erro pop up message
      if (!response.ok) {
        setPopUpMessage('Unable to load submissions. Please try again later.');
        setShowPopUp(true);
      }
      else{
        // deseralize response and pass into submission array
        const data = await response.json();
        setSubmissions(data.submissions || []);
      }

    } catch (err) {
      console.error('Error fetching submissions:', err);
      setPopUpMessage('Unable to load submissions. Please try again later.');
      setShowPopUp(true);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSubmissions = () => {
    let result = [...submissions];

    // filter by student name
    if (nameSearched.trim()) {
      const search = nameSearched.toLowerCase();
      result = result.filter(sub => 
        sub.studentname?.toLowerCase().includes(search)
      );
    }

    // filter by status
    if (statusFilter !== 'all') {
      result = result.filter(sub => {
        const status = sub.guidancecounsellorapproved;
        if (statusFilter === 'Pending') return status === 'Pending';
        if (statusFilter === 'Approved') return status === 'Approved';
        if (statusFilter === 'Denied') return status === 'Denied';
        if (statusFilter === 'Flagged') return status === 'Flagged';
        return true;
      });
    }

    return result;
  };

  
  const filteredSubmissions = getFilteredSubmissions();

  // when Submission is closed clear out submission
  const handleCloseSubmission = () => {
    setIsSubmissionOpen(false);
    setSelectedSubmission(null);
  };

  // update the submission status in the table after action taken
  const handleUpdateSubmission = (submissionId, newStatus, newComment) => {
    setSubmissions(prevSubmissions =>
      prevSubmissions.map(sub =>
        sub.submissionid === submissionId
          ? { ...sub, guidancecounsellorapproved: newStatus, guidancecounsellorcomments: newComment }
          : sub
      )
    );
    handleCloseSubmission();
  };

  return (
    <div className="cd-container">
      <main className="cd-content">
        <div className="cd-header">
          <h2>Student Submissions</h2>
          <p>Review and manage volunteer hour submissions from your students</p>
        </div>
        {loading ? (
          <div className="cd-loading">Loading submissions...</div>
        ) : (
          <>
            <div className="cd-filter">
              <SearchBar 
                nameSearched={nameSearched}
                onSearchChange={setNameSearched}
              />
              
              <FilterBar
                status={statusFilter}
                onStatusChange={setStatusFilter}
              />
            </div>

            <Table
              submissions={filteredSubmissions}
              onRowClick={(submission) => {
                setSelectedSubmission(submission);
                setIsSubmissionOpen(true);
              }}
            />
          </>
        )}
      </main>
      
      <Submission
        isOpen={isSubmissionOpen}
        onClose={handleCloseSubmission}
        submissionData={selectedSubmission}
        onUpdateSubmission={handleUpdateSubmission}
        counsellorId={user?.userId}
      />
      
      <PopUp
        isVisible={showPopUp}
        message={popUpMessage}
        onClose={() => setShowPopUp(false)}
      />
    </div>
  );
};

export default CounsellorDashboard;
