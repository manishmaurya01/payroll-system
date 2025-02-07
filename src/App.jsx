import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import LeaveManagement from './pages/LeaveManagement';
import AdminLeaveRequests from './pages/AdminLeaveRequests';
import ManageEmployee from './pages/ManageEmployee';
import EmployeeDetails from './components/Auth/EmployeeDetails';
import SalaryCounter from './pages/SalaryCounter';
import Profile from './pages/Profile';
import EmployeeAttendanceReport from './pages/EmployeeAttendanceReport';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/dashboard" element={<AdminDashboard/>} />
        <Route path="/employee/dashboard" element={<UserDashboard/>}/>
        <Route path="/leave-management" element={<LeaveManagement />} />
        <Route path="/admin/leave-requests" element={<AdminLeaveRequests />} />
        <Route path="/admin/employee" element={<ManageEmployee />} />
        <Route path="/admin/salarycounter" element={<SalaryCounter />} />
        <Route path="/employee-details/:id" element={<EmployeeDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/atandance" element={<EmployeeAttendanceReport />} />
      </Routes>
    </Router>
  );
};

export default App;
