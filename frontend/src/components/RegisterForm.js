import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import "../styles/Page.css"; // use same styling as Login

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    fullname: "",
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

        // Optionally redirect after success:
        navigate("/");

        // Clear form
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
    <div className="page">
      

      <header className="pageHeader">
        <h1>Register</h1>
      </header>

      <form onSubmit={handleSubmit} className="form">
        <input
          className="input"
          type="text"
          name="fullname"
          placeholder="Enter full name"
          value={formData.fullname}
          onChange={handleChange}
          required
        />

        <input
          className="input"
          type="email"
          name="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          className="input"
          type="password"
          name="password"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleChange}
          required
        />

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

        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Register"}
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

      <div style={{ marginTop: "1rem" }}>
        <p>Already have an account?</p>
        <button
          className="link-button"
          type="button"
          onClick={() => navigate("/")}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
