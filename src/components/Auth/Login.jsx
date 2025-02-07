import React, { useState } from 'react';
import { auth, db } from '../../utils/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../../styles/login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);  // Add loading state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Show the loader when login is initiated

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const employeesRef = collection(db, 'employee');
      const q = query(employeesRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        if (userData.actype === 'admin') {
          navigate('/admin/dashboard');
        } else if (userData.actype === 'user') {
          navigate('/employee/dashboard');
        } else {
          setError('Invalid user role.');
        }
      } else {
        setError('User not found in the employees collection.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);  // Hide the loader after the process completes
    }
  };

  return (
    <div className="main-wrapper"> {/* New wrapper for the body-like styling */}
      <div className="login-container">
        <div className="login-box">
          {loading ? (
            <div className="loading-spinner"></div>  // Show the loader while loading
          ) : (
            <form onSubmit={handleLogin}>
              <h2>Login</h2>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="error-message">{error}</p>}
              <button type="submit">Login</button>
            </form>
          )}
          <div className="highlight-text">
            <p>Welcome to the Payroll System! Please login to access your account.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
