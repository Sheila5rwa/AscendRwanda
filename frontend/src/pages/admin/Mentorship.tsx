import React, { useState } from 'react';
import { MessageSquare, CheckCircle, Plus, X, Save, Search, Edit3, Users, Calendar } from 'lucide-react';

const mentorships = [
  { id: 1, mentor: 'Dr. Kagame Eric', mentorAvatar: 'KE', course: 'Computer Literacy', students: 12, created: '10 Feb 2026', updated: '14 Feb 2026' },
  { id: 2, mentor: 'Prof. Uwase Celestine', mentorAvatar: 'UC', course: 'English Workplace', students: 15, created: '12 Feb 2026', updated: '15 Feb 2026' },
  { id: 3, mentor: 'Mr. Nshimiyimana Jules', mentorAvatar: 'NJ', course: 'Digital Finance', students: 8, created: '01 Feb 2026', updated: '12 Feb 2026' },
];

const mentors = [
  { name: 'Dr. Kagame Eric', avatar: 'KE', color: 'bg-blue-500', students: 2, speciality: 'Computer Literacy' },
  { name: 'Prof. Uwase Celestine', avatar: 'UC', color: 'bg-purple-500', students: 2, speciality: 'English Workplace' },
  { name: 'Mr. Nshimiyimana Jules', avatar: 'NJ', color: 'bg-green-500', students: 1, speciality: 'Digital Finance' },
];

const courseOptions = ['Computer Literacy', 'English for the Workplace', 'Digital Financial Literacy', 'Internet & Online Safety', 'Mobile Phone Essentials'];

const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-400', 'bg-pink-500'];

const AssignModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [mentor, setMentor] = useState('');
  const [course, setCourse] = useState('');
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        {!done ? (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800 text-lg">Assign Mentor to Course</h3>
              <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Select Mentor</label>
                <select value={mentor} onChange={e => setMentor(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Choose mentor...</option>
                  {mentors.map(m => <option key={m.name} value={m.name}>{m.name} – {m.speciality}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Select Course/Module</label>
                <select value={course} onChange={e => setCourse(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Choose course...</option>
                  {courseOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Initial Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Initial observations or goals..." className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
                <button onClick={() => setDone(true)} disabled={!mentor || !course} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Assign
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 mb-1">Mentorship Assigned!</h3>
            <p className="text-sm text-gray-500 mb-5">{mentor} has been assigned to lead the "{course}" module.</p>
            <button onClick={onClose} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm">Done</button>
          </div>
        )}
      </div>
    </div>
  );
};

const Mentorship: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'flagged'>('all');
  const [search, setSearch] = useState('');
  const [showAssign, setShowAssign] = useState(false);

  const filtered = mentorships.filter(m => {
    const matchSearch = m.course.toLowerCase().includes(search.toLowerCase()) || m.mentor.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4 flex-shrink-0">
        {[
          { label: 'Total Mentors', value: mentors.length, color: 'bg-gradient-to-br from-blue-500 to-blue-700', icon: '👨‍🏫' },
          { label: 'Students Reached', value: mentorships.reduce((a,b)=>a+b.students,0), color: 'bg-gradient-to-br from-green-500 to-emerald-700', icon: '👥' },
          { label: 'Courses Assigned', value: mentorships.length, color: 'bg-gradient-to-br from-purple-500 to-violet-600', icon: '📚' },
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

      {/* Mentor Cards */}
      <div className="flex gap-3 mb-4 flex-shrink-0">
        {mentors.map(m => (
          <div key={m.name} className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className={`w-10 h-10 ${m.color} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>{m.avatar}</div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate">{m.name}</p>
              <p className="text-xs text-gray-400">{m.speciality}</p>
              <p className="text-xs text-blue-600 font-semibold">{m.students} students</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-3 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student or mentor..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {(['all', 'flagged'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${activeTab === t ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>{t === 'all' ? 'All' : '🚩 Flagged'}</button>
          ))}
        </div>
        <button onClick={() => setShowAssign(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow">
          <Plus className="w-4 h-4" /> Assign Mentor
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-3">
        {filtered.map((m, i) => (
          <div key={m.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 ${avatarColors[i % avatarColors.length]} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm border-2 border-white`}>{m.mentorAvatar}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-gray-800">{m.mentor}</p>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700">
                    Lead Mentor for {m.course}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700">{m.students} Students Enrolled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400">Assigned: {m.created}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-300 mt-2">Last Strategy Update: {m.updated}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-xl transition"><Edit3 className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-green-50 text-gray-400 hover:text-green-600 rounded-xl transition"><MessageSquare className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="font-semibold">No mentorship records found</p>
          </div>
        )}
      </div>

      {showAssign && <AssignModal onClose={() => setShowAssign(false)} />}
    </div>
  );
};

export default Mentorship;
