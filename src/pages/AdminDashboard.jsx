import React, { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom"; 
import { FaUserCircle } from "react-icons/fa";
import { getAuth, signOut } from "firebase/auth";
import Navbar from "../components/Auth/Navbar";
import "../styles/adminDashboard.css";

const AdminDashboard = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchEmployeeData();
    fetchAttendanceData();
  }, []);

  const navigate = useNavigate();

  const fetchEmployeeData = async () => {
    try {
      const employeeRef = collection(db, "employee");
      const querySnapshot = await getDocs(employeeRef);
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEmployeeData(data);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const attendanceRef = collection(db, "attendance");
      const querySnapshot = await getDocs(attendanceRef);
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAttendanceData(data);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp ? new Date(timestamp.seconds * 1000).toLocaleTimeString() : "-";
  };

  const formatDate = (timestamp) => {
    return timestamp ? new Date(timestamp.seconds * 1000).toLocaleDateString() : "-";
  };

  const calculateDuration = (inTime, outTime) => {
    if (inTime && outTime) {
      const start = new Date(inTime.seconds * 1000);
      const end = new Date(outTime.seconds * 1000);
      const diff = Math.abs(end - start) / (1000 * 60 * 60);
      return `${diff.toFixed(2)} hrs`;
    }
    return "-";
  };

  const calculateLateMinutes = (inTime) => {
    if (inTime) {
      const punchInTime = new Date(inTime.seconds * 1000);
      const officeStartTime = new Date(punchInTime);
      officeStartTime.setHours(8, 30, 0, 0);

      if (punchInTime > officeStartTime) {
        return Math.round((punchInTime - officeStartTime) / (1000 * 60));
      }
    }
    return 0;
  };

  const today = new Date().toLocaleDateString();
  const todaysAttendance = attendanceData.filter(
    (entry) => new Date(entry.inTime.seconds * 1000).toLocaleDateString() === today
  );

  const filterAttendanceHistory = () => {
    return attendanceData.filter((entry) => {
      const entryDate = new Date(entry.inTime.seconds * 1000);
      const entryYear = entryDate.getFullYear().toString();
      const entryMonth = (entryDate.getMonth() + 1).toString();
      const entryDay = entryDate.getDate().toString();

      return (
        (selectedYear ? entryYear === selectedYear : true) &&
        (selectedMonth ? entryMonth === selectedMonth : true) &&
        (selectedDay ? entryDay === selectedDay : true)
      );
    });
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="admin-wrapper">
      <Navbar />

      <div className="main-content">
        <h3 className="attendance-title">Today's Attendance</h3>
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Email</th>
              <th>Punch In</th>
              <th>Punch Out</th>
              <th>Working Hours</th>
              <th>Late Minutes</th>
            </tr>
          </thead>
          <tbody>
            {todaysAttendance.map((entry) => (
              <tr key={entry.id}>
                <td>{formatDate(entry.inTime)}</td>
                <td>{entry.name}</td>
                <td>{entry.email}</td>
                <td>{formatTime(entry.inTime)}</td>
                <td>{formatTime(entry.outTime)}</td>
                <td>{calculateDuration(entry.inTime, entry.outTime)}</td>
                <td>{calculateLateMinutes(entry.inTime)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="attendance-history-title">Attendance History</h3>
        <div className="filters">
          <select
            className="year-dropdown"
            onChange={(e) => setSelectedYear(e.target.value)}
            value={selectedYear}
          >
            <option value="">Select Year</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
          <select
            className="month-dropdown"
            onChange={(e) => setSelectedMonth(e.target.value)}
            value={selectedMonth}
          >
            <option value="">Select Month</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
          <select
            className="day-dropdown"
            onChange={(e) => setSelectedDay(e.target.value)}
            value={selectedDay}
          >
            <option value="">Select Day</option>
            {[...Array(31)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>

        <table className="attendance-history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Email</th>
              <th>Punch In</th>
              <th>Punch Out</th>
              <th>Working Hours</th>
              <th>Late Minutes</th>
            </tr>
          </thead>
          <tbody>
            {filterAttendanceHistory().map((entry) => (
              <tr key={entry.id}>
                <td>{formatDate(entry.inTime)}</td>
                <td>{entry.name}</td>
                <td>{entry.email}</td>
                <td>{formatTime(entry.inTime)}</td>
                <td>{formatTime(entry.outTime)}</td>
                <td>{calculateDuration(entry.inTime, entry.outTime)}</td>
                <td>{calculateLateMinutes(entry.inTime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
