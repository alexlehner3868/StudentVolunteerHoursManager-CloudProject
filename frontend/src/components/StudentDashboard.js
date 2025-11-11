import React, { useEffect, useState } from "react";
import StudentMonthlyView from "./StudentMonthlyView";
import StudentBarSummary from "./StudentBarSummary";

function StudentDashboard({ studentId }) {

  const [data, setData] = useState([]); // Store Monthly hours 
  const [summary, setSummary] = useState({ approved_hours: 0, total_submitted: 0 }); // Store all up hours
  const [username, setUsername] = useState("Student"); // Default name

  // Get the data from the backend

useEffect(() => {
  async function fetchData() {
    try {
      console.log("Fetching student dashboard for ID:", studentId);

      // --- Debugging lines ---
      const nameRes = await fetch(`/api/student-name/${studentId}`);
      console.log("Name fetch status:", nameRes.status);
      const nameText = await nameRes.text();
      console.log("Name fetch text:", nameText.slice(0, 200)); // show first 200 chars

      // Try parsing JSON only if it’s actually JSON
      let nameData;
      try {
        nameData = JSON.parse(nameText);
      } catch {
        console.error("Name endpoint did not return JSON!");
        return; // stop here to avoid the other fetches failing
      }

      setUsername(nameData.name || "");

      // Continue with the others only if the first worked
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


  // Calculate the percent complete for the progress bar
  const hoursApproved = summary.approved_hours || 0;
  const percentComplete = (hoursApproved / 40 * 100).toFixed(1); 
  const percentCompleteWidth = Math.min((hoursApproved / 40) * 100, 100).toFixed(1); 

  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome, {username}!</h1>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ width: "100%", height: "20px",background: "#eee",  borderRadius: "10px", overflow: "hidden", position: "relative"}}>
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

      <div style={{ display: "flex", gap: "30px", flexWrap: "nowrap", alignItems: "flex-start"}}>
        <div style={{ flex: "1 1 25%", minWidth: "200px" }}>
          <h3>All Hours by Status</h3>
          <StudentBarSummary data={data} />
        </div>

        <div style={{ flex: "3 1 75%", minWidth: "300px" }}>
          <h3>Hours Volunteered by Month</h3>
          <StudentMonthlyView data={data} />
        </div>
      </div>
      {/* Submissions Section */}
      <div style={{ marginTop: "40px" }}>
        <h3>Your Submissions</h3>

        {data.length === 0 ? (
          <p style={{ color: "#777" }}>No submissions yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {data.map((submission) => {
              const isApproved =
                submission.guidancecounsellorapproved === "approved";

              return (
                <button
                  key={submission.submissionid}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "15px",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    background: isApproved ? "#e8f5e9" : "#fffde7",
                    cursor: isApproved ? "default" : "pointer",
                    transition: "background 0.3s",
                  }}
                  onClick={() => {
                    if (!isApproved) {
                      console.log("Update submission:", submission.submissionid);
                      // Later: navigate(`/update-submission/${submission.submissionid}`);
                    }
                  }}
                >
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                    {submission.organization}
                  </div>

                  <div style={{ fontSize: "14px", color: "#555" }}>
                    {submission.datevolunteered
                      ? new Date(submission.datevolunteered).toLocaleDateString()
                      : "N/A"}{" "}
                    — {submission.hours || 0} hrs
                  </div>

                  <div
                    style={{
                      marginTop: "5px",
                      color: isApproved ? "#388e3c" : "#f57c00",
                      fontWeight: 600,
                    }}
                  >
                    {isApproved ? "Approved" : "Pending Approval"}
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
