import React, { useState } from "react";

const VolunteerSubmissionForm = () => {
  const [formData, setFormData] = useState({
    organization: "",
    date_volunteered: "",
    hours: "",
    minutes: "",
    extern_sup_name: "",
    extern_sup_email: "",
    description: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/submit-hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (result.success) {
        setMessage("✅ Submission successful!");
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
        setMessage("❌ Error: " + result.error);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Network error submitting form.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-xl p-6 border border-gray-200">
      <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
        Volunteer Hour Submission
      </h2>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          type="text"
          name="organization"
          placeholder="Organization"
          value={formData.organization}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />
        <input
          type="date"
          name="date_volunteered"
          value={formData.date_volunteered}
          onChange={handleChange}
          required
          className="w-full border rounded-lg p-2"
        />
        <div className="flex gap-2">
          <input
            type="number"
            name="hours"
            placeholder="Hours"
            value={formData.hours}
            onChange={handleChange}
            required
            className="w-1/2 border rounded-lg p-2"
          />
          <input
            type="number"
            name="minutes"
            placeholder="Minutes"
            value={formData.minutes}
            onChange={handleChange}
            required
            className="w-1/2 border rounded-lg p-2"
          />
        </div>
        <input
          type="text"
          name="extern_sup_name"
          placeholder="Supervisor Name"
          value={formData.extern_sup_name}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />
        <input
          type="email"
          name="extern_sup_email"
          placeholder="Supervisor Email"
          value={formData.extern_sup_email}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
          rows={4}
        ></textarea>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2 transition"
        >
          Submit
        </button>
      </form>
      {message && (
        <p
          className={`mt-4 text-center font-medium ${
            message.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default VolunteerSubmissionForm;
