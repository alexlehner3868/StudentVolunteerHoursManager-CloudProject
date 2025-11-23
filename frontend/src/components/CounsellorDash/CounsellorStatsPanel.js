import React from "react";
import "../../styles/CounsellorStatsPanel.css";

// Helper to compute totals
const sumHours = (submissions, status) => {
  return submissions
    .filter((s) => s.unifiedStatus === status)
    .reduce((total, s) => total + parseFloat(s.hours || 0), 0);
};

const CounsellorStatsPanel = ({ selectedStudentId, students, submissions }) => {
  const SINGLE_STUDENT = selectedStudentId !== "all";

  if (SINGLE_STUDENT) {
    const student = students.find(
      (s) => Number(s.userid) === Number(selectedStudentId)
    );

    const approved = sumHours(submissions, "Approved");
    const pending = sumHours(submissions, "Pending");
    const total = approved + pending;

    const approvedPct = Math.round((approved / 40) * 100);
    const totalPct = Math.round((total / 40) * 100);

    return (
      <div className="csp-container">
        <h3 className="csp-title">Student Summary</h3>

        <div className="csp-item">
          <label>Name: </label>
          <span>{student?.studentname || "N/A"}</span>
        </div>

        <div className="csp-item">
          <label>Expected Graduation: </label>
          <span>{student?.graduationdate || "Not set"}</span>
        </div>

        <hr />

        <div className="csp-item">
          <label>Approved Hours: </label>
          <span>
            {approved} hours ({approvedPct}%)
          </span>
        </div>

        <div className="csp-item">
          <label>Pending Hours: </label>
          <span>{pending} hours</span>
        </div>

        <hr />

        <div className="csp-item highlight">
          <label>Total Hours: </label>
          <span>
            {total} hours ({totalPct}%)
          </span>
        </div>
      </div>
    );
  }

  const approved = sumHours(submissions, "Approved");
  const pending = sumHours(submissions, "Pending");
  const totalStudents = students.length;

  const studentsCompleted40 = students.filter((stu) => {
    const stuHours = submissions
      .filter((s) => s.studentname === stu.studentname)
      .filter((s) => s.unifiedStatus === "Approved")
      .reduce((t, s) => t + parseFloat(s.hours || 0), 0);
    return stuHours >= 40;
  }).length;

  return (
    <div className="csp-container">
      <h3 className="csp-title">School Summary</h3>

      <div className="csp-item">
        <label>Total Students: </label>
        <span>{totalStudents}</span>
      </div>

      <div className="csp-item">
        <label>Total Approved Hours: </label>
        <span>{approved} hours</span>
      </div>

      <div className="csp-item">
        <label>Total Pending Hours: </label>
        <span>{pending} hours</span>
      </div>

      <hr />

      <div className="csp-item highlight">
        <label>Completed 40h: </label>
        <span>
          {studentsCompleted40} students (
          {Math.round((studentsCompleted40 / totalStudents) * 100)}%)
        </span>
      </div>
    </div>
  );
};

export default CounsellorStatsPanel;