import React, { useState, useEffect } from "react";
import "../../styles/CounsellorDashboard.css";
import FilterBar from "./FilterBar";
import Table from "./Table";
import Submission from "./Submission";
import PopUp from "../../components/PopUp";
import CounsellorWeeklyChart from "./CounsellorWeeklyChart";

const CounsellorDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [counsellorProfile, setCounsellorProfile] = useState(null);

  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showPopUp, setShowPopUp] = useState(false);
  const [popUpMessage, setPopUpMessage] = useState("");

  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("all");

  // Load user
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser || null);
  }, []);

  // Get profile info
  useEffect(() => {
    if (!user?.userId) return;

    fetch(`/api/gc/${user.userId}/profile`)
      .then((res) => res.json())
      .then((data) => setCounsellorProfile(data))
      .catch(() => {});
  }, [user]);

  // Get submissions
  useEffect(() => {
    if (!user?.userId) return;

    fetch(`/api/submissions?counsellorId=${user.userId}`)
      .then((res) => res.json())
      .then((data) => {
        setSubmissions(data.submissions || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching submissions:", err);
        setLoading(false);
      });
  }, [user]);

  // Get student list
  useEffect(() => {
    if (!user?.userId) return;

    fetch(`/api/counsellor-students?counsellorId=${user.userId}`)
      .then((res) => res.json())
      .then((data) => setStudents(data.students || []))
      .catch((err) => {
        console.error("Error fetching students:", err);
      });
  }, [user]);

  const normalizeStatus = (sub) => {
    if (sub.externsupstatus === "Pending") {
      return "Waiting on Supervisor";
    }

    if (sub.externsupstatus === "Rejected") {
      return "Rejected";
    }

    if (sub.externsupstatus === "Approved") {
      const gc = sub.guidancecounsellorapproved;

      if (gc === "Approved") return "Approved";
      if (gc === "Rejected" || gc === "Denied") return "Rejected";
      if (gc === "Flagged") return "Flagged";

      return "Pending";
    }

    return "Pending";
  };

  // Filtering logic
  const getFilteredSubmissions = () => {
    // First REMOVE all submissions NOT approved by supervisor
    let result = submissions.filter(
      (sub) => sub.externsupstatus === "Approved"
    );

    // Now map the remaining approved ones into unified statuses
    result = result.map((sub) => ({
      ...sub,
      unifiedStatus: normalizeStatus(sub),
    }));

    // Filter by student
    if (selectedStudentId !== "all") {
      const selectedStudent = students.find(
        (s) => Number(s.userid) === Number(selectedStudentId)
      );

      if (selectedStudent) {
        result = result.filter(
          (sub) => sub.studentname === selectedStudent.studentname
        );
      }
    }

    // Filter by status
    if (statusFilter !== "All Statuses") {
      result = result.filter(
        (sub) => sub.unifiedStatus === statusFilter
      );
    }

    return result;
  };

  const handleUpdateSubmission = (
    submissionId, newStatus, newComment, newFlag) => {
    setSubmissions(prev =>
      prev.map(sub =>
        sub.submissionid === submissionId
          ? {
              ...sub,
              guidancecounsellorapproved: newStatus,
              guidancecounsellorcomments: newComment,
              guidancecounsellorflag: newFlag
            }
          : sub
      )
    );
  };



  const filteredSubmissions = getFilteredSubmissions();

  return (
    <div className="cd-container">
      <main className="cd-content">
        <h2 className="cd-title">
          Welcome, {counsellorProfile?.name || "Guidance Counsellor"}
        </h2>

        <div className="cd-filter">
          <div className="fb-button">
            <label className="fb-label">Filter by Student:</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="fb-select"
            >
              <option value="all">All Students</option>
              {students.map((s) => (
                <option key={s.userid} value={s.userid}>
                  {s.studentname}
                </option>
              ))}
            </select>
          </div>

          <FilterBar
            status={statusFilter}
            onStatusChange={setStatusFilter}
          />
        </div>

        <div className="cd-split">
          <div className="cd-left-panel">
            {/* Reserved for future stats / info */}
          </div>

          <div className="cd-right-panel">
            <h3 className="cd-chart-title">Weekly Status Overview</h3>
            <CounsellorWeeklyChart submissions={filteredSubmissions} />
          </div>
        </div>

        <Table
          submissions={filteredSubmissions}
          onRowClick={(s) => {
            setSelectedSubmission(s);
            setIsSubmissionOpen(true);
          }}
        />

        <Submission
          isOpen={isSubmissionOpen}
          submissionData={selectedSubmission}
          counsellorId={user?.userId}
          onUpdateSubmission={handleUpdateSubmission}
          onClose={() => setIsSubmissionOpen(false)}
        />
      </main>

      <PopUp
        isVisible={showPopUp}
        message={popUpMessage}
        onClose={() => setShowPopUp(false)}
      />
    </div>
  );
};

export default CounsellorDashboard;
