// StudentVolunteerHoursManager-CloudProject/frontend/src/components/StudentInfo.js

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Page.css"; // match RegisterForm + Login styling

const StudentInfo = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    studentname: "",
    schoolid: "",
    schoolname: "",
    graduationdate: "",
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
      const res = await fetch("/api/student-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, email: state?.email }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage("✅ Student information saved successfully!");
        navigate("/"); // redirect to login or main
      } else {
        setMessage("❌ " + (result.error || "Failed to save student info."));
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
        <h1>Student Information</h1>
      </header>

      <form onSubmit={handleSubmit} className="form">
        <input
          className="input"
          name="studentname"
          placeholder="Full Name"
          value={form.studentname}
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

        {/* 🔹 Label for Graduation Date */}
        <label
          htmlFor="graduationdate"
          style={{ alignSelf: "flex-start", marginBottom: "0.25rem", fontWeight: "500" }}
        >
          Graduation Date
        </label>
        <input
          id="graduationdate"
          className="input"
          name="graduationdate"
          type="date"
          value={form.graduationdate}
          onChange={handleChange}
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

export default StudentInfo;
