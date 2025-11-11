import React, { useEffect, useState } from "react";
import StudentMonthlyView from "./StudentMonthlyView";
import StudentBarSummary from "./StudentBarSummary";

function StudentDashboard({ studentId }) {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({ approved_hours: 0, total_submitted: 0 });
  const [username, setUsername] = useState("Student");
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Fetching student dashboard for ID:", studentId);
        const nameRes = await fetch(`/api/student-name/${studentId}`);
        const nameText = await nameRes.text();
        let nameData;
        try {
          nameData = JSON.parse(nameText);
        } catch {
          console.error("Name endpoint did not return JSON!");
          return;
        }

        setUsername(nameData.name || "");

        const hoursRes = await fetch(`/api/volunteer-hours/${studentId}`);
        const hoursData = await hoursRes.json();

        const summaryRes = await fetch(`/api/volunteer-summary/${studentId}`);
        const summaryData = await summaryRes.json();

        setData(hoursData);
        setSummary(summaryData);
      } catch (err) {
        console.error("Error getting student dashboard info:", err);
      }
    }
    fetchData();
  }, [studentId]);

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        console.log("Fetching student submissions for ID:", studentId);
        const res = await fetch(`/api/student/${studentId}/submissions`);
        const data = await res.json();
        setSubmissions(data);
      } catch (err) {
        console.error("Error fetching submissions:", err);
      }
    }
    fetchSubmissions();
  }, [studentId]);

  const hoursApproved = summary.approved_hours || 0;
  const percentComplete = (hoursApproved / 40 * 100).toFixed(1);
  const percentCompleteWidth = Math.min((hoursApproved / 40) * 100, 100).toFixed(1);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome, {username}!</h1>

      <div style={{ marginBottom: "20px" }}>
        <div style={{ width: "100%", height: "20px", background: "#eee", borderRadius: "10px", overflow: "hidden", position: "relative" }}>
          <div
            style={{
              width: `${percentCompleteWidth}%`,
              height: "100%",
              background: "#4caf50",
              transition: "width 0.3s ease",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              paddingRight: "5px",
              color: "white",
              fontWeight: "bold",
              fontSize: "12px",
            }}
          >
            {percentComplete}%
          </div>
        </div>
        <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", fontSize: "12px", marginTop: "2px", color: "#555" }}>
          {hoursApproved} / 40 hours
        </div>
      </div>

      <div style={{ display: "flex", gap: "30px", flexWrap: "nowrap", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 25%", minWidth: "200px" }}>
          <h3>All Hours by Status</h3>
          <StudentBarSummary data={data} />
        </div>

        <div style={{ flex: "3 1 75%", minWidth: "300px" }}>
          <h3>Hours Volunteered by Month</h3>
          <StudentMonthlyView data={data} />
        </div>
      </div>

      <div style={{ marginTop: "40px" }}>
        <h3>Your Submissions</h3>
        {submissions.length === 0 ? (
          <p style={{ color: "#777" }}>No submissions yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {submissions.map((submission) => {
              const org = (submission.organization) || "Organization not provided";
              const dateStr = submission.datevolunteered
                ? new Date(submission.datevolunteered).toLocaleDateString()
                : "Date not provided";

              const toHM = (val) => {
                const n = Number(val);
                if (!isFinite(n) || n <= 0) return "0h";
                const h = Math.trunc(n);
                let m = Math.round((n - h) * 60);
                if (m === 60) { m = 0; }
                return m ? `${h}h ${m}m` : `${h}h`;
              };
              const hoursStr = toHM(submission.hours);

              const fmt = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "Pending");
              const supStatus = fmt(submission.externsupstatus);
              const gcStatus = fmt(submission.guidancecounsellorapproved);

              return (
                <button
                  key={submission.submissionid}
                  type="button"
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "15px",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    background: "#fafafa",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>{org}</div>
                  <div style={{ fontSize: "14px", color: "#555" }}>
                    {dateStr} — {hoursStr}
                  </div>
                  <div style={{ marginTop: "8px", fontWeight: 600 }}>
                    Supervisor: {supStatus}
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    Counsellor: {gcStatus}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
