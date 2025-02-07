import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../utils/firebase";
import { Link, useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, addDoc, updateDoc, serverTimestamp, doc, getDocs } from "firebase/firestore";
import { FaUserCircle } from "react-icons/fa"; // Profile icon
import "../styles/userDashboard.css";

const UserDashboard = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState(null);
  const [employeeDocId, setEmployeeDocId] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [lastAction, setLastAction] = useState("Punch In");
  const [isPunchAllowed, setIsPunchAllowed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false); // Dropdown for profile menu
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);
        await fetchEmployeeDetails(user.email);
      } else {
        resetState();
        alert('Please Login To Acsess This Page');
        navigate("/"); // Redirect to login if not logged in
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const resetState = () => {
    setUserEmail(null);
    setUserName(null);
    setEmployeeDocId(null);
    setTodayAttendance([]);
    setAttendanceHistory([]);
    setFilteredHistory([]);
    setLastAction("Punch In");
    setIsPunchAllowed(false);
    setIsLoading(false);
  };

  const fetchEmployeeDetails = async (email) => {
    try {
      const employeeRef = collection(db, "employee");
      const q = query(employeeRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const employeeDoc = querySnapshot.docs[0];
        setEmployeeDocId(employeeDoc.id);
        setUserName(employeeDoc.data().name);
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
    }
  };

  const getUniqueYears = () => {
    const years = attendanceHistory.map(entry =>
      new Date(entry.inTime?.seconds * 1000).getFullYear()
    );
    return [...new Set(years)]; // Remove duplicates
  };

  const getUniqueMonths = () => {
    const months = attendanceHistory.map(entry =>
      new Date(entry.inTime?.seconds * 1000).getMonth() + 1
    );
    return [...new Set(months)];
  };

  const filteredAttendance = attendanceHistory.filter(entry => {
    const entryDate = new Date(entry.inTime?.seconds * 1000);
    const entryYear = entryDate.getFullYear();
    const entryMonth = entryDate.getMonth() + 1;
    const entryDay = entryDate.getDate();

    return (
      (selectedYear ? entryYear === parseInt(selectedYear) : true) &&
      (selectedMonth ? entryMonth === parseInt(selectedMonth) : true) &&
      (selectedDay ? entryDay === parseInt(selectedDay) : true)
    );
  });

  useEffect(() => {
    if (userEmail) {
      const attendanceRef = collection(db, "attendance");
      const q = query(attendanceRef, where("email", "==", userEmail));

      const unsubscribeAttendance = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const today = new Date().toISOString().split("T")[0];

        const todayData = data.filter((entry) => {
          const entryDate = new Date(entry.inTime?.seconds * 1000).toISOString().split("T")[0];
          return entryDate === today;
        });

        const historyData = data.filter((entry) => {
          const entryDate = new Date(entry.inTime?.seconds * 1000).toISOString().split("T")[0];
          return entryDate !== today;
        });

        setTodayAttendance(todayData);
        setAttendanceHistory(historyData);
        setFilteredHistory(historyData);

        if (todayData.length > 0) {
          const lastEntry = todayData[todayData.length - 1];
          if (!lastEntry.outTime) {
            setLastAction("Punch Out");
            setIsPunchAllowed(true);
          } else {
            setLastAction("Punch In");
            setIsPunchAllowed(false);
          }
        } else {
          setLastAction("Punch In");
          setIsPunchAllowed(true);
        }

        setIsLoading(false);
      });

      return () => unsubscribeAttendance();
    }
  }, [userEmail]);

  const handlePunch = async () => {
    try {
      if (!isPunchAllowed) return;

      if (lastAction === "Punch In") {
        await addDoc(collection(db, "attendance"), {
          email: userEmail,
          name: userName,
          inTime: serverTimestamp(),
          outTime: null,
          employeeDocId: employeeDocId,
        });
      } else if (lastAction === "Punch Out") {
        const lastEntry = todayAttendance[todayAttendance.length - 1];
        const docRef = doc(db, "attendance", lastEntry.id);
        await updateDoc(docRef, {
          outTime: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error handling punch:", error);
    }
  };

  const handleProfileClick = () => {
    setShowDropdown(prevState => !prevState);
  };

  const handleClickOutside = (e) => {
    const dropdown = document.querySelector(".dropdown-menu");
    if (dropdown && !dropdown.contains(e.target) && !e.target.closest(".profile-icon")) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="user-dashboard">
      {/* 🔵 Top Navigation Bar */}
      <nav className="top-nav">
        <h2 className="logo"><p>{userEmail || "Guest"}</p></h2>
        <div className="nav-links">
          <Link to="/employee/dashboard" className="active">Dashboard</Link>
          <Link to="/leave-management" className="link">Leave Management</Link>
          <Link to="/profile" className="link">Profile</Link>
          <div className="profile-menu">
            <FaUserCircle
              size={30}
              className="profile-icon"
              onClick={handleProfileClick} // Toggle dropdown
            />
            {showDropdown && (
              <div className="dropdown-menu">
                <button onClick={() => {
                  navigate("/");
                  auth.signOut();
                }}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <br /><br /> <br />

      <div className="content">
        {/* 🔵 Today's Attendance */}
        <div className="attendance-section">
          <div className="attendance-header">
            <h2>Today's Attendance</h2>
            {!isLoading && isPunchAllowed && (
              <button onClick={handlePunch} className="punch-button">
                {lastAction}
              </button>
            )}
          </div>

          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>In Time</th>
                <th>Out Time</th>
              </tr>
            </thead>
            <tbody>
              {todayAttendance.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.inTime?.seconds * 1000).toLocaleDateString()}</td>
                  <td>{new Date(entry.inTime?.seconds * 1000).toLocaleTimeString()}</td>
                  <td>{entry.outTime ? new Date(entry.outTime?.seconds * 1000).toLocaleTimeString() : "Not Punched Out"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🔵 Filter Attendance */}
        <div className="filter-con">
          <div className="filters">
            <select onChange={(e) => setSelectedYear(e.target.value)} value={selectedYear}>
              <option value="">Select Year</option>
              {getUniqueYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select onChange={(e) => setSelectedMonth(e.target.value)} value={selectedMonth}>
              <option value="">Select Month</option>
              {getUniqueMonths().map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Day"
              min="1"
              max="31"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            />
          </div>
        </div>

        {/* 🔵 Attendance History */}
        <div className="attendance-history">
          <h2>Attendance History</h2>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>In Time</th>
                <th>Out Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.inTime?.seconds * 1000).toLocaleDateString()}</td>
                  <td>{new Date(entry.inTime?.seconds * 1000).toLocaleTimeString()}</td>
                  <td>{entry.outTime ? new Date(entry.outTime?.seconds * 1000).toLocaleTimeString() : "Not Punched Out"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
