import React, { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import "../styles/SalaryCounter.css";

const ManualSalaryCounter = () => {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");

  // Fetch employees from Firestore
  const fetchEmployees = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "employee"));
      const employeeData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(employeeData);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // Fetch employee data when the component mounts
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Calculate salary for each employee
  const calculateSalary = (index) => {
    const updatedEmployees = [...employees];
    const employee = updatedEmployees[index];

    setError(""); // Reset error

    // Check if salaryInfo is defined and has baseSalary and bonus
    const salaryInfo = employee.salaryInfo || {};
    const baseSalary = salaryInfo.baseSalary;
    const bonus = salaryInfo.bonus;
    const daysPresent = employee.daysPresent;
    const totalDays = employee.totalDays;

    // Validate input values
    if (!baseSalary || !bonus || !daysPresent || !totalDays) {
      setError("Please fill in all fields.");
      return;
    }

    if (isNaN(baseSalary) || isNaN(bonus) || isNaN(daysPresent) || isNaN(totalDays)) {
      setError("Please enter valid numbers.");
      return;
    }

    const dailyRate = parseFloat(baseSalary) / parseFloat(totalDays);
    const totalSalary = dailyRate * parseInt(daysPresent) + parseFloat(bonus);

    updatedEmployees[index].totalSalary = totalSalary.toFixed(2);
    setEmployees(updatedEmployees);
  };

  return (
    <div className="salary-counter">
      <h2 className="salary-counter__title">Manual Salary Calculation for Employees</h2>

      <table className="salary-counter__table">
        <thead>
          <tr className="salary-counter__tr">
            <th className="salary-counter__th">Name</th>
            <th className="salary-counter__th">Email</th>
            <th className="salary-counter__th">Base Salary</th>
            <th className="salary-counter__th">Bonus</th>
            <th className="salary-counter__th">Total Days</th>
            <th className="salary-counter__th">Days Present</th>
            <th className="salary-counter__th">Total Salary</th>
            <th className="salary-counter__th">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee, index) => {
            const salaryInfo = employee.salaryInfo || {}; // Ensure salaryInfo exists
            return (
              <tr key={index}>
                <td className="salary-counter__td">{employee.name}</td>
                <td className="salary-counter__td">{employee.email}</td>
                <td className="salary-counter__td">
                  <input
                    type="number"
                    value={salaryInfo.baseSalary || ""}
                    onChange={(e) => {
                      const updatedEmployees = [...employees];
                      updatedEmployees[index].salaryInfo.baseSalary = e.target.value;
                      setEmployees(updatedEmployees);
                    }}
                    placeholder="Enter base salary"
                  />
                </td>
                <td className="salary-counter__td">
                  <input
                    type="number"
                    value={salaryInfo.bonus || ""}
                    onChange={(e) => {
                      const updatedEmployees = [...employees];
                      updatedEmployees[index].salaryInfo.bonus = e.target.value;
                      setEmployees(updatedEmployees);
                    }}
                    placeholder="Enter bonus"
                  />
                </td>
                <td className="salary-counter__td">
                  <input
                    type="number"
                    value={employee.totalDays || ""}
                    onChange={(e) => {
                      const updatedEmployees = [...employees];
                      updatedEmployees[index].totalDays = e.target.value;
                      setEmployees(updatedEmployees);
                    }}
                    placeholder="Enter total days"
                  />
                </td>
                <td className="salary-counter__td">
                  <input
                    type="number"
                    value={employee.daysPresent || ""}
                    onChange={(e) => {
                      const updatedEmployees = [...employees];
                      updatedEmployees[index].daysPresent = e.target.value;
                      setEmployees(updatedEmployees);
                    }}
                    placeholder="Enter days present"
                  />
                </td>
                <td className="salary-counter__td">
                  {employee.totalSalary ? `${employee.totalSalary}` : "-"}
                </td>
                <td className="salary-counter__td">
                  <button
                    className="salary-counter__calculate-btn"
                    onClick={() => calculateSalary(index)}
                  >
                    Calculate
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {error && <p className="salary-counter__error">{error}</p>}
    </div>
  );
};

export default ManualSalaryCounter;
