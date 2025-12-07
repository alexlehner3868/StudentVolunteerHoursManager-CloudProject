import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Page.css";

const SystemMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  // Fetch system metrics from the backend API
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/system-metrics");
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        console.error("Error fetching system metrics:", err);
        setError("Failed to load system metrics.");
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // update every 10s
    return () => clearInterval(interval);
  }, []);
  // Render the system metrics dashboard
  return (
    <div className="page">
      <header className="pageHeader">
        <h1>System Resource Dashboard</h1>
      </header>

      <div className="form" style={{ maxWidth: "900px" }}>
        {error && <p className="error">{error}</p>}
        {!metrics && !error && <p>Loading system metrics...</p>}

        {metrics && (
          <>
            <div className="metrics-grid">
              <div className="metric-card">
                <h3>CPU Usage</h3>
                <p>{metrics.cpu ? `${metrics.cpu}%` : "N/A"}</p>
              </div>

              <div className="metric-card">
                <h3>Memory Usage</h3>
                <p>{metrics.memory ? `${metrics.memory}%` : "N/A"}</p>
              </div>

              <div className="metric-card">
                <h3>Disk (System)</h3>
                <p>
                  {metrics.disk_system
                    ? `${metrics.disk_system}% used`
                    : "N/A"}
                </p>
              </div>

              

              <div className="metric-card">
                <h3>Network In</h3>
                <p>
                  {metrics.network_in_mb
                    ? `${metrics.network_in_mb} MB`
                    : "N/A"}
                </p>
              </div>

              <div className="metric-card">
                <h3>Network Out</h3>
                <p>
                  {metrics.network_out_mb
                    ? `${metrics.network_out_mb} MB`
                    : "N/A"}
                </p>
              </div>
            </div>

            <small className="timestamp">
              Last updated:{" "}
              {metrics.timestamp
                ? new Date(metrics.timestamp).toLocaleTimeString()
                : "N/A"}
            </small>
          </>
        )}

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <p
            onClick={() => navigate("/")}
            style={{
              color: "#1e3a8a",
              cursor: "pointer",
              textDecoration: "underline",
              fontWeight: 500,
            }}
          >
            Back to Dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemMetrics;
