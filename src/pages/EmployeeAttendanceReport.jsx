import React, { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import "../styles/EmployeeAttendanceReport.css"
const EmployeeAttendanceReport = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [reportData, setReportData] = useState({});

  useEffect(() => {
    fetchEmployeeData();
    fetchAttendanceData();
    fetchLeaveData();
  }, []);

  useEffect(() => {
    setReportData(generateReport());
  }, [selectedYear, selectedMonth, attendanceData, employeeData, leaveData]);

  // Fetch Employee Data
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

  // Fetch Attendance Data
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

  // Fetch Leave Data
  const fetchLeaveData = async () => {
    try {
      const leaveRef = collection(db, "leaveRequests");
      const querySnapshot = await getDocs(leaveRef);
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLeaveData(data);
    } catch (error) {
      console.error("Error fetching leave data:", error);
    }
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const generateReport = () => {
    const report = {};
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
    const totalDays = getDaysInMonth(year, month);

    employeeData.forEach((employee) => {
      const empId = employee.id;
      const empName = employee.name;
      const empEmail = employee.email;
      const baseSalary = employee.salaryInfo ? Number(employee.salaryInfo.baseSalary) || 0 : 0; // Ensure salary is a number

      // Per day salary calculation
      const perDaySalary = baseSalary / totalDays;

      const empAttendance = attendanceData.filter((entry) => {
        if (!entry.inTime) return false;
        const entryDate = new Date(entry.inTime.seconds * 1000);
        return (
          entryDate.getFullYear() === year &&
          entryDate.getMonth() + 1 === month &&
          entry.email === empEmail
        );
      });

      const empLeaves = leaveData.filter((leave) => {
        if (leave.status !== "approved") return false;
        return (
          new Date(leave.startDate).getFullYear() === year &&
          new Date(leave.startDate).getMonth() + 1 === month &&
          leave.email === empEmail
        );
      });

      // Store leave days in a set
      const leaveDaysSet = new Set();
      empLeaves.forEach((leave) => {
        let start = new Date(leave.startDate);
        let end = new Date(leave.endDate);
        while (start <= end) {
          leaveDaysSet.add(start.toISOString().split("T")[0]);
          start.setDate(start.getDate() + 1);
        }
      });

      let presentDays = 0;
      let leaveDays = leaveDaysSet.size;
      let absentDays = 0;
      let sundays = 0;

      for (let day = 1; day <= totalDays; day++) {
        const currentDate = new Date(year, month - 1, day);
        const dateStr = currentDate.toISOString().split("T")[0];
        const isSunday = currentDate.getDay() === 0;
        const isPresent = empAttendance.some((entry) => {
          const entryDate = new Date(entry.inTime.seconds * 1000).toISOString().split("T")[0];
          return entryDate === dateStr;
        });

        if (isSunday) {
          sundays++;
        } else {
          if (isPresent) {
            presentDays++;
          } else if (!leaveDaysSet.has(dateStr)) {
            absentDays++;
          }
        }
      }

      const workingDays = totalDays - absentDays; // Adjusted logic to calculate working days
      const netSalary = perDaySalary * workingDays; // Calculate Net Salary

      report[empId] = {
        name: empName,
        email: empEmail,
        presentDays,
        absentDays,
        leaveDays,
        workingDays,
        totalDays,
        totalSalary: baseSalary, // Employee's fixed salary
        netSalary, // Salary after considering attendance
      };
    });

    return report;
  };

  return (
    <div className="attendance-report-container">
      <h3 className="attendance-report-title">Employee Attendance Report</h3>

      <button onClick={() => window.history.back()} className="attendance-report-back-btn">
        ← Back
      </button>

      <div className="attendance-report-filters">
        <label className="attendance-report-filter-label">Year:</label>
        <select onChange={(e) => setSelectedYear(e.target.value)} value={selectedYear} className="attendance-report-filter-select">
          {[2024, 2025, 2026].map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <label className="attendance-report-filter-label">Month:</label>
        <select onChange={(e) => setSelectedMonth(e.target.value)} value={selectedMonth} className="attendance-report-filter-select">
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
      </div>
      <div class="attendance-report-table-wrapper">
      <table className="attendance-report-table">
        <thead>
          <tr className="attendance-report-table-header">
            <th>Name</th>
            <th>Email</th>
            <th>Present Days</th>
            <th>Absent Days</th>
            <th>Leave Days</th>
            <th>Working Days</th>
            <th>Total Days</th>
            <th>Total Salary</th>
            <th>Net Salary</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(reportData).map((data, index) => (
            <tr key={index} className="attendance-report-table-row">
              <td>{data.name}</td>
              <td>{data.email}</td>
              <td>{data.presentDays}</td>
              <td>{data.absentDays}</td>
              <td>{data.leaveDays}</td>
              <td>{data.workingDays}</td>
              <td>{data.totalDays}</td>
              <td>{Number(data.totalSalary).toFixed(2)}</td>
              <td>{Number(data.netSalary).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
    </div>
  );
};

export default EmployeeAttendanceReport;
