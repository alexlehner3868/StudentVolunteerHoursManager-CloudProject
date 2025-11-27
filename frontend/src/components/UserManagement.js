import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function UserManagement() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  // Ensure that only admins can access this page
  useEffect(() => {
    if (!user || user.type !== "Admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const [role, setRole] = useState("Student");
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    schoolid: "",
    schoolname: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Call create-user backend end point
    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, ...formData })
    });

    const data = await res.json();
    alert(data.message);

    if (data.success) {
      setFormData({
        email: "",
        name: "",
        schoolid: "",
        schoolname: ""
      });
    }
  };

  return (
    <div className="user-management-container" style={{ padding: "20px" }}>
      <h1>User Management (Admin Only)</h1>

      <label><strong>User Role:</strong></label>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="Student">Student</option>
        <option value="GuidanceCounsellor">GuidanceCounsellor</option>
      </select>

      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={handleChange}
        />

        <input
          name="name"
          type="text"
          placeholder="Full Name"
          required
          value={formData.name}
          onChange={handleChange}
        />

        <input
          name="schoolid"
          type="text"
          placeholder="School ID"
          required
          value={formData.schoolid}
          onChange={handleChange}
        />

        <input
          name="schoolname"
          type="text"
          placeholder="School Name"
          required
          value={formData.schoolname}
          onChange={handleChange}
        />

        <button type="submit" style={{ marginTop: "15px" }}>
          Create User
        </button>
      </form>
    </div>
  );
}
