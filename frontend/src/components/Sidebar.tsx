import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  MessageSquare,
  Award,
  LogOut,
  User,
  Play,
  FileText,
} from 'lucide-react';

export type UserRole = 'admin' | 'mentor' | 'employer' | 'student';

interface SidebarProps {
  role: UserRole;
  onLogout: () => void;
}

const allNavItems: {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}[] = [
  // Admin
  { path: '/admin/dashboard',       label: 'Dashboard',       icon: LayoutDashboard, roles: ['admin'] },
  { path: '/admin/students',        label: 'Users',           icon: Users,           roles: ['admin'] },
  { path: '/admin/modules',         label: 'Modules',         icon: BookOpen,        roles: ['admin'] },
  { path: '/admin/certification',   label: 'Certification',   icon: Award,           roles: ['admin'] },

  // Mentor
  { path: '/mentor/dashboard', label: 'Dashboard',   icon: LayoutDashboard, roles: ['mentor'] },
  { path: '/mentor/students',  label: 'My Students', icon: Users,           roles: ['mentor'] },
  { path: '/mentor/messages',  label: 'Messages',    icon: MessageSquare,   roles: ['mentor'] },
  { path: '/mentor/modules',   label: 'Modules',     icon: BookOpen,        roles: ['mentor'] },

  // Student
  { path: '/student/overview',  label: 'Overview',      icon: LayoutDashboard, roles: ['student'] },
  { path: '/student/my-courses',label: 'My Learning',   icon: Play,            roles: ['student'] },
  { path: '/student/modules',   label: 'Explore Catalog', icon: BookOpen,        roles: ['student'] },
  { path: '/student/quizzes',   label: 'Tests & Exams',  icon: FileText,        roles: ['student'] },
  { path: '/student/certificates', label: 'Certificates', icon: Award,           roles: ['student'] },
  { path: '/student/messages',  label: 'Messages',      icon: MessageSquare,   roles: ['student'] },

  // Employer
  { path: '/employer/dashboard',    label: 'Dashboard',    icon: LayoutDashboard, roles: ['employer'] },
  { path: '/employer/students',     label: 'Student Pool', icon: Users,           roles: ['employer'] },
  { path: '/employer/interactions', label: 'Interactions', icon: MessageSquare,   roles: ['employer'] },
];

const Sidebar: React.FC<SidebarProps> = ({ role, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = allNavItems.filter(item => item.roles.includes(role));

  return (
    <aside className="flex flex-col h-full w-[220px] min-w-[220px] bg-[#1a2a6c] text-white relative">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-8 border-b border-blue-800/50">
        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg">
          <GraduationCap className="w-6 h-6 text-[#1a2a6c]" />
        </div>
        <div>
          <span className="font-bold text-base leading-tight block">Ascend</span>
          <span className="text-xs text-blue-300 leading-tight block">Rwanda</span>
        </div>
      </div>

      <div className="h-4" />

      {/* Main Nav */}
      <nav className="flex-1 px-3 pt-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-blue-200 hover:bg-blue-800/70 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          );
        })}

        {/* Profile link */}
        <div className="pt-4 pb-1">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest px-4 mb-2">Account</p>
          <button
            onClick={() => navigate(`/${role}/profile`)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              location.pathname === `/${role}/profile`
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-blue-200 hover:bg-blue-800/70 hover:text-white'
            }`}
          >
            <User className="w-4 h-4 flex-shrink-0" />
            Profile
          </button>
        </div>
      </nav>

      {/* Logout */}
      <div className="m-3">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-white text-[#1a2a6c] text-sm font-bold py-2.5 rounded-xl hover:bg-blue-100 transition-colors shadow-md"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
// Re-export ActivePage as string alias for backward compat
export type ActivePage = string;
