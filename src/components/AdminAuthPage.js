import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminAuthPage.css';

const AdminAuthPage = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = isLogin ? 'Admin Login | Job Portal' : 'Admin Signup | Job Portal';
  }, [isLogin]);

  const handleAdminSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const axios = (await import('axios')).default;

    const endpoint = isLogin
      ? 'https://backend-edwk.onrender.com/api/auth/login'
      : 'https://backend-edwk.onrender.com/api/auth/register';

    const payload = isLogin
      ? { email, password }
      : { name, email, password, role: 'ADMIN' };

    try {
      const response = await axios.post(endpoint, payload);
      const token = response.headers.authorization?.split(' ')[1] || response.data.token;

      if (isLogin) {
        if (!token) {
          setMessage('❌ No token received.');
          return;
        }

        const decodedPayload = JSON.parse(atob(token.split('.')[1]));
        const role = decodedPayload.role;

        if (role !== 'ADMIN') {
          setMessage('❌ Access Denied. Not an Admin.');
          return;
        }

        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        if (onLoginSuccess) onLoginSuccess(role);
        navigate('/admin-dashboard');
      } else {
        setMessage('✅ Admin registered successfully!');
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Error during authentication.');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, name, isLogin, navigate, onLoginSuccess]);

  return (
    <div className="admin-auth-container">
      <div className="admin-auth-card">
        <div className="admin-auth-left">
          <h2>Admin Portal</h2>
          <p>Manage the platform by logging into your admin account</p>
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Create Admin Account' : 'Already Admin? Login'}
          </button>
        </div>
        <div className="admin-auth-right">
          <h2>{isLogin ? 'Admin Login' : 'Admin Signup'}</h2>
          <form onSubmit={handleAdminSubmit}>
            {!isLogin && (
              <input
                type="text"
                placeholder="Admin Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
            </button>
          </form>
          {message && <p className="admin-auth-message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminAuthPage;