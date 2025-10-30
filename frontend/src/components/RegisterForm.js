import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Page.css"; // use same styling as Login

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    type: "student",
  });

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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

        // Redirect based on role to extra info page
        if (result.type === "student") {
          navigate("/student-info", { state: { email: result.email } });
        } else if (result.type === "guidance_counsellor") {
          navigate("/guidance-info", { state: { email: result.email } });
        }
       

          // Optionally clear form
          setFormData({
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
    <div className="page">
      <header className="pageHeader">
        <h1>Register</h1>
      </header>

      <form onSubmit={handleSubmit} className="form">
        {/* Email */}
        <input
          className="input"
          type="email"
          name="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {/* Password */}
        <input
          className="input"
          type="password"
          name="password"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {/* User Type */}
        <select
          className="input"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        >
          <option value="student">Student</option>
          <option value="guidance_counsellor">Guidance Counsellor</option>
        </select>

        {/* Submit Button */}
        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Register"}
        </button>
      </form>

      {/* Feedback Message */}
      {message && (
        <p
          className={message.startsWith("✅") ? "success" : "error"}
          style={{ marginTop: "1rem" }}
        >
          {message}
        </p>
      )}

      {/* Navigation to Login */}
      <div style={{ marginTop: "1rem" }}>
        <p
            onClick={() => navigate("/")}
            style={{
            color: "#007bff",
            cursor: "pointer",
            textDecoration: "underline",
            background: "none",
            border: "none",
            font: "inherit",
            padding: 0,
            margin: 0,
            display: "inline",
            }}
        >
            Back to Login
        </p>
        </div>
    </div>
  );
};

export default RegisterForm;
