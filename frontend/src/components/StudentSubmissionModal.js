import React, { useState } from "react";
import "../styles/StudentDashboard.css";

// Helper formatting functions
const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-CA") : "");
const formatDisplayDate = (d) =>
  d ? new Date(d).toLocaleDateString() : "Not provided";

const formatHours = (h) => {
  if (!h || isNaN(Number(h))) return "0h";
  const intH = Math.floor(Number(h));
  const m = Math.round((h - intH) * 60);
  return m ? `${intH}h ${m}m` : `${intH}h`;
};

const fmtStatus = (s) => {
  if (!s) return "Pending";
  const t = s.toString().trim();
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
};

export default function StudentSubmissionModal({ selected, onClose }) {
  if (!selected) return null;

  const sup = fmtStatus(selected.externsupstatus);
  const gc = fmtStatus(selected.guidancecounsellorapproved);

  const supervisorResponded = sup === "Approved" || sup === "Denied";

  // Combined Status Label
  let statusText = "";
  let statusClass = "";

  if (sup === "Denied") {
    statusText = "Supervisor Denied";
    statusClass = "tb-status-Denied";
  } else if (sup !== "Approved") {
    statusText = "Waiting for Supervisor";
    statusClass = "tb-status-Pending";
  } else if (gc === "Pending" || gc === null) {
    statusText = "Supervisor Approved — Waiting for Guidance Counsellor";
    statusClass = "tb-status-Pending";
  } else if (gc === "Approved") {
    statusText = "Guidance Counsellor Approved";
    statusClass = "tb-status-Approved";
  } else if (gc === "Denied") {
    statusText = "Guidance Counsellor Rejected";
    statusClass = "tb-status-Denied";
  }

  const [isEditing, setIsEditing] = useState(false);

  const [editOrg, setEditOrg] = useState(selected.organization);
  const [editDate, setEditDate] = useState(formatDate(selected.datevolunteered));
  const [editDesc, setEditDesc] = useState(selected.description || "");
  const [editEmail, setEditEmail] = useState(selected.externsupemail || "");

  const rawHours = Number(selected.hours);
  const defaultHours = Math.floor(rawHours);
  const defaultMinutes = Math.round((rawHours - defaultHours) * 60);

  const [editHours, setEditHours] = useState(defaultHours);
  const [editMinutes, setEditMinutes] = useState(defaultMinutes);


  const saveChanges = async () => {
    try {
        const res = await fetch(`/api/student/${selected.studentid}/submissions/${selected.submissionid}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                organization: editOrg,
                date_volunteered: editDate,
                hours: editHours,
                minutes: editMinutes,
                description: editDesc,
                extern_sup_email: editEmail
                }),
            }
        );


      const data = await res.json();

      if (data.success) {
        alert("Submission updated.");
        window.location.reload();
      } else {
        alert("Update failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error while updating.");
    }
  };

  const deleteSubmission = async () => {
    if (!selected) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this submission?");
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/volunteer-hours/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selected.submissionid,
          studentId: selected.studentid,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Submission deleted.");
        onClose();
        window.location.reload();
      } else {
        alert("Failed to delete: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error deleting submission.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-two-col" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h2>{selected.organization}</h2>
          <button className="modal-close-x" onClick={onClose}>✕</button>
        </div>

        <div className="modal-status-top">
          <span className={`tb-status-badge ${statusClass}`}>{statusText}</span>
        </div>

        {!isEditing ? (
          <>
            <div className="modal-columns">
              <div className="modal-left">
                <div className="modal-section-clean">
                  <p><b>Date Volunteered:</b> {formatDisplayDate(selected.datevolunteered)}</p>
                  <p><b>Hours:</b> {formatHours(selected.hours)}</p>
                </div>

                <div className="modal-section-clean">
                  <p><b>Description:</b></p>
                  <p>{selected.description || "No description provided"}</p>
                </div>

                <div className="modal-section-clean">
                  <p><b>Supervisor Contact:</b></p>
                  <p>{selected.externsupemail || "Not provided"}</p>
                </div>
              </div>

              <div className="modal-right">
                {sup !== "Pending" && selected.externsupcomments && (
                  <div className="modal-section-clean">
                    <p><b>Supervisor Comments:</b></p>
                    <p>{selected.externsupcomments}</p>
                  </div>
                )}

                {selected.guidancecounsellorcomments && (
                  <div className="modal-section-clean">
                    <p><b>Counsellor Comments:</b></p>
                    <p>{selected.guidancecounsellorcomments}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
            <button
                className="modal-btn modal-edit"
                disabled={supervisorResponded}
                onClick={() => setIsEditing(true)}
                style={{ opacity: supervisorResponded ? 0.5 : 1 }}
                >
                Edit Submission
            </button>


              <button className="modal-btn modal-delete" onClick={deleteSubmission}>
                Delete
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="modal-columns">
              <div className="modal-left">

                <div className="modal-section-clean">
                  <label><b>Organization:</b></label>
                  <input
                    type="text"
                    value={editOrg}
                    onChange={(e) => setEditOrg(e.target.value)}
                  />
                </div>

                <div className="modal-section-clean">
                  <label><b>Date Volunteered:</b></label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>

                <div className="modal-section-clean">
                  <label><b>Hours:</b></label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={editHours}
                      onChange={(e) => setEditHours(e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={editMinutes}
                      onChange={(e) => setEditMinutes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-section-clean">
                  <label><b>Description:</b></label>
                  <textarea
                    rows={4}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                  />
                </div>

                <div className="modal-section-clean">
                  <label><b>Supervisor Email:</b></label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>

              </div>

              <div className="modal-right">
                <p style={{ opacity: 0.6 }}>Supervisor and counsellor comments cannot be edited.</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-btn modal-edit" onClick={saveChanges}>
                Save Changes
              </button>
              <button className="modal-btn modal-delete" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
