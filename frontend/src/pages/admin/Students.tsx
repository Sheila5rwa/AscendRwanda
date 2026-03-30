import React, { useState, useEffect } from 'react';
import {
  Search, AlertTriangle, CheckCircle, Plus,
  Edit3, Trash2, X, Save, Eye, Phone, Mail, Calendar, Key
} from 'lucide-react';
import api from '../../utils/api';

const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-400', 'bg-pink-500', 'bg-teal-500', 'bg-red-400', 'bg-indigo-500'];

// ─── Register Modal ───────────────────────────────────────────────────────────
const RegisterModal: React.FC<{ onClose: () => void; onRefresh: () => void }> = ({ onClose, onRefresh }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone_number: '', email: '', national_id: '', password: '', dob: '', role: 'student', guardian_id: '' });
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const isYouth = form.dob && new Date().getFullYear() - new Date(form.dob).getFullYear() < 16;

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/signup', form);
      setDone(true);
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        {!done ? (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800 text-lg">Register New User</h3>
              <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>

            {/* Steps */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2].map(s => (
                <React.Fragment key={s}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{s}</div>
                  {s < 2 && <div className={`flex-1 h-1 rounded ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                </React.Fragment>
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">First Name *</label>
                    <input value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="First name" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Last Name *</label>
                    <input value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Last name" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Phone Number *</label>
                  <input value={form.phone_number} onChange={e => set('phone_number', e.target.value)} placeholder="+250 7XX XXX XXX" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Email (optional)</label>
                  <input value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Date of Birth *</label>
                  <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                {isYouth && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                    <p className="text-xs text-yellow-700 font-semibold mb-1">⚠️ Youth under 16 — Guardian required (FR 1.2)</p>
                    <input value={form.guardian_id} onChange={e => set('guardian_id', e.target.value)} placeholder="Guardian's NID" className="w-full border border-yellow-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                  </div>
                )}
                <button onClick={() => setStep(2)} disabled={!form.first_name || !form.last_name || !form.phone_number} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-40">Next →</button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">National ID (optional for youth)</label>
                  <input value={form.national_id} onChange={e => set('national_id', e.target.value)} placeholder="RW-XXXX-XXXX" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Temporary Password</label>
                  <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-2">Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'student', label: '🎓 Student', desc: 'Learner access' },
                      { value: 'mentor', label: '👨‍🏫 Mentor', desc: 'Mentor & lecturer' },
                      { value: 'admin', label: '🛡️ Admin', desc: 'Full access' },
                      { value: 'employer', label: '🏢 Employer', desc: 'View & interact' },
                    ].map(r => (
                      <button key={r.value} onClick={() => set('role', r.value)} className={`p-3 rounded-xl border-2 text-left transition-all ${form.role === r.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                        <p className="text-sm font-semibold text-gray-800">{r.label}</p>
                        <p className="text-xs text-gray-400">{r.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button disabled={loading} onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50">← Back</button>
                  <button disabled={loading || !form.password} onClick={handleSubmit} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" /> Register
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">Registration Successful!</h3>
            <p className="text-gray-500 text-sm mb-1">{form.first_name} {form.last_name} has been registered.</p>
            <p className="text-xs text-gray-400 mb-5">Role: {form.role} · Phone: {form.phone_number}</p>
            <button onClick={onClose} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm">Done</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Student Detail Modal ─────────────────────────────────────────────────────
const StudentDetail: React.FC<{ student: any; onClose: () => void }> = ({ student, onClose }) => {
  const name = `${student.first_name} ${student.last_name}`;
  return (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-800 text-lg">User Profile</h3>
        <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
      </div>
      <div className="flex items-center gap-4 mb-5 p-4 bg-gray-50 rounded-2xl">
        <div className={`w-16 h-16 ${avatarColors[student.user_id % avatarColors.length]} rounded-full flex items-center justify-center text-white font-bold text-xl shadow`}>
          {name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-gray-800 text-lg">{name}</p>
          <p className="text-xs text-gray-400">Joined: {new Date(student.createdAt).toLocaleDateString()}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize bg-blue-100 text-blue-700`}>{student.role}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Phone', value: student.phone_number, icon: <Phone className="w-3.5 h-3.5" /> },
          { label: 'Email', value: student.email || 'Not provided', icon: <Mail className="w-3.5 h-3.5" /> },
          { label: 'Date of Birth', value: student.dob, icon: <Calendar className="w-3.5 h-3.5" /> },
          { label: 'National ID', value: student.national_id, icon: <Eye className="w-3.5 h-3.5" /> },
        ].map(f => (
          <div key={f.label} className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">{f.icon}<span className="text-xs">{f.label}</span></div>
            <p className="text-sm font-semibold text-gray-700 truncate">{f.value || 'N/A'}</p>
          </div>
        ))}
      </div>
      <button onClick={onClose} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700">Close</button>
    </div>
  </div>
);
};

// ─── Main Students/Users Page ───────────────────────────────────────────────────────
const Students: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'student' | 'mentor' | 'employer'>('all');
  const [showRegister, setShowRegister] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data || []);
    } catch (e) {
      console.error('Failed to load users', e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (e) {
      console.error('Failed to delete user', e);
    }
  };

  const filtered = users
    .filter(s => {
      const name = `${s.first_name} ${s.last_name}`.toLowerCase();
      const q = name.includes(search.toLowerCase()) || (s.email && s.email.includes(search.toLowerCase()));
      if (filter !== 'all') return q && s.role === filter;
      return q;
    });

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4 flex-shrink-0">
        {[
          { label: 'Total Users', value: users.length, color: 'bg-gradient-to-br from-blue-500 to-blue-700', icon: '👥' },
          { label: 'Students', value: users.filter(s => s.role === 'student').length, color: 'bg-gradient-to-br from-emerald-500 to-emerald-700', icon: '🎓' },
          { label: 'Mentors', value: users.filter(s => s.role === 'mentor').length, color: 'bg-gradient-to-br from-purple-500 to-purple-700', icon: '👨‍🏫' },
          { label: 'Employers', value: users.filter(s => s.role === 'employer').length, color: 'bg-gradient-to-br from-orange-500 to-orange-700', icon: '🏢' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.color} rounded-2xl p-4 text-white shadow`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
            <p className="text-xs text-white/80">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {(['all', 'student', 'mentor', 'employer'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter === f ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>{f}</button>
          ))}
        </div>

        <button onClick={() => setShowRegister(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow">
          <Plus className="w-4 h-4" /> Register Student
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-sm border border-gray-100">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">User</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Role</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Contact</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Joined</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((s: any, i: number) => (
              <tr key={s.user_id} className="hover:bg-gray-50/70 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 ${avatarColors[s.user_id % avatarColors.length]} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {`${s.first_name[0] || ''}${s.last_name[0] || ''}`.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{s.first_name} {s.last_name}</p>
                      {s.national_id && <p className="text-xs text-gray-400">NID: {s.national_id}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-semibold bg-gray-100 text-gray-600`}>
                    {s.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-gray-600">{s.phone_number || 'No phone'}</p>
                  {s.email && <p className="text-xs text-gray-400">{s.email}</p>}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setSelectedStudent(s)} className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(s.user_id)} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="font-semibold">No users found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} onRefresh={fetchUsers} />}
      {selectedStudent && <StudentDetail student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
    </div>
  );
};

export default Students;
