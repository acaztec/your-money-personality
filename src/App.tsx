import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Welcome from './pages/Welcome';
import AdvisorWelcome from './pages/AdvisorWelcome';
import AdvisorLogin from './pages/AdvisorLogin';
import AdvisorDashboard from './pages/AdvisorDashboard';
import Assessment from './pages/Assessment';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Public advisor routes */}
          <Route path="/advisor/login" element={<AdvisorLogin />} />
          
          {/* Protected advisor routes */}
          <Route path="/advisor" element={
            <ProtectedRoute>
              <AdvisorWelcome />
            </ProtectedRoute>
          } />
          <Route path="/advisor/share" element={
            <ProtectedRoute>
              <AdvisorWelcome />
            </ProtectedRoute>
          } />
          <Route path="/advisor/dashboard" element={
            <ProtectedRoute>
              <AdvisorDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;