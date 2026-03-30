import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Camera, Save, Key, Phone, Calendar, Loader2, X } from 'lucide-react';
import { UserRole } from '../../components/Sidebar';
import api from '../../utils/api';

interface ProfileProps {
  role: UserRole;
}

const Profile: React.FC<ProfileProps> = ({ role }) => {
  // Read real user from localStorage set during login
  const stored = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();

  const [userProfile, setUserProfile] = useState<any>(stored);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: stored.first_name ?? '',
    last_name: stored.last_name ?? '',
    email: stored.email ?? '',
    phone_number: stored.phone_number ?? '',
  });

  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [pwdData, setPwdData] = useState({ current_password: '', new_password: '' });
  const [pwdMsg, setPwdMsg] = useState('');

  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        setUserProfile(res.data);
        setFormData({
          first_name: res.data.first_name || '',
          last_name: res.data.last_name || '',
          email: res.data.email || '',
          phone_number: res.data.phone_number || '',
        });
        localStorage.setItem('user', JSON.stringify({ ...stored, ...res.data }));
      })
      .catch(err => console.error('Failed to load profile', err));
  }, []);

  const initials = [formData.first_name?.[0], formData.last_name?.[0]].filter(Boolean).join('').toUpperCase() || role[0]?.toUpperCase() || '?';

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await api.put('/auth/me', formData);
      setUserProfile(res.data.user);
      setIsEditing(false);
      localStorage.setItem('user', JSON.stringify({ ...stored, ...res.data.user }));
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg('');
    try {
      await api.put('/auth/me/password', pwdData);
      setPwdMsg('Password updated successfully.');
      setPwdData({ current_password: '', new_password: '' });
      setTimeout(() => setPwdModalOpen(false), 2000);
    } catch (err: any) {
      setPwdMsg(err.response?.data?.message || 'Failed to update password.');
    }
  };

  const avatarGradients: Record<UserRole, string> = {
    admin:    'from-blue-500 to-indigo-600',
    student:  'from-green-500 to-emerald-600',
    mentor:   'from-purple-500 to-violet-600',
    employer: 'from-orange-500 to-amber-600',
  };

  return (
    <div className="h-full overflow-y-auto pr-1 pb-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Cover */}
          <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-700" />

          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-xl">
                  <div className={`w-full h-full rounded-xl bg-gradient-to-br ${avatarGradients[role]} flex items-center justify-center`}>
                    <span className="text-2xl font-black text-white">{initials}</span>
                  </div>
                </div>
                <button className="absolute bottom-1 right-1 p-1.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition opacity-0 group-hover:opacity-100">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Edit button */}
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`px-5 py-2 rounded-xl font-bold transition flex items-center gap-2 text-sm ${
                  isEditing
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-white border-2 border-gray-100 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isEditing ? <Save className="w-4 h-4" /> : <User className="w-4 h-4" />}
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Sidebar */}
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    {userProfile.first_name} {userProfile.last_name}
                  </h2>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider mt-2">
                    <Shield className="w-3 h-3" /> {role}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-50">
                  {userProfile.email && (
                    <div className="flex items-center gap-3 text-gray-500">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium break-all">{userProfile.email}</span>
                    </div>
                  )}
                  {userProfile.phone_number && (
                    <div className="flex items-center gap-3 text-gray-500">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{userProfile.phone_number}</span>
                    </div>
                  )}
                  {userProfile.dob && (
                    <div className="flex items-center gap-3 text-gray-500">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{userProfile.dob}</span>
                    </div>
                  )}
                  {userProfile.national_id && (
                    <div className="flex items-center gap-3 text-gray-500">
                      <Shield className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">NID: {userProfile.national_id}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-gray-400">
                    <Key className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">Password hidden</span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">First Name</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.first_name}
                      onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Last Name</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.last_name}
                      onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email</label>
                    <input
                      type="email"
                      disabled={!isEditing}
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Phone</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.phone_number}
                      onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Account Security</h3>
                  <button onClick={() => setPwdModalOpen(true)} className="text-blue-600 text-sm font-bold hover:underline">Change Password</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {pwdModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
            <button onClick={() => setPwdModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-gray-900 mb-4">Change Password</h3>
            {pwdMsg && <p className="text-sm mb-3 bg-blue-50 text-blue-700 p-2 rounded-lg">{pwdMsg}</p>}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={pwdData.current_password}
                  onChange={e => setPwdData({ ...pwdData, current_password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={pwdData.new_password}
                  onChange={e => setPwdData({ ...pwdData, new_password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm mb-4"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700">
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
