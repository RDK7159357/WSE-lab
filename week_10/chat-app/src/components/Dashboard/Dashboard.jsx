import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatRoomForm from './ChatRoomForm';
import Logout from '../Auth/Logout';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleSelectRoom = (roomId) => {
    navigate(`/chat/${roomId}`);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome to the Dashboard</h2>
        <Logout />
      </div>
      <div className="dashboard-main">
        <Sidebar onSelectRoom={handleSelectRoom} />
        <div className="dashboard-content">
          <ChatRoomForm />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;