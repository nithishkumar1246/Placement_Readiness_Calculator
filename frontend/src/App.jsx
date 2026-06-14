import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CompanyChecker from './pages/CompanyChecker';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import InterviewPrep from './pages/InterviewPrep';
import StudyPlanner from './pages/StudyPlanner';
import PlacementTracker from './pages/PlacementTracker';
import AdminDashboard from './pages/AdminDashboard';

const AuthRedirect = ({ type }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) {
    return type === 'login' ? <Login /> : <Register />;
  }
  return isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Conditionally show sidebar if user logged in */}
      {isAuthenticated && <Sidebar />}

      {/* Main layout container with sidebar offset */}
      <main className={isAuthenticated ? 'md:ml-64 p-6 min-h-screen pt-24 md:pt-6 transition-all duration-300 bg-gradient-mesh' : 'min-h-screen'}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<AuthRedirect type="login" />} />
          <Route path="/register" element={<AuthRedirect type="register" />} />

          {/* Secure Student Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />

          <Route path="/companies" element={
            <PrivateRoute>
              <CompanyChecker />
            </PrivateRoute>
          } />

          <Route path="/resume" element={
            <PrivateRoute>
              <ResumeAnalyzer />
            </PrivateRoute>
          } />

          <Route path="/interview" element={
            <PrivateRoute>
              <InterviewPrep />
            </PrivateRoute>
          } />

          <Route path="/planner" element={
            <PrivateRoute>
              <StudyPlanner />
            </PrivateRoute>
          } />

          <Route path="/tracker" element={
            <PrivateRoute>
              <PlacementTracker />
            </PrivateRoute>
          } />

          {/* Secure Admin Route */}
          <Route path="/admin" element={
            <PrivateRoute adminOnly>
              <AdminDashboard />
            </PrivateRoute>
          } />

          {/* Catch-all redirects */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
