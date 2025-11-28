import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "../styles/SupervisorApprovalPage.css";
import PopUp from './PopUp';

const SupervisorApprovalPage = () => {
    const { submissionId, token } = useParams();
    const [submissionData, setSubmissionData] = useState(null);
    const [comments, setComments] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isActionable, setIsActionable] = useState(false);
    const [showPopUp, setShowPopUp] = useState(false);
    const [popUpMessage, setPopUpMessage] = useState('');

    // the request to get the submission hours info
    const fetchSubmissionDetails = async () => {
        try {
            const res = await fetch(`/api/volunteer-hours/get/${submissionId}/${token}`);
            // wait for the response from the server 
            const result = await res.json();
            
            // set the data to be used on page
            if (result.success) {
                setSubmissionData(result.submission);
                setIsActionable(true);
            } else {
                // if request fails set the pop up message displaying the server response
                setSubmissionData(result.submission || null);
                setPopUpMessage(result.message || 'Invalid or expired approval link.');
                setShowPopUp(true);
                setIsActionable(false);
            }
        } catch (error) {
            console.error("Error fetching submission details:", error);
            setPopUpMessage('Could not load submission details. Please try again.');
            setShowPopUp(true);
            setIsActionable(false);
        } finally {
            setIsLoading(false);
        }
    };

    // rquest the data when page is opened
    useEffect(() => {
        if (submissionId && token) {
            fetchSubmissionDetails();
        } else {
            setPopUpMessage('Missing submission information in the link.');
            setShowPopUp(true);
            setIsLoading(false);
        }
    }, [submissionId, token]);

    // The request to update the submission info based on if approve/deny and comments are provided
    const handleAction = async (status) => {
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/volunteer-hours/sup-update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    submissionid: submissionId,
                    token, 
                    status, 
                    comments 
                }),
            });
            // wait for the response from the server 
            const result = await res.json();
            // display the success message
            if (result.success) {
                setPopUpMessage(`Hours ${status.toLowerCase()} successfully!`);
                setShowPopUp(true);
                setSubmissionData(prev => ({...prev, externsupstatus: status}));
                setIsActionable(false);
            } else {
                // if request fails set the pop up message displaying the server response
                setPopUpMessage(result.message || 'An error occurred. Please try again.');
                setShowPopUp(true);
                setIsActionable(false);
            }
        } catch (err) {
            console.error(err);
            setPopUpMessage('Failed to connect to the server.');
            setShowPopUp(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="page-center">Loading...</div>;
    }

    if (!submissionData) {
        return (
            <div className="page-center">
                <div className="card">
                    <h2>Volunteer Hour Approval</h2>
                    <p>Unable to load submission details.</p>
                </div>
                <PopUp
                    isVisible={showPopUp}
                    message={popUpMessage}
                    onClose={() => setShowPopUp(false)}
                />
            </div>
        );
    }

    return (
        <div className="page-center">
            <div className="card">
                <h2>Review Volunteer Hours</h2>
                
                <div className="info-section">
                    <p><strong>Student:</strong> {submissionData.studentname}</p>
                    <p><strong>School:</strong> {submissionData.schoolname}</p>
                    <p><strong>Organization:</strong> {submissionData.organization}</p>
                    <p><strong>Date:</strong> {new Date(submissionData.datevolunteered).toLocaleDateString()}</p>
                    <p><strong>Hours:</strong> {submissionData.hours}</p>
                    <p><strong>Description:</strong> {submissionData.description}</p>
                </div>
                
                {!isActionable && submissionData.externsupstatus && (
                    <div className="status-badge">
                        Status: <strong>{submissionData.externsupstatus}</strong>
                    </div>
                )}

                {isActionable && (
                    <>
                        <div className="input-group">
                            <label>Comments (Optional)</label>
                            <textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                rows="4"
                                placeholder="Add any comments..."
                            />
                        </div>

                        <div className="button-group">
                            <button
                                onClick={() => handleAction('Denied')}
                                disabled={isSubmitting}
                                className="btn-deny"
                            >
                                Deny
                            </button>
                            <button
                                onClick={() => handleAction('Approved')}
                                disabled={isSubmitting}
                                className="btn-approve"
                            >
                                Approve
                            </button>
                        </div>
                    </>
                )}
            </div>
            
            <PopUp
                isVisible={showPopUp}
                message={popUpMessage}
                onClose={() => setShowPopUp(false)}
            />
        </div>
    );
};

export default SupervisorApprovalPage;