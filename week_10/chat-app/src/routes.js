import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Login from '../components/Auth/Login';
import Dashboard from '../components/Dashboard/Dashboard';
import Chat from '../components/Dashboard/Chat';
import ProtectedRoute from '../components/Auth/ProtectedRoute';

const AppRoutes = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:roomId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  </AuthProvider>
);

export default AppRoutes;