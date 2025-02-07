import React, { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore"; // For reading and updating Firestore data
import { useNavigate } from "react-router-dom"; // Importing useNavigate from react-router-dom
import '../styles/AdminLeaveRequests.css';

const AdminLeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const navigate = useNavigate(); // Hook for navigation

  // Fetch leave requests from Firestore
  const fetchLeaveRequests = async () => {
    const querySnapshot = await getDocs(collection(db, "leaveRequests"));
    const requests = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setLeaveRequests(requests);
  };

  // Update leave request status (approve or reject)
  const updateLeaveStatus = async (id, status) => {
    const leaveRef = doc(db, "leaveRequests", id);
    await updateDoc(leaveRef, { status });
    fetchLeaveRequests(); // Refresh the list after updating
  };

  // Handle the back button functionality
  const handleBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  return (
    <div className="admin-leave-requests">
      <button className="admin-leave-requests__back-btn" onClick={handleBack}>Back</button>
      <h2 className="admin-leave-requests__title">Leave Requests</h2>
      <table className="admin-leave-requests__table">
        <thead className="admin-leave-requests__thead">
          <tr className="admin-leave-requests__tr">
            <th className="admin-leave-requests__th">Leave Reason</th>
            <th className="admin-leave-requests__th">Start Date</th>
            <th className="admin-leave-requests__th">End Date</th>
            <th className="admin-leave-requests__th">Status</th>
            <th className="admin-leave-requests__th">Action</th>
          </tr>
        </thead>
        <tbody className="admin-leave-requests__tbody">
          {leaveRequests.map((request) => (
            <tr className="admin-leave-requests__row" key={request.id}>
              <td className="admin-leave-requests__td">{request.leaveType}</td>
              <td className="admin-leave-requests__td">{request.startDate}</td>
              <td className="admin-leave-requests__td">{request.endDate}</td>
              <td className="admin-leave-requests__td">{request.status}</td>
              <td className="admin-leave-requests__td">
                {request.status === "pending" && (
                  <>
                    <button
                      className="admin-leave-requests__btn admin-leave-requests__btn--accept"
                      onClick={() => updateLeaveStatus(request.id, "approved")}
                    >
                      approve
                    </button>
                    <button
                      className="admin-leave-requests__btn admin-leave-requests__btn--reject"
                      onClick={() => updateLeaveStatus(request.id, "rejected")}
                    >
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminLeaveRequests;
