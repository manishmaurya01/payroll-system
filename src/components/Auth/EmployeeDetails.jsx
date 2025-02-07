import React, { useState, useEffect } from "react";
import { db } from "../../utils/firebase"; // Import Firestore
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Firestore functions
import { useParams, useNavigate } from "react-router-dom"; // To get the employee ID from the URL and navigate back
import '../../styles/EmployeeDetails.css';

const EmployeeDetails = () => {
  const { id } = useParams(); // Get employee ID from URL
  const navigate = useNavigate(); // Navigation hook for the back button
  const [employee, setEmployee] = useState(null);
  const [isEditable, setIsEditable] = useState(false);

  // Fetch employee details by ID
  const fetchEmployeeDetails = async () => {
    try {
      const docRef = doc(db, "employee", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEmployee(docSnap.data());
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
    }
  };

  // Update employee details
  const handleUpdate = async () => {
    try {
      const docRef = doc(db, "employee", id);
      await updateDoc(docRef, {
        name: employee.name || "",
        email: employee.email || "",
        actype: employee.actype || "user", // Default to 'user' if not provided
        personalInfo: {
          phone: employee.personalInfo?.phone || "",
          address: employee.personalInfo?.address || "",
          city: employee.personalInfo?.city || "",
          state: employee.personalInfo?.state || "",
          country: employee.personalInfo?.country || "",
        },
        education: {
          degree: employee.education?.degree || "",
          university: employee.education?.university || "",
        },
        salaryInfo: {
          baseSalary: employee.salaryInfo?.baseSalary || "",
          bonus: employee.salaryInfo?.bonus || "",
        },
        otherDetails: {
          notes: employee.otherDetails?.notes || "",
        },
        dob: employee.dob || "",
        gender: employee.gender || "",
        maritalStatus: employee.maritalStatus || "",
        nationality: employee.nationality || "",
        bloodGroup: employee.bloodGroup || "",
        photograph: employee.photograph || "",
      });

      setIsEditable(false); // After saving, make fields non-editable again
    } catch (error) {
      console.error("Error updating employee details:", error);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handling updates for nested fields
    if (name.includes("personalInfo") || name.includes("education") || name.includes("salaryInfo") || name.includes("otherDetails")) {
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
    fetchEmployeeDetails();
  }, [id]);

  return (
    <div className="employee-details">
      {employee ? (
        <>
          <div className="header">
            <button className="back-btn" onClick={() => navigate(-1)}>
              Back
            </button>
            <h2>Employee Details</h2>
          </div>
          <form className="employee-details-form">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={employee.name}
                onChange={handleChange}
                disabled={!isEditable}
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={employee.email}
                onChange={handleChange}
                disabled={!isEditable}
              />
            </div>
            <div className="form-group">
              <label>Actype:</label>
              <input
                type="text"
                name="actype"
                value={employee.actype}
                onChange={handleChange}
                disabled={!isEditable}
              />
            </div>

            {/* Personal Information */}
            <h3>Personal Information</h3>
            <div className="form-group">
              <label>Phone Number:</label>
              <input
                type="text"
                name="personalInfo.phone"
                value={employee.personalInfo?.phone || ""}
                onChange={handleChange}
                disabled={!isEditable}
              />
            </div>
            <div className="form-group">
              <label>Address:</label>
              <input
                type="text"
                name="personalInfo.address"
                value={employee.personalInfo?.address || ""}
                onChange={handleChange}
                disabled={!isEditable}
              />
            </div>
            <div className="form-group">
              <label>City:</label>
              <input
                type="text"
                name="personalInfo.city"
                value={employee.personalInfo?.city || ""}
                onChange={handleChange}
                disabled={!isEditable}
              />
            </div>
            <div className="form-group">
              <label>State:</label>
              <input
                type="text"
                name="personalInfo.state"
                value={employee.personalInfo?.state || ""}
                onChange={handleChange}
                disabled={!isEditable}
              />
            </div>
            <div className="form-group">
              <label>Country:</label>
              <input
                type="text"
                name="personalInfo.country"
                value={employee.personalInfo?.country || ""}
                onChange={handleChange}
                disabled={!isEditable}
              />
            </div>

            {/* Additional Personal Details */}
            <div className="form-group">
              <label>Date of Birth:</label>
              <input
                type="date"
                name="dob"
                value={employee.dob || ""}
                onChange={handleChange}
                disabled={!isEditable}
              />
            </div>
            <div className="form-group">
              <label>Gender:</label>
              <input
                type="text"
                name="gender"
                value={employee.gender || ""}
                onChange={handleChange}
                disabled={!isEditable}
              />
            </div>
            <div className="form-group">
              <label>Marital Status:</label>
              <input
                type="text"
                name="maritalStatus"
                value={employee.maritalStatus || ""}
                onChange={handleChange}
                disabled={!isEditable}
              />
            </div>
            <div className="form-group">
              <label>Nationality:</label>
              <input
                type="text"
                name="nationality"
                value={employee.nationality || ""}
                onChange={handleChange}
                disabled={!isEditable}
              />
            </div>
            <div className="form-group">
              <label>Blood Group:</label>
              <input
                type="text"
                name="bloodGroup"
                value={employee.bloodGroup || ""}
                onChange={handleChange}
                disabled={!isEditable}
              />
            </div>
            <div className="form-group">
              <label>Photograph:</label>
              <input
                type="file"
                name="photograph"
                onChange={handleChange}
                disabled={!isEditable}
              />
            </div>

            {/* Education */}
            <h3>Education</h3>
            <div className="form-group">
              <label>Degree:</label>
              <input
                type="text"
                name="education.degree"
                value={employee.education?.degree || ""}
                onChange={handleChange}
                disabled={!isEditable}
              />
            </div>
            <div className="form-group">
              <label>University:</label>
              <input
                type="text"
                name="education.university"
                value={employee.education?.university || ""}
                onChange={handleChange}
                disabled={!isEditable}
              />
            </div>

            {/* Salary Information */}
            <h3>Salary Information</h3>
            <div className="form-group">
              <label>Base Salary:</label>
              <input
                type="text"
                name="salaryInfo.baseSalary"
                value={employee.salaryInfo?.baseSalary || ""}
                onChange={handleChange}
                disabled={!isEditable}
              />
            </div>
            <div className="form-group">
              <label>Bonus:</label>
              <input
                type="text"
                name="salaryInfo.bonus"
                value={employee.salaryInfo?.bonus || ""}
                onChange={handleChange}
                disabled={!isEditable}
              />
            </div>

            {/* Other Details */}
            <h3>Other Details</h3>
            <div className="form-group">
              <label>Notes:</label>
              <textarea
                name="otherDetails.notes"
                value={employee.otherDetails?.notes || ""}
                onChange={handleChange}
                disabled={!isEditable}
              />
            </div>

            {/* Edit button and Save button */}
            <div className="form-actions">
              {!isEditable ? (
                <button
                  type="button"
                  className="edit-btn"
                  onClick={() => setIsEditable(true)}
                >
                  Edit
                </button>
              ) : (
                <button
                  type="button"
                  className="save-btn"
                  onClick={handleUpdate}
                >
                  Save Changes
                </button>
              )}
            </div>
          </form>
        </>
      ) : (
        <p>Loading employee details...</p>
      )}
    </div>
  );
};

export default EmployeeDetails;
