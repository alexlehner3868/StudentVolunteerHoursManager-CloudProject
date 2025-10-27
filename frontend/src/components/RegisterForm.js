// frontend/src/components/RegisterForm.js
import React, { useState } from "react";
import NavBar from "./NavBar";
import "./SubmissionForm.css"; // reuse same styling

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      // Same pattern as SubmissionForm.js
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("✅ Registration successful!");
        setFormData({ fullname: "", email: "", password: "" });
      } else {
        setMessage("❌ Error: " + (result.error || "Registration failed"));
      }
    } catch (err) {
      console.error("Network error:", err);
      setMessage("❌ Network error submitting form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      

      <div className="form-card">
        <h2>Student Registration</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <label>Full Name</label>
            <input
              type="text"
              name="fullname"
              placeholder="Enter full name"
              value={formData.fullname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-section">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-section">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Register"}
          </button>
        </form>

        {message && (
          <div
            className={`message ${
              message.startsWith("✅") ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;
