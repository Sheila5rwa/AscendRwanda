import React, { useState } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from './Sidebar';

interface TopBarProps {
  title?: string;
  description?: string;
  role: UserRole;
  onLogout: () => void;
}

const avatarGradients: Record<UserRole, string> = {
  admin:    'from-blue-500 to-indigo-600',
  student:  'from-green-500 to-emerald-600',
  mentor:   'from-purple-500 to-violet-600',
  employer: 'from-orange-500 to-amber-600',
};

const TopBar: React.FC<TopBarProps> = ({ title, description, role, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Read real user from localStorage
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();

  const firstName  = user.first_name ?? '';
  const lastName   = user.last_name  ?? '';
  const fullName   = [firstName, lastName].filter(Boolean).join(' ') || role;
  const initials   = [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase() || role[0].toUpperCase();

  return (
    <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-gray-100 bg-white flex-shrink-0 relative">
      <div>
        <h1 className="text-xl font-bold text-gray-800">{title || 'Dashboard'}</h1> 
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">{description || 'Welcome back'}</p> 
      </div>

      <div className="flex items-center gap-4">
        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 p-1 rounded-2xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100"
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradients[role]} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-gray-800 leading-none mb-1">{fullName}</p>
              <p className="text-[10px] text-gray-400 font-medium capitalize">{role}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[100]">
              <div className="px-4 py-2 border-b border-gray-50 mb-1">
                <p className="text-xs font-bold text-gray-700">{fullName}</p>
                <p className="text-[10px] text-gray-400 capitalize">{role}</p>
              </div>
              <button
                onClick={() => { navigate(`/${role}/profile`); setShowDropdown(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition font-medium text-left"
              >
                <User className="w-4 h-4" /> Profile Details
              </button>
              <div className="h-px bg-gray-50 my-1" />
              <button
                onClick={() => { onLogout(); setShowDropdown(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition font-bold text-left"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
