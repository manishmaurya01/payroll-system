import React, { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import "../styles/manageEmployee.css";

const ManageEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    password: "",
    actype: "user", // Default value for actype
    bloodGroup: "",
    dob: "",
    education: { degree: "", university: "" },
    gender: "",
    maritalStatus: "",
    nationality: "",
    otherDetails: { notes: "" },
    personalInfo: { address: "", city: "", country: "", phone: "", state: "", photograph: "" },
    salaryInfo: { baseSalary: "", bonus: "" }
  });
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "employee"));
      const employeeList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(employeeList);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const addEmployee = async (e) => {
    e.preventDefault();
    try {
      const { name, email, password, actype, bloodGroup, dob, education, gender, maritalStatus, nationality, otherDetails, personalInfo, salaryInfo } = newEmployee;

      if (name && email && password) {
        const auth = getAuth();
        await createUserWithEmailAndPassword(auth, email, password)
          .then(async (userCredential) => {
            const user = userCredential.user;
            await addDoc(collection(db, "employee"), {
              name,
              email,
              actype,
              uid: user.uid,
              bloodGroup,
              dob,
              education,
              gender,
              maritalStatus,
              nationality,
              otherDetails,
              personalInfo,
              salaryInfo,
            });

            setNewEmployee({
              name: "",
              email: "",
              password: "",
              actype: "user",
              bloodGroup: "",
              dob: "",
              education: { degree: "", university: "" },
              gender: "",
              maritalStatus: "",
              nationality: "",
              otherDetails: { notes: "" },
              personalInfo: { address: "", city: "", country: "", phone: "", state: "", photograph: "" },
              salaryInfo: { baseSalary: "", bonus: "" }
            });
            fetchEmployees();
          })
          .catch((error) => {
            console.error("Error creating user:", error.message);
            alert(error.message);
          });
      } else {
        alert("Please fill in all fields.");
      }
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  };

  const deleteEmployee = async (id, uid) => {
    try {
      setEmployees(prevEmployees => prevEmployees.filter(emp => emp.id !== id));
      await deleteDoc(doc(db, "employee", id));
      const auth = getAuth();
      const user = auth.currentUser;
      if (user && user.uid === uid) {
        await deleteUser(user);
      }
      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Error deleting employee: " + error.message);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="manage-employee">
      <h2>Manage Employees</h2>

      <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
<div className="employees-wrapper">

      <form onSubmit={addEmployee}>
        <div className="form-group fg">
          <label>Name</label>
          <input
            type="text"
            value={newEmployee.name}
            onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
            placeholder="Enter Name"
            required
          />
        </div>
        <div className="form-group fg">
          <label>Email</label>
          <input
            type="email"
            value={newEmployee.email}
            onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
            placeholder="Enter Email"
            required
          />
        </div>
        <div className="form-group fg">
          <label>Password</label>
          <input
            type="password"
            value={newEmployee.password}
            onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
            placeholder="Enter Password"
            required
          />
        </div>
        <div className="form-group fg">
          <label>Actype</label>
          <input
            type="text"
            value={newEmployee.actype}
            onChange={(e) => setNewEmployee({ ...newEmployee, actype: e.target.value })}
            placeholder="Ac user or admin"
            required
          />
        </div>
        <div className="form-group fg">
          <label>Blood Group</label>
          <input
            type="text"
            value={newEmployee.bloodGroup}
            onChange={(e) => setNewEmployee({ ...newEmployee, bloodGroup: e.target.value })}
            placeholder="Enter Blood Group"
          />
        </div>
        <div className="form-group fg">
          <label>Date of Birth</label>
          <input
            type="date"
            value={newEmployee.dob}
            onChange={(e) => setNewEmployee({ ...newEmployee, dob: e.target.value })}
            required
          />
        </div>
        <div className="form-group fg">
          <label>Degree</label>
          <input
            type="text"
            value={newEmployee.education.degree}
            onChange={(e) => setNewEmployee({ ...newEmployee, education: { ...newEmployee.education, degree: e.target.value } })}
            placeholder="Enter Degree"
          />
        </div>
        <div className="form-group fg">
          <label>University</label>
          <input
            type="text"
            value={newEmployee.education.university}
            onChange={(e) => setNewEmployee({ ...newEmployee, education: { ...newEmployee.education, university: e.target.value } })}
            placeholder="Enter University"
          />
        </div>
        <div className="form-group fg">
          <label>Gender</label>
          <input
            type="text"
            value={newEmployee.gender}
            onChange={(e) => setNewEmployee({ ...newEmployee, gender: e.target.value })}
            placeholder="Enter Gender"
            required
          />
        </div>
        <div className="form-group fg">
          <label>Marital Status</label>
          <input
            type="text"
            value={newEmployee.maritalStatus}
            onChange={(e) => setNewEmployee({ ...newEmployee, maritalStatus: e.target.value })}
            placeholder="Enter Marital Status"
          />
        </div>
        <div className="form-group fg">
          <label>Nationality</label>
          <input
            type="text"
            value={newEmployee.nationality}
            onChange={(e) => setNewEmployee({ ...newEmployee, nationality: e.target.value })}
            placeholder="Enter Nationality"
          />
        </div>
        <div className="form-group fg">
          <label>Notes</label>
          <input
            type="text"
            value={newEmployee.otherDetails.notes}
            onChange={(e) => setNewEmployee({ ...newEmployee, otherDetails: { ...newEmployee.otherDetails, notes: e.target.value } })}
            placeholder="Enter Notes"
          />
        </div>
        <div className="form-group fg">
          <label>Address</label>
          <input
            type="text"
            value={newEmployee.personalInfo.address}
            onChange={(e) => setNewEmployee({ ...newEmployee, personalInfo: { ...newEmployee.personalInfo, address: e.target.value } })}
            placeholder="Enter Address"
            required
          />
        </div>
        <div className="form-group fg">
          <label>City</label>
          <input
            type="text"
            value={newEmployee.personalInfo.city}
            onChange={(e) => setNewEmployee({ ...newEmployee, personalInfo: { ...newEmployee.personalInfo, city: e.target.value } })}
            placeholder="Enter City"
          />
        </div>
        <div className="form-group fg">
          <label>Country</label>
          <input
            type="text"
            value={newEmployee.personalInfo.country}
            onChange={(e) => setNewEmployee({ ...newEmployee, personalInfo: { ...newEmployee.personalInfo, country: e.target.value } })}
            placeholder="Enter Country"
          />
        </div>
        <div className="form-group fg">
          <label>Phone</label>
          <input
            type="text"
            value={newEmployee.personalInfo.phone}
            onChange={(e) => setNewEmployee({ ...newEmployee, personalInfo: { ...newEmployee.personalInfo, phone: e.target.value } })}
            placeholder="Enter Phone Number"
          />
        </div>
        <div className="form-group fg">
          <label>State</label>
          <input
            type="text"
            value={newEmployee.personalInfo.state}
            onChange={(e) => setNewEmployee({ ...newEmployee, personalInfo: { ...newEmployee.personalInfo, state: e.target.value } })}
            placeholder="Enter State"
          />
        </div>
        <div className="form-group fg">
          <label>Photograph</label>
          <input
            type="file"
            onChange={(e) => setNewEmployee({ ...newEmployee, personalInfo: { ...newEmployee.personalInfo, photograph: e.target.files[0]?.name } })}
          />
        </div>
        <div className="form-group fg">
          <label>Base Salary</label>
          <input
            type="text"
            value={newEmployee.salaryInfo.baseSalary}
            onChange={(e) => setNewEmployee({ ...newEmployee, salaryInfo: { ...newEmployee.salaryInfo, baseSalary: e.target.value } })}
            placeholder="Enter Base Salary"
          />
        </div>
        <div className="form-group fg">
          <label>Bonus</label>
          <input
            type="text"
            value={newEmployee.salaryInfo.bonus}
            onChange={(e) => setNewEmployee({ ...newEmployee, salaryInfo: { ...newEmployee.salaryInfo, bonus: e.target.value } })}
            placeholder="Enter Bonus"
          />
        </div>

        <button type="submit" className="submit-btn">Add Employee</button>
      </form>
      </div>

      <h3>All Employees</h3>
      <table className="employee-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Actype</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.name}</td>
              <td>{employee.email}</td>
              <td>{employee.actype}</td>
              <td>
                <Link to={`/employee-details/${employee.id}`}>
                  <button className="details-btn">See More Details</button>
                </Link>
                <button
                  onClick={() => deleteEmployee(employee.id, employee.uid)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageEmployee;
