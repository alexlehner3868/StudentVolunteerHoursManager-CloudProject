import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Page.css";

const StudentInfo = () => {
  const navigate = useNavigate();

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
      // --- Step 1: Activate preloaded user account ---
      const registerRes = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          type: "student",
        }),
      });

      const registerResult = await registerRes.json();
      if (!registerRes.ok) throw new Error(registerResult.error);

      // --- Step 2: Add student profile info ---
      const infoRes = await fetch("/api/student-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          studentname: form.studentname,
          schoolid: form.schoolid,
          schoolname: form.schoolname,
          graduationdate: form.graduationdate,
        }),
      });

      const infoResult = await infoRes.json();
      if (!infoRes.ok) throw new Error(infoResult.error);

      setMessage("✅ Account activated and student info saved!");
      navigate("/"); // redirect to login
    } catch (err) {
      setMessage("❌ " + err.message);
      console.error(err);
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

        <label htmlFor="graduationdate">Graduation Date</label>
        <input
          id="graduationdate"
          className="input"
          type="date"
          name="graduationdate"
          value={form.graduationdate}
          onChange={handleChange}
        />

        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Activate Account"}
        </button>
      </form>

      {message && (
        <p className={message.startsWith("✅") ? "success" : "error"} style={{ marginTop: "1rem" }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default StudentInfo;
