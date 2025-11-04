import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Page.css";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    type: "student",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    graduationDate: "",
  });

  const [step, setStep] = useState("email"); // email → password → details
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validate password complexity
  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[{\]};:'",<.>/?\\|`~]).{8,}$/;
    return regex.test(password);
  };

  // Step 1 — Verify Email Exists in Users Table
  const handleEmailCheck = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, type: formData.type }),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("✅ Email verified. Please create a password.");
        setStep("password");
      } else {
        setMessage("❌ " + (result.error || "Email not found in system."));
      }
    } catch (err) {
      setMessage("❌ Network error while verifying email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2 — Set Password
  const handlePasswordSet = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validatePassword(formData.password)) {
      return setMessage(
        "❌ Password must be 8+ chars with uppercase, lowercase, number, and special character."
      );
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          type: formData.type,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("✅ Password set. Please enter your details.");
        setStep("details");
      } else {
        setMessage("❌ " + (result.error || "Error setting password."));
      }
    } catch (err) {
      setMessage("❌ Network error while setting password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3 — Submit Profile Details
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
      let endpoint, body;

      // ✅ Define regex before using it
      const nameRegex = /^[A-Za-z\s'-]+$/;
      if (!nameRegex.test(formData.firstName) || !nameRegex.test(formData.lastName)) {
        setMessage("❌ Invalid name. Only letters, spaces, hyphens, and apostrophes are allowed.");
        setIsSubmitting(false);
        return;
      }

      if (formData.type === "student") {
        const today = new Date().toISOString().split("T")[0];
        if (formData.graduationDate < today) {
          setMessage("❌ Graduation date cannot be in the past.");
          setIsSubmitting(false);
          return;
        }

        endpoint = "/api/student-info";
        body = {
          email: formData.email,
          studentname: fullName,
          graduationdate: formData.graduationDate,
        };
      } else {
        endpoint = "/api/guidance-info";
        body = {
          email: formData.email,
          counsellorname: fullName,
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("✅ Account activated successfully!");
        setTimeout(() => navigate("/"), 1500);
      } else {
        setMessage("❌ " + (result.error || "Failed to save information."));
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setMessage("❌ Network error during registration.");
    } finally {
      setIsSubmitting(false);
    }
  };


  // Dynamic form rendering by step
  return (
    <div className="page">
      <header className="pageHeader">
        <h1>Account Activation</h1>
      </header>

      {/* Step: Select Role + Email */}
      {step === "email" && (
        <form onSubmit={handleEmailCheck} className="form">
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

          <input
            className="input"
            type="email"
            name="email"
            placeholder="Enter your school email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Checking..." : "Verify Email"}
          </button>
        </form>
      )}

      {/* Step: Set Password */}
      {step === "password" && (
        <form onSubmit={handlePasswordSet} className="form">
          <input
            className="input"
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Set Password"}
          </button>
        </form>
      )}

      {/* Step: Enter Details */}
      {step === "details" && (
        <form onSubmit={handleDetailsSubmit} className="form">
          <input
            className="input"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          <input
            className="input"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />

          {formData.type === "student" && (
            <>
              <label htmlFor="graduationDate" style={{ fontWeight: 500 }}>
                Graduation Date
              </label>
              <input
                id="graduationDate"
                className="input"
                type="date"
                name="graduationDate"
                value={formData.graduationDate}
                onChange={handleChange}
                required
              />
            </>
          )}

          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Complete Registration"}
          </button>
        </form>
      )}

      {/* Feedback */}
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
          }}
        >
          Back to Login
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
