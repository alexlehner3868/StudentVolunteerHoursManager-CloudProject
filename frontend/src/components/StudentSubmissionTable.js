import React, { useState } from "react";
import "../styles/Table.css";
import StudentSubmissionModal from "./StudentSubmissionModal";

const StudentSubmissionTable = ({ submissions }) => {
  const [selected, setSelected] = useState(null);

  // Date formatting 
  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatHours = (h) => {
    if (!h || isNaN(Number(h))) return "0h";
    const intH = Math.floor(Number(h));
    const m = Math.round((h - intH) * 60);
    return m ? `${intH}h ${m}m` : `${intH}h`;
  };

  // Format Status
  const fmtStatus = (status) => {
    if (!status) return "Pending";
    const s = status.toString().trim();
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };

  if (submissions.length === 0) {
    return (
      <div className="tb-container">
        <div className="no-submissions">
          <p>No submissions yet.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="tb-container">
        <table className="table">
          <thead>
            <tr>
              <th>Organization</th>
              <th>Date Volunteered</th>
              <th>Hours</th>
              <th>Supervisor Status</th>
              <th>Counsellor Status</th>
            </tr>
          </thead>

          <tbody>
            {submissions.map((sub) => {
              const sup = fmtStatus(sub.externsupstatus);
              const gc = fmtStatus(sub.guidancecounsellorapproved);

              // Determine Counsellor Status Display
              let gcDisplay = null;

              // Case 1 — Supervisor Denied 
              if (sup === "Denied") {
                gcDisplay = (
                  <span className="tb-status-badge tb-status-Denied">
                    --
                  </span>
                );
              }

              // Case 2 — Supervisor not yet approved
              else if (sup !== "Approved") {
                gcDisplay = (
                  <span className="tb-status-badge tb-status-Pending">
                    Waiting for Supervisor
                  </span>
                );
              }

              // Case 3 — Supervisor Approved 
              else {
                gcDisplay = (
                  <span className={`tb-status-badge tb-status-${gc}`}>
                    {gc}
                  </span>
                );
              }

              return (
                <tr key={sub.submissionid} onClick={() => setSelected(sub)} style={{ cursor: "pointer" }}>
                  <td>{sub.organization || "Not provided"}</td>

                  <td>{formatDate(sub.datevolunteered)}</td>

                  <td>{formatHours(sub.hours)}</td>

                  <td>
                    <span
                      className={`tb-status-badge tb-status-${sup}`}
                    >
                      {sup}
                    </span>
                  </td>

                  <td>{gcDisplay}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <StudentSubmissionModal selected={selected} onClose={() => setSelected(null)} />
    </>
  );
};

export default StudentSubmissionTable;
