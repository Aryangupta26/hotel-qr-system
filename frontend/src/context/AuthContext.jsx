import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('hotelqr_admin_token') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Autodiscover API URL for local debug
  const API_BASE_URL = import.meta.env.VITE_API_URL || 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:5005' 
      : `${window.location.protocol}//${window.location.hostname}:5005`);

  // Validate token on load
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        
        if (data.success) {
          setUser(data.user);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('[Auth Context] Token validation failed:', err.message);
        // Do not log out immediately on network failure, just clear loading
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  // Admin login helper
  const login = async (username, password) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('hotelqr_admin_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return true;
      } else {
        setError(data.message || 'Invalid credentials');
        return false;
      }
    } catch (err) {
      setError('Connection to backend failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Admin logout helper
  const logout = () => {
    localStorage.removeItem('hotelqr_admin_token');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        logout,
        API_BASE_URL
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
