import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { db, auth } from "../utils/firebase";
import { query, where, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "../styles/Profile.css";

const Profile = () => {
  const [employee, setEmployee] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook for navigation

  const fetchEmployeeDetails = async (email) => {
    try {
      const q = query(collection(db, "employee"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0];
        setEmployee({ id: docData.id, ...docData.data() });
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!employee?.id) return;

    try {
      const docRef = doc(db, "employee", employee.id);
      await updateDoc(docRef, {
        name: employee.name || "",
        personalInfo: {
          phone: employee.personalInfo?.phone || "",
          address: employee.personalInfo?.address || "",
          city: employee.personalInfo?.city || "",
          state: employee.personalInfo?.state || "",
          country: employee.personalInfo?.country || "",
        },
        dob: employee.dob || "",
        gender: employee.gender || "",
        maritalStatus: employee.maritalStatus || "",
        nationality: employee.nationality || "",
        bloodGroup: employee.bloodGroup || "",
      });
      setIsEditable(false);
    } catch (error) {
      console.error("Error updating employee details:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("personalInfo")) {
      const [parent, child] = name.split(".");
      setEmployee((prevEmployee) => ({
        ...prevEmployee,
        [parent]: {
          ...prevEmployee[parent],
          [child]: value,
        },
      }));
    } else {
      setEmployee((prevEmployee) => ({
        ...prevEmployee,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        fetchEmployeeDetails(user.email);
      } else {
        setLoading(false);
      }
    });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!employee) return <p>No employee data found!</p>;

  return (
    <div className="profile-container">
            <button className="back-button" onClick={() => navigate(-1)}>← Back</button>

      <h2 className="profile-title">My Profile</h2>
      <form className="profile-form">
        <div className="profile-row">
          <div className="profile-group">
            <label className="profile-label">Name:</label>
            <input
              className="profile-input"
              type="text"
              name="name"
              value={employee.name || ""}
              onChange={handleChange}
              disabled={!isEditable}
            />
          </div>
          <div className="profile-group">
            <label className="profile-label">Email:</label>
            <input
              className="profile-input"
              type="email"
              name="email"
              value={employee.email || ""}
              disabled
            />
          </div>
          <div className="profile-group">
            <label className="profile-label">Date of Birth:</label>
            <input
              className="profile-input"
              type="date"
              name="dob"
              value={employee.dob || ""}
              onChange={handleChange}
              disabled={!isEditable}
            />
          </div>
        </div>

        <div className="profile-row">
          <div className="profile-group">
            <label className="profile-label">Gender:</label>
            <input
              className="profile-input"
              type="text"
              name="gender"
              value={employee.gender || ""}
              onChange={handleChange}
              disabled={!isEditable}
            />
          </div>
          <div className="profile-group">
            <label className="profile-label">Marital Status:</label>
            <input
              className="profile-input"
              type="text"
              name="maritalStatus"
              value={employee.maritalStatus || ""}
              onChange={handleChange}
              disabled={!isEditable}
            />
          </div>
          <div className="profile-group">
            <label className="profile-label">Blood Group:</label>
            <input
              className="profile-input"
              type="text"
              name="bloodGroup"
              value={employee.bloodGroup || ""}
              onChange={handleChange}
              disabled={!isEditable}
            />
          </div>
        </div>

        <h3 className="profile-section-title">Personal Information</h3>
        <div className="profile-row">
          <div className="profile-group">
            <label className="profile-label">Phone:</label>
            <input
              className="profile-input"
              type="text"
              name="personalInfo.phone"
              value={employee.personalInfo?.phone || ""}
              onChange={handleChange}
              disabled={!isEditable}
            />
          </div>
          <div className="profile-group">
            <label className="profile-label">Address:</label>
            <input
              className="profile-input"
              type="text"
              name="personalInfo.address"
              value={employee.personalInfo?.address || ""}
              onChange={handleChange}
              disabled={!isEditable}
            />
          </div>
        </div>

        <div className="profile-row">
          <div className="profile-group">
            <label className="profile-label">City:</label>
            <input
              className="profile-input"
              type="text"
              name="personalInfo.city"
              value={employee.personalInfo?.city || ""}
              onChange={handleChange}
              disabled={!isEditable}
            />
          </div>
          <div className="profile-group">
            <label className="profile-label">State:</label>
            <input
              className="profile-input"
              type="text"
              name="personalInfo.state"
              value={employee.personalInfo?.state || ""}
              onChange={handleChange}
              disabled={!isEditable}
            />
          </div>
          <div className="profile-group">
            <label className="profile-label">Country:</label>
            <input
              className="profile-input"
              type="text"
              name="personalInfo.country"
              value={employee.personalInfo?.country || ""}
              onChange={handleChange}
              disabled={!isEditable}
            />
          </div>
        </div>

        <div className="profile-actions">
         
          {!isEditable ? (
            <button className="edit-btn" type="button" onClick={() => setIsEditable(true)}>
              Edit
            </button>
          ) : (
            <button className="save-btn" type="button" onClick={handleUpdate}>
              Save
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Profile;
