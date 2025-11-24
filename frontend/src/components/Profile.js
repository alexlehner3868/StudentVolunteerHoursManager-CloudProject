import React, { useState, useEffect } from "react";
import Navbar from "../components/NavBar";
import "../styles/Profile.css";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [graduationDate, setGraduationDate] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [counsellors, setCounsellors] = useState([]);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : {};
  const userId = user.userId || 0;
  const userType = user?.type || "Student";

  useEffect(() => {
    if (!user || Object.keys(user).length === 0) {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("Fetching profile for userId:", userId);

        let profileUrl = "";
        if (userType === "Student") {
          profileUrl = `/api/student/${userId}/profile`;
        } else if (userType === "GuidanceCounsellor") {
          profileUrl = `/api/gc/${userId}/profile`;
        }

        const res = await fetch(profileUrl);
        if (!res.ok)
          throw new Error(`Failed to fetch profile for userId ${userId}`);

        const data = await res.json();
        console.log("Profile data fetched:", data);
        setProfileData(data);

        if (userType === "Student" && data.GraduationDate) {
          setGraduationDate(data.GraduationDate.slice(0, 10));
        }

        if (userType === "Student") {
          const gcRes = await fetch(
            `/api/student/${userId}/guidance-counsellors`
          );
          if (!gcRes.ok)
            throw new Error("Failed to fetch guidance counsellors");

          const gcData = await gcRes.json();
          setCounsellors(gcData);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [userId, userType]);

  const handleSave = async () => {
    try {
      console.log("Saving graduation date:", graduationDate);

      const res = await fetch(`/api/student/${userId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ GraduationDate: graduationDate }),
      });

      if (!res.ok)
        throw new Error(
          `Failed to update graduation date for userId ${userId}`
        );
      const updatedData = await res.json();
      console.log("Updated profile data:", updatedData);
      setProfileData(updatedData);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating graduation date:", err);
    }
  };

  if (!profileData) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <Navbar userType={userType} />

      <div className="form-card">
        <h2>
          {userType === "Student"
            ? "Student Profile"
            : "Guidance Counsellor Profile"}
        </h2>

        <div className="form-section">
          <label>Name:</label>
          <div>{profileData.name || profileData.counsellorname || "N/A"}</div>
        </div>

        <div className="form-section">
          <label>Email:</label>
          <div>{profileData.email || "N/A"}</div>
        </div>

        <div className="form-section">
          <label>School:</label>
          <div>{profileData.schoolname || "N/A"}</div>
        </div>

        {userType === "Student" && (
          <div className="form-section">
            <label>Graduation Date:</label>
            <div className="flex-row" style={{ alignItems: "center" }}>
              <span>{graduationDate || "N/A"}</span>
              {!isEditing && (
                <button
                  className="edit-btn"
                  style={{ marginLeft: "10px", padding: "5px 10px" }}
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              )}
            </div>

            {isEditing && (
              <div className="flex-row" style={{ marginTop: "10px" }}>
                <input
                  type="date"
                  value={graduationDate}
                  onChange={(e) => setGraduationDate(e.target.value)}
                />
                <button className="submit-btn" onClick={handleSave}>
                  Save
                </button>
                <button
                  className="cancel-btn"
                  style={{ backgroundColor: "#ccc", marginLeft: "5px" }}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {userType === "Student" && (
          <div className="form-section">
            <h3>
              Guidance Counsellors at {profileData.schoolname || "N/A"}
            </h3>

            {counsellors.length === 0 ? (
              <p>No guidance counsellors found.</p>
            ) : (
              <ul>
                {counsellors.map((gc) => (
                  <li key={gc.userid || gc.UserID}>
                    {gc.name || gc.counsellorname} — {gc.email}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
