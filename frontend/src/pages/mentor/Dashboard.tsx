import React, { useState, useEffect } from 'react';
import {
  Users, AlertTriangle, CheckCircle, MessageSquare,
  X, ChevronRight, Save, Edit3,
  BarChart2, Send, Search, Loader2
} from 'lucide-react';
import api from '../../utils/api';

// Read real user from localStorage
const storedUser = (() => {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
})();

const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-400', 'bg-pink-500'];

// Format percentage safe wrap
const toPercent = (completed: number, total: number) => total > 0 ? Math.round((completed / total) * 100) : 0;



// ─── Student Notes Modal ──────────────────────────────────────────────────────
const StudentNoteModal: React.FC<{ student: any; onClose: () => void; onRefresh: () => void }> = ({ student, onClose, onRefresh }) => {
  const [note, setNote] = useState(student.notes || '');
  const [flagged, setFlagged] = useState(student.flagged);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const studentName = `${student.Student?.first_name || ''} ${student.Student?.last_name || ''}`;
  const totalCompleted = student.Student?.Progresses?.reduce((acc: number, cur: any) => acc + (cur.completed_content || 0), 0) || 0;
  const totalMod = student.Student?.Progresses?.reduce((acc: number, cur: any) => acc + (cur.Module?.Contents?.length || 0), 0) || 1;
  const sysProg = toPercent(totalCompleted, totalMod);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (flagged !== student.flagged) {
        if (flagged) {
          await api.put(`/mentors/flag/${student.student_id}`);
        } else {
          await api.put(`/mentors/unflag/${student.student_id}`);
        }
      }
      if (note !== student.notes) {
        await api.post('/mentors/note', { student_id: student.student_id, notes: note });
      }
      setSaved(true);
      onRefresh();
    } catch (e) {
      console.error('Failed to update student note', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        {!saved ? (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-800">{studentName}</h3>
                <p className="text-xs text-gray-400">Enrolled Student</p>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Course Progress</label>
                <span className="text-sm font-bold text-blue-600">{sysProg}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${sysProg}%` }} />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Mentor Notes</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={4}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add your observations about this student..."
              />
            </div>
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => setFlagged(!flagged)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${flagged ? 'bg-red-100 text-red-600 border-2 border-red-300' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'}`}
              >
                <AlertTriangle className="w-4 h-4" />
                {flagged ? '🚩 Flagged for Support' : 'Flag for Support'}
              </button>
              {flagged && <p className="text-xs text-red-500">Student will receive priority support.</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50">Cancel</button>
              <button disabled={saving} onClick={handleSave} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 mb-1">Updates Saved</h3>
            <p className="text-sm text-gray-400 mb-5">Student record updated successfully.</p>
            <button onClick={onClose} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm">Done</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'students' | 'messages';

const MentorDashboard: React.FC = () => {
  const [tab, setTab] = useState<Tab>('overview');
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filterFlagged, setFilterFlagged] = useState(false);
  
  const [msgText, setMsgText] = useState('');
  const [msgStudent, setMsgStudent] = useState('');
  const [msgSent, setMsgSent] = useState(false);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/mentors/students');
      setStudentsList(res.data);
    } catch (e) {
      console.error('Failed to load mentor students', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = studentsList.filter(s => {
    const name = `${s.Student?.first_name} ${s.Student?.last_name}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const matchFlag = filterFlagged ? s.flagged : true;
    return matchSearch && matchFlag;
  });

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'students', label: 'My Students', icon: <Users className="w-4 h-4" />, badge: studentsList.filter(s => s.flagged).length },
    { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="h-full flex overflow-hidden">
      {/* Mentor Vertical Sidebar Replacer */}
      <div className="w-60 bg-white border-r border-gray-100 flex flex-col h-full -ml-6 mr-4 py-4">
        <div className="px-6 mb-8 text-center pt-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow mb-3 mx-auto">
              {`${storedUser.first_name?.[0] || ''}${storedUser.last_name?.[0] || ''}`.toUpperCase() || 'M'}
            </div>
            <p className="font-bold text-gray-800 text-sm truncate">{storedUser.first_name} {storedUser.last_name}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Mentor Dashboard</p>
        </div>
        
        <div className="flex-1 space-y-1 px-3">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {t.icon}
                <span>{t.label}</span>
              </div>
              {t.badge && t.badge > 0 && (
                <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  tab === t.id ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
                }`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-4 bg-indigo-50 mx-3 rounded-2xl">
          <p className="text-[10px] text-indigo-400 font-bold uppercase mb-2">My Information</p>
          <div className="space-y-2">
            <p className="text-xs text-indigo-700 font-semibold truncate">• Supporting {studentsList.length} Learners</p>
          </div>
        </div>
      </div>

      {/* Main Mentor Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile-style Top Bar within the page if needed, but we rely on TopBar.tsx elsewhere */}
        <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm md:hidden">
           <h2 className="font-bold text-gray-800 capitalize">{tab}</h2>
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Assigned Students', value: studentsList.length, icon: '👥', color: 'bg-gradient-to-br from-blue-500 to-blue-700' },
                { label: 'Flagged Learners', value: studentsList.filter(s => s.flagged).length, icon: '🚩', color: 'bg-gradient-to-br from-red-500 to-rose-600' },
                { label: 'Avg Progress', value: studentsList.length > 0 ? (studentsList.reduce((acc, s) => acc + toPercent(s.Student?.Progresses?.[0]?.completed_content || 0, s.Student?.Progresses?.[0]?.Module?.Contents?.length || 1), 0) / studentsList.length).toFixed(0) + '%' : '0%', icon: '📈', color: 'bg-gradient-to-br from-purple-500 to-violet-700' },
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

            {/* Students Needing Attention */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" /> Students Needing Attention</h3>
                <button onClick={() => setTab('students')} className="text-blue-600 text-xs font-semibold hover:underline flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></button>
              </div>
              <div className="space-y-3">
                {studentsList.filter(s => s.flagged).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No learners flagged currently. Keep up the good work!</p>
                )}
                {studentsList.filter(s => s.flagged).map((s, i) => (
                  <div key={s.mentorship_id} className="flex items-center gap-4 p-3 bg-red-50 rounded-xl border border-red-100">
                    <div className={`w-9 h-9 ${avatarColors[i % avatarColors.length]} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {`${s.Student?.first_name?.[0] || ''}${s.Student?.last_name?.[0] || ''}`.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{s.Student?.first_name} {s.Student?.last_name}</p>
                      <p className="text-xs text-gray-400">Assigned: {new Date(s.created_at).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => setSelectedStudent(s)} className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-red-200 transition">Action Needed</button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── STUDENTS ── */}
        {tab === 'students' && (
          <>
            <div className="flex items-center gap-3 mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button
                onClick={() => setFilterFlagged(!filterFlagged)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 ${filterFlagged ? 'bg-red-600 text-white border-red-600' : 'border-gray-200 text-gray-600 hover:border-red-300'}`}
              >
                <AlertTriangle className="w-4 h-4" /> {filterFlagged ? 'All Students' : 'Flagged Only'}
              </button>
            </div>
            <div className="space-y-3">
              {filteredStudents.length === 0 && (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-400 font-semibold">No students found</p>
                </div>
              )}
              {filteredStudents.map((s, i) => {
                const totalComp = s.Student?.Progresses?.reduce((a: number, c: any) => a + (c.completed_content||0), 0) || 0;
                const totalMod = s.Student?.Progresses?.reduce((acc: number, cur: any) => acc + (cur.Module?.Contents?.length || 0), 0) || 1;
                const prog = toPercent(totalComp, totalMod);
                const score = s.Student?.Progresses?.length > 0 ? Math.round(s.Student.Progresses.reduce((a:any,c:any)=>a+(c.exam_score||0), 0) / s.Student.Progresses.length) : 0;
                
                return (
                <div key={s.mentorship_id} className={`bg-white rounded-2xl p-5 shadow-sm border transition hover:shadow-md ${s.flagged ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${avatarColors[i % avatarColors.length]} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
                      {`${s.Student?.first_name?.[0] || ''}${s.Student?.last_name?.[0] || ''}`.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-gray-800">{s.Student?.first_name} {s.Student?.last_name}</p>
                        {s.flagged && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Needs Support
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-2">Joined: {new Date(s.Student?.createdAt).toLocaleDateString()}</p>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs text-gray-400 w-10">Score</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${score}%` }} />
                          </div>
                          <span className="text-xs font-bold text-gray-600">{score}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs text-gray-400 w-16">Progress</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${prog}%` }} />
                          </div>
                          <span className="text-xs font-bold text-gray-600">{prog}%</span>
                        </div>
                      </div>
                      {s.notes && <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mt-2 italic">📝 {s.notes}</p>}
                    </div>
                    <button onClick={() => setSelectedStudent(s)} className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-blue-700 transition flex-shrink-0">
                      <Edit3 className="w-3.5 h-3.5" /> Notes
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── MESSAGES ── */}
        {tab === 'messages' && (
          <div className="space-y-4">
            {/* Compose */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Send className="w-4 h-4 text-blue-500" /> Send Message to Student</h3>
              <select value={msgStudent} onChange={e => setMsgStudent(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select a student...</option>
                {studentsList.map(s => <option key={s.student_id} value={s.Student?.first_name}>{s.Student?.first_name} {s.Student?.last_name}</option>)}
              </select>
              <textarea
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                rows={3}
                placeholder="Type your message or feedback..."
                className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />
              <button
                disabled={!msgStudent || !msgText.trim()}
                onClick={() => { setMsgSent(true); setMsgText(''); setMsgStudent(''); setTimeout(() => setMsgSent(false), 3000); }}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-40"
              >
                <Send className="w-4 h-4" /> {msgSent ? '✅ Sent!' : 'Send Message'}
              </button>
            </div>

            {/* Inbox */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3">Recent Messages</h3>
              <div className="space-y-3">
                {[
                  { from: 'Amina Uwimana', msg: 'Thank you for the feedback on my quiz!', time: '2h ago', unread: true },
                  { from: 'Jean Paul Habimana', msg: 'Can we schedule a one-on-one session?', time: '1d ago', unread: false },
                  { from: 'Platform Admin', msg: 'New module content uploaded – please review.', time: '2d ago', unread: false },
                ].map((m, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition">
                    <div className={`w-9 h-9 ${avatarColors[i % avatarColors.length]} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {m.from.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-semibold text-gray-800">{m.from}</p>
                        <div className="flex items-center gap-1.5">
                          {m.unread && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                          <span className="text-xs text-gray-400">{m.time}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{m.msg}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedStudent && <StudentNoteModal student={selectedStudent} onClose={() => setSelectedStudent(null)} onRefresh={fetchStudents} />}
    </div>
  );
};

export default MentorDashboard;
