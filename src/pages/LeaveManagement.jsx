import React, { useState, useEffect } from "react";
import { db, auth } from "../utils/firebase"; // Import auth
import { collection, addDoc, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth"; // Import authentication
import { useNavigate } from "react-router-dom";
import "../styles/leaveManagement.css";

const LeaveManagement = () => {
  const [email, setEmail] = useState(""); // Email is auto-filled
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [leaveRequests, setLeaveRequests] = useState([]);
  const navigate = useNavigate();

  // Fetch logged-in user's email
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email); // Set email from logged-in user
      } else {
        setEmail(""); // If not logged in, clear email
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  // Fetch Leave Requests
  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "leaveRequests"));
      const requests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLeaveRequests(requests);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    }
  };

  const submitLeaveRequest = async (e) => {
    e.preventDefault();

    if (!leaveType || !startDate || !endDate) {
      setMessage("Please fill out all fields.");
      return;
    }

    try {
      await addDoc(collection(db, "leaveRequests"), {
        email, // Email is auto-filled from authentication
        leaveType,
        startDate,
        endDate,
        status: "pending",
        timestamp: new Date(),
      });

      setMessage("Leave request submitted successfully.");
      setStatus("pending");
      setLeaveType("");
      setStartDate("");
      setEndDate("");
      fetchLeaveRequests();
    } catch (error) {
      setMessage("Error submitting leave request: " + error.message);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    return !isNaN(date.getTime()) ? date.toISOString().split("T")[0] : "-";
  };

  const calculateLeaveDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate - startDate) / (1000 * 3600 * 24)) + 1;
  };

  return (
    <div className="leave-management-container">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate(-1)}>← Back</button>

      <h2 className="leave-management-title">Leave Management</h2>
      
      <form onSubmit={submitLeaveRequest} className="leave-request-form">
        <div className="form-group email-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            value={email}
            disabled // Prevent manual editing
            readOnly // Extra protection
            className="input-field email-input"
          />
        </div>

        <div className="form-group leave-type-group">
          <label className="form-label">Leave Message</label>
          <input
            type="text"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            placeholder="Enter Your Reason For Leave"
            required
            className="input-field leave-type-input"
          />
        </div>

        <div className="form-group date-group">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="input-field date-input"
          />
        </div>

        <div className="form-group date-group">
          <label className="form-label">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="input-field date-input"
          />
        </div>

        <button type="submit" className="submit-button">Submit Leave Request</button>
      </form>

      {message && <div className={`message-box ${status}`}>{message}</div>}

      <h3 className="leave-requests-title">Leave Requests</h3>
      <table className="leave-requests-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Leave Message</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Leave Days</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {leaveRequests.length > 0 ? (
            leaveRequests.map((request) => (
              <tr key={request.id}>
                <td>{request.email}</td>
                <td>{request.leaveType}</td>
                <td>{formatDate(request.startDate)}</td>
                <td>{formatDate(request.endDate)}</td>
                <td>{calculateLeaveDays(request.startDate, request.endDate)}</td>
                <td>{request.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-data-cell">No leave requests available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveManagement;
