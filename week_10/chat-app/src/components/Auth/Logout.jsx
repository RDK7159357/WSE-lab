import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out', err);
    }
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
};

export default Logout;