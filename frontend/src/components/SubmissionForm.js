import React, { useState } from "react";
import NavBar from "./NavBar";

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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Student NavBar at top */}
      <NavBar userType="student" />

      <div className="flex justify-center items-start pt-10">
        <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
          <h2 className="text-3xl font-semibold mb-6 text-center text-blue-700">
            Volunteer Hour Submission
          </h2>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Organization
              </label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Date Volunteered
              </label>
              <input
                type="date"
                name="date_volunteered"
                value={formData.date_volunteered}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <div className="w-1/2">
                <label className="block text-gray-700 mb-1 font-medium">
                  Hours
                </label>
                <input
                  type="number"
                  name="hours"
                  min="0"
                  value={formData.hours}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-gray-700 mb-1 font-medium">
                  Minutes
                </label>
                <input
                  type="number"
                  name="minutes"
                  min="0"
                  max="59"
                  value={formData.minutes}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Supervisor Name
              </label>
              <input
                type="text"
                name="extern_sup_name"
                value={formData.extern_sup_name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Supervisor Email
              </label>
              <input
                type="email"
                name="extern_sup_email"
                value={formData.extern_sup_email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full text-white font-semibold rounded-lg py-3 transition 
                ${isSubmitting
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Hours"}
            </button>
          </form>

          {message && (
            <div
              className={`mt-6 text-center font-medium rounded-lg p-3 ${
                message.startsWith("✅")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerSubmissionForm;
