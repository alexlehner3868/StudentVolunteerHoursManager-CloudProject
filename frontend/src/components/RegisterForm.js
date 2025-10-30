import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- For redirecting (React Router)
import NavBar from "./NavBar";
import "./SubmissionForm.css"; // reuse same styling

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    type: "student",
  });

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate(); // <-- Used to programmatically navigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("✅ Registration successful!");

        // TODO: When login page and endpoint exist, redirect like this:
        // navigate("/login");

        // For now, just clear form
        setFormData({
          fullname: "",
          email: "",
          password: "",
          type: "student",
        });
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
      <NavBar />

      <div className="form-card">
        <h2>User Registration</h2>

        <form onSubmit={handleSubmit}>
          {/* Full name */}
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

          {/* Email */}
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

          {/* Password */}
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

          {/* Type dropdown */}
          <div className="form-section">
            <label>User Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="student">Student</option>
              <option value="guidance_counsellor">Guidance Counsellor</option>
            </select>
          </div>

          {/* Submit button */}
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

        <div className="form-footer">
            <p>Already have an account?</p>
            <button
                type="button"
                className="link-button"
                onClick={() => navigate("/login")}
            >
                Go to Login
            </button>
            </div>
        
      </div>
    </div>
  );
};

export default RegisterForm;
