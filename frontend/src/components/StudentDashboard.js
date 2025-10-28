import React, { useEffect, useState } from "react";
import StudentMonthlyView from "./StudentMonthlyView";
import StudentBarSummary from "./StudentBarSummary";

function StudentDashboard({ studentId }) {

  const [data, setData] = useState([]); // Store Monthly hours 
  const [summary, setSummary] = useState({ approved_hours: 0, total_submitted: 0 }); // Store all up hours

  const username = "Student"; //Temp -- Pull from database or token 
  // Get the data from the backend
  useEffect(() => {
    async function fetchData() {
      try {
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

    </div>
  );
}

export default StudentDashboard;
