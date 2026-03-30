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

// Mentor Pages
import MentorDashboard from './pages/mentor/Dashboard';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import LearningModules from './pages/student/LearningModules';
import LearningContent from './pages/student/LearningContent';
import CertificateView from './pages/student/CertificateView';

// Employer Pages
import EmployerDashboard from './pages/employer/Dashboard';

// Shared/Common
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
const portalHeaders: Record<string, { title: string; description: string }> = {
  '/admin/dashboard':      { title: 'Admin Console',       description: 'System Overview & KPIs' },
  '/admin/students':       { title: 'User Management',     description: 'Review and support platform users' },
  '/admin/modules':        { title: 'Learning Management', description: 'Curate educational content' },
  '/admin/employers':      { title: 'Partnerships',        description: 'Connect students to industry' },
  '/admin/certification':  { title: 'Certification Hub',   description: 'Manage and issue credentials' },
  '/admin/messages':       { title: 'Support Inbox',       description: 'Platform wide communication' },
  
  '/mentor/dashboard':     { title: 'Mentor Portal',       description: 'Guiding the next generation' },
  '/mentor/students':      { title: 'My Learners',         description: 'Track and support your assigned students' },
  '/mentor/messages':      { title: 'Inquiries',           description: 'Student & Admin messages' },
  '/mentor/modules':       { title: 'Content Preparation', description: 'Review and improve teaching materials' },

  '/student/overview':     { title: 'Student Dashboard',   description: 'Your learning overview' },
  '/student/my-courses':   { title: 'My Training',        description: 'Continue your learning journey' },
  '/student/modules':      { title: 'Explore Catalog',    description: 'Find new training modules' },
  '/student/quizzes':      { title: 'Learning Assessment',description: 'Track your quiz and exam results' },
  '/student/certificates': { title: 'Credentials',        description: 'Your earned certificates' },
  '/student/messages':     { title: 'Communication Hub',   description: 'Employer & Mentor interactions' },
  '/student/learning':     { title: 'Learning Lab',        description: 'Mastering your skills' },
  '/student/certificate':  { title: 'Official Credential', description: 'Your verified achievement' },

  '/employer/dashboard':   { title: 'Employer Portal',     description: 'Connect with certified students' },
  '/employer/students':    { title: 'Candidate Search',    description: 'Find top talent for your needs' },
  '/employer/interactions':{ title: 'Engagement Log',      description: 'Track your hiring journey' },
};

const Shell: React.FC<{
  role: UserRole;
  onLogout: () => void;
  children: React.ReactNode;
}> = ({ role, onLogout, children }) => {
  const location = useLocation();
  const header = portalHeaders[location.pathname] || { title: 'Ascend Rwanda', description: 'Welcome back' };

  return (
    <div className="min-h-screen bg-[#eef0f8] flex items-center justify-center p-4">
      <div className="w-full max-w-[1350px] h-[820px] bg-white rounded-3xl shadow-2xl flex overflow-hidden">
        <Sidebar role={role} onLogout={onLogout} />
        <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f7fb]">
          <TopBar 
            title={header.title} 
            description={header.description} 
            role={role} 
            onLogout={onLogout} 
          />
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

  const dashboardRoute = role === 'student' ? '/student/overview' : `/${role}/dashboard`;

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
              <Route path="students"  element={<MentorDashboard />} />
              <Route path="messages"  element={<MentorDashboard />} />
              <Route path="modules"   element={<AdminModules />} />
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
              <Route path="dashboard" element={<Navigate to="/student/overview" replace />} />
              <Route path="overview"  element={<StudentDashboard />} />
              <Route path="my-courses"element={<StudentDashboard />} />
              <Route path="modules"   element={<LearningModules />} />
              <Route path="quizzes"   element={<StudentDashboard />} />
              <Route path="certificates" element={<StudentDashboard />} />
              <Route path="certificate/:id" element={<CertificateView />} />
              <Route path="messages"  element={<StudentDashboard />} />
              <Route path="learning/:moduleId/:contentId" element={<LearningContent />} />
              <Route path="profile"   element={<Profile role={role} />} />
              <Route index            element={<Navigate to="overview" replace />} />
            </Routes>
          </Shell>
        </ProtectedRoute>
      } />

      {/* ── Employer routes ───────────────────────────────────────────── */}
      <Route path="/employer/*" element={
        <ProtectedRoute isAuthenticated={isAuthenticated && role === 'employer'}>
          <Shell role={role} onLogout={handleLogout}>
            <Routes>
              <Route path="dashboard"    element={<EmployerDashboard />} />
              <Route path="students"     element={<EmployerDashboard />} />
              <Route path="interactions" element={<EmployerDashboard />} />
              <Route path="profile"      element={<Profile role={role} />} />
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
