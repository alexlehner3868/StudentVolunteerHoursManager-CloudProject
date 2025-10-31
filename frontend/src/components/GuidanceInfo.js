//StudentVolunteerHoursManager-CloudProject/frontend/src/components/GuidanceInfo.js
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Page.css"; // match Register and StudentInfo styling

const GuidanceInfo = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    counsellorname: "",
    schoolid: "",
    schoolname: "",
  });

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/guidance-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, email: state?.email }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage("✅ Guidance counsellor information saved successfully!");
        navigate("/"); // redirect to login or main page
      } else {
        setMessage("❌ " + (result.error || "Failed to save counsellor info."));
      }
    } catch (err) {
      console.error("Network error:", err);
      setMessage("❌ Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="pageHeader">
        <h1>Guidance Counsellor Information</h1>
      </header>

      <form onSubmit={handleSubmit} className="form">
        <input
          className="input"
          name="counsellorname"
          placeholder="Full Name"
          value={form.counsellorname}
          onChange={handleChange}
          required
        />

        <input
          className="input"
          name="schoolid"
          placeholder="School ID"
          value={form.schoolid}
          onChange={handleChange}
          required
        />

        <input
          className="input"
          name="schoolname"
          placeholder="School Name"
          value={form.schoolname}
          onChange={handleChange}
          required
        />

        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Save Info"}
        </button>
      </form>

      {message && (
        <p
          className={message.startsWith("✅") ? "success" : "error"}
          style={{ marginTop: "1rem" }}
        >
          {message}
        </p>
      )}

      
    </div>
  );
};

export default GuidanceInfo;
