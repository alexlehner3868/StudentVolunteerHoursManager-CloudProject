import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Page.css";

const StudentInfo = () => {
  const navigate = useNavigate();

  // ✅ Auto-detect backend base URL
  const BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3000" // for local dev
      : window.location.origin; // for production (e.g., http://178.128.232.57)

  const [form, setForm] = useState({
    email: "",
    password: "",
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
      // --- Step 1️⃣ Activate preloaded user account ---
      const registerRes = await fetch(`${BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password.trim(),
          type: "student",
        }),
      });

      if (!registerRes.ok) {
        const err = await registerRes.json();
        throw new Error(err.error || "Failed to register user.");
      }

      console.log("✅ Register successful");

      // --- Step 2️⃣ Add student info ---
      const infoRes = await fetch(`${BASE_URL}/api/student-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          studentname: form.studentname.trim(),
          schoolid: form.schoolid.trim(),
          schoolname: form.schoolname.trim(),
          graduationdate: form.graduationdate || null,
        }),
      });

      if (!infoRes.ok) {
        const err = await infoRes.json();
        throw new Error(err.error || "Failed to save student information.");
      }

      setMessage("✅ Account activated and student info saved!");
      console.log("✅ Student info saved");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error("❌ Registration error:", err);
      setMessage("❌ " + (err.message || "Network error during registration."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="pageHeader">
        <h1>Activate Student Account</h1>
      </header>

      <form onSubmit={handleSubmit} className="form">
        <input
          className="input"
          name="email"
          placeholder="School Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          className="input"
          type="password"
          name="password"
          placeholder="Create Password"
          value={form.password}
          onChange={handleChange}
          required
        />

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

        <label htmlFor="graduationdate" style={{ fontWeight: 500 }}>
          Graduation Date
        </label>
        <input
          id="graduationdate"
          className="input"
          type="date"
          name="graduationdate"
          value={form.graduationdate}
          onChange={handleChange}
          required
        />

        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Activate Account"}
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
