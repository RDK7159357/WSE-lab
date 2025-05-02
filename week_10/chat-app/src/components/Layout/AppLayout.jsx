import React from 'react';
import Sidebar from '../Dashboard/Sidebar';
import Logout from '../Auth/Logout';

const AppLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header>
          <Logout />
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;