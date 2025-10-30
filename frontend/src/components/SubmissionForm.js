import React, { useState } from "react";
import NavBar from "./NavBar";
import "./SubmissionForm.css";

const VolunteerSubmissionForm = () => {
  // Matches the fields on the form
  const [formData, setFormData] = useState({
    organization: "",
    date_volunteered: "",
    hours: "",
    minutes: "",
    extern_sup_name: "",
    extern_sup_email: "",
    description: "",
  });

  // Submission Status Messages
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
      const user = JSON.parse(localStorage.getItem("user"));
      const studentId = user;

      if (!studentId) {
        setMessage("User not found. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      const submissionData = { ...formData, studentId };

      const res = await fetch("/api/volunteer-hours/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const result = await res.json();
      if (result.success) {
        setMessage("Successfully Submitted!");
        setFormData({
          organization: "",
          date_volunteered: "",
          hours: "",
          minutes: "",
          extern_sup_name: "",
          extern_sup_email: "",
          description: "",
        });
      } else {
        setMessage("Unable to Submit ... Please Try Again");
        console.log("Error:", result.error);
      }
    } catch (err) {
      console.error(err);
      setMessage("Unable to Submit ... Please Try Again Later");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <NavBar userType="student" />

      <div className="form-card">
        <h2>Volunteer Hour Submission</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <label>Date of Volunteering</label>
            <input
              type="date"
              name="date_volunteered"
              value={formData.date_volunteered}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-section">
            <label>Organization</label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-section flex-row">
            <div>
              <label>Hours</label>
              <input
                type="number"
                name="hours"
                min="0"
                value={formData.hours}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Minutes</label>
              <input
                type="number"
                name="minutes"
                min="0"
                max="59"
                value={formData.minutes}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="form-section">
            <label>Supervisor Information</label>
            <div className="flex-row">
              <input
                type="text"
                name="extern_sup_name"
                placeholder="Name"
                value={formData.extern_sup_name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="extern_sup_email"
                placeholder="Email"
                value={formData.extern_sup_email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Hours"}
          </button>
        </form>

        {message && (
          <div
            className={`message ${
              message.startsWith("Successfully") ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerSubmissionForm;
