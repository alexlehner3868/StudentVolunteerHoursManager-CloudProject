import React, { useState, useEffect } from 'react';
import StudentInfoSection from './StudentInfoSection';
import SupervisorStatusSection from './SupervisorStatusSection';
import CounsellorActionsSection from './CounsellorActionsSection';
import '../../styles/Submission.css';
import PopUp from "../../components/PopUp";

const Submission = ({ isOpen, onClose, submissionData, onUpdateSubmission, counsellorId }) => {
  const [counsellorStatus, setCounsellorStatus] = useState(null);
  const [counsellorComment, setCounsellorComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopUp, setShowPopUp]=useState(false);
  const [popUpMessage, setPopUpMessage]=useState("");

  // Reset state when submission is opened or closed
  useEffect(() => {
    if (submissionData) {
      setCounsellorStatus(submissionData.guidancecounsellorapproved); 
      setCounsellorComment(submissionData.guidancecounsellorcomments || '');
    }
  }, [submissionData]);

  // send the http request to update submission when apply is clicked
  const handleApply = async () => {
    if (!submissionData || isSubmitting){ 
      setPopUpMessage('Error submitting. Please try again later.');
      setShowPopUp(true);
      return;
    }

    if (!counsellorStatus) {
      setPopUpMessage('Please select an action (Flag, Approve, or Deny)');
      setShowPopUp(true);
      return;
    }

    setIsSubmitting(true);
    const submissionId = submissionData.submissionid;

    try {
      const requestBody={
        submissionid: submissionData.submissionid,
        guidancecounsellorid: counsellorId,
        guidancecounsellorcomments: counsellorComment,
        guidancecounsellorapproved: counsellorStatus 
      };

      const response = await fetch("/api/update-submission", {
        method: 'PUT',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        setPopUpMessage(`Failed to ${counsellorStatus} submission`);
        setShowPopUp(true);
      }
      else {
        const data = await response.json();
        onUpdateSubmission(submissionId, counsellorStatus, counsellorComment);
      }
      onClose();
    } catch (error) {
      console.error('Error updating submission:', error);
      setPopUpMessage('Network error. Please try again.');
      setShowPopUp(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !submissionData) {
    return null;
  }

  // Prevent closing submission when clicking inside
  const handleInsideClick = (e) => e.stopPropagation();

  return (
    <>
      <div className="sub-container" onClick={onClose}>
        <div className="sub-content" onClick={handleInsideClick}>
          <div className="sub-header">
            <h3>Submission Details</h3>
            {/* &times used to create a centered X inside*/}
            <button className="sub-close" onClick={onClose}>&times;</button>
          </div>

          <div className="sub-inner-content">
            <StudentInfoSection submission={submissionData} />
            <SupervisorStatusSection submission={submissionData} />
            <CounsellorActionsSection
              counsellorStatus={counsellorStatus}
              setCounsellorStatus={setCounsellorStatus}
              counsellorComment={counsellorComment}
              setCounsellorComment={setCounsellorComment}
              handleApply={handleApply}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
      <PopUp
        isVisible={showPopUp}
        message={popUpMessage}
        onClose={()=>setShowPopUp(false)}
      />
    </>
  );
};

export default Submission;