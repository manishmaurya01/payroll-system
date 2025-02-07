import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; import { FaUserCircle } from "react-icons/fa";
import { getAuth, signOut } from "firebase/auth"; // Import Firebase Auth and signOut




function Navbar() {
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
  
// Logout function
const handleLogout = async () => {
    const auth = getAuth(); // Ensure auth is initialized
    try {
      await signOut(auth); // Sign out the user
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div>
          {/* Top Navigation Bar */}
          <nav className="top-nav">
        <h2 className="logo">Admin Dashboard</h2>
        <div className="nav-links">
          <Link to="/admin/dashboard" className="active">Dashboard</Link>
          <Link to="/admin/atandance">Salary Report</Link>
          <Link to="/admin/leave-requests">Leave Requests</Link>
          <Link to="/admin/employee">Manage Employees</Link>
          <div className="profile-menu">
            <FaUserCircle
              size={30}
              className="profile-icon"
              onClick={() => setShowDropdown(!showDropdown)}
            />
            {showDropdown && (
              <div className="dropdown-menu">
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>


    </div>
  )
}

export default Navbar
