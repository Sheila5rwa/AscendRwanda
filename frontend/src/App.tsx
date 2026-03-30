import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar, { UserRole } from './components/Sidebar';
import TopBar from './components/TopBar';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/Students';
import AdminModules from './pages/admin/AdminModules';
import AdminEmployers from './pages/admin/AdminEmployers';
import AdminCertification from './pages/admin/Certification';
import AdminMessages from './pages/admin/AdminMessages';
import Administration from './pages/admin/Administration';

// Mentor Pages
import MentorDashboard from './pages/mentor/Dashboard';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';

// Employer Pages
import EmployerDashboard from './pages/employer/Dashboard';

// Shared/Common
import Messages from './pages/Messages';
import Meetings from './pages/Meetings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Enrollment from './pages/Enrollment';
import Profile from './pages/shared/Profile';
import VerifyCertificate from './pages/public/VerifyCertificate';

// ─── Auth Guard ──────────────────────────────────────────────────────────────
const ProtectedRoute: React.FC<{ isAuthenticated: boolean; children: React.ReactNode }> = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ─── Shell Layout (sidebar + topbar) ─────────────────────────────────────────
const pageTitles: Record<string, string> = {
  '/admin/dashboard':      'Dashboard',
  '/admin/students':       'Students',
  '/admin/modules':        'Learning Modules',
  '/admin/employers':      'Employer Management',
  '/admin/certification':  'Certification',
  '/admin/messages':       'Messages',
  '/admin/administration': 'Administration',
  '/mentor/dashboard':     'Mentor Dashboard',
  '/student/dashboard':    'My Learning Portal',
  '/employer/dashboard':   'Employer Portal',
  '/messages':             'Messages',
  '/meetings':             'Meetings',
  '/profile':              'My Profile',
};

const Shell: React.FC<{
  role: UserRole;
  onLogout: () => void;
  children: React.ReactNode;
}> = ({ role, onLogout, children }) => {
  const location = useLocation();
  const subtitle = pageTitles[location.pathname] ?? 'Ascend Rwanda';

  return (
    <div className="min-h-screen bg-[#eef0f8] flex items-center justify-center p-4">
      <div className="w-full max-w-[1350px] h-[820px] bg-white rounded-3xl shadow-2xl flex overflow-hidden">
        <Sidebar role={role} onLogout={onLogout} />
        <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f7fb]">
          <TopBar subtitle={subtitle} role={role} onLogout={onLogout} />
          <div className="flex-1 px-6 pt-3 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole>('student');
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setRole(parsedUser.role);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleLogin = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setIsAuthenticated(true);
    navigate(`/${selectedRole}/dashboard`, { replace: true });
  };

  const handleSignup = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setIsAuthenticated(true);
    navigate(`/${selectedRole}/dashboard`, { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/', { replace: true });
  };

  const dashboardRoute = `/${role}/dashboard`;

  return (
    <Routes>
      {/* ── Public routes ─────────────────────────────────────────────── */}
      <Route path="/" element={
        isAuthenticated ? <Navigate to={dashboardRoute} replace /> : <Enrollment onGetStarted={() => navigate('/login')} />
      } />
      <Route path="/login" element={
        isAuthenticated ? <Navigate to={dashboardRoute} replace /> : <Login onLogin={handleLogin} onNavigateToSignup={() => navigate('/signup')} onBackToLanding={() => navigate('/')} />
      } />
      <Route path="/signup" element={
        isAuthenticated ? <Navigate to={dashboardRoute} replace /> : <Signup onSignup={handleSignup} onNavigateToLogin={() => navigate('/login')} onBackToLanding={() => navigate('/')} />
      } />
      <Route path="/api/verify/:token" element={<VerifyCertificate />} />
      <Route path="/verify/:token" element={<VerifyCertificate />} />

      {/* ── Admin routes ──────────────────────────────────────────────── */}
      <Route path="/admin/*" element={
        <ProtectedRoute isAuthenticated={isAuthenticated && role === 'admin'}>
          <Shell role={role} onLogout={handleLogout}>
            <Routes>
              <Route path="dashboard"      element={<AdminDashboard />} />
              <Route path="students"       element={<AdminStudents />} />
              <Route path="modules"        element={<AdminModules />} />
              <Route path="employers"      element={<AdminEmployers />} />
              <Route path="certification"  element={<AdminCertification />} />
              <Route path="messages"       element={<AdminMessages />} />
              <Route path="administration" element={<Administration />} />
              <Route path="profile"        element={<Profile role={role} />} />
              <Route index                 element={<Navigate to="dashboard" replace />} />
            </Routes>
          </Shell>
        </ProtectedRoute>
      } />

      {/* ── Mentor routes ─────────────────────────────────────────────── */}
      <Route path="/mentor/*" element={
        <ProtectedRoute isAuthenticated={isAuthenticated && role === 'mentor'}>
          <Shell role={role} onLogout={handleLogout}>
            <Routes>
              <Route path="dashboard" element={<MentorDashboard />} />
              <Route path="messages"  element={<Messages />} />
              <Route path="meetings"  element={<Meetings />} />
              <Route path="profile"   element={<Profile role={role} />} />
              <Route index            element={<Navigate to="dashboard" replace />} />
            </Routes>
          </Shell>
        </ProtectedRoute>
      } />

      {/* ── Student routes ────────────────────────────────────────────── */}
      <Route path="/student/*" element={
        <ProtectedRoute isAuthenticated={isAuthenticated && role === 'student'}>
          <Shell role={role} onLogout={handleLogout}>
            <Routes>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="messages"  element={<Messages />} />
              <Route path="profile"   element={<Profile role={role} />} />
              <Route index            element={<Navigate to="dashboard" replace />} />
            </Routes>
          </Shell>
        </ProtectedRoute>
      } />

      {/* ── Employer routes ───────────────────────────────────────────── */}
      <Route path="/employer/*" element={
        <ProtectedRoute isAuthenticated={isAuthenticated && role === 'employer'}>
          <Shell role={role} onLogout={handleLogout}>
            <Routes>
              <Route path="dashboard" element={<EmployerDashboard />} />
              <Route path="messages"  element={<Messages />} />
              <Route path="profile"   element={<Profile role={role} />} />
              <Route index            element={<Navigate to="dashboard" replace />} />
            </Routes>
          </Shell>
        </ProtectedRoute>
      } />

      {/* ── Catch-all ─────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
