import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Calendar, Star, Search, ChevronRight,
  CheckCircle, Briefcase, Filter, Plus, Loader2,
  Mail, Phone
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import api from '../../utils/api';

const typeConfig: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  message:  { label: 'Message',   cls: 'bg-blue-100 text-blue-700',   icon: <MessageSquare className="w-3.5 h-3.5" /> },
  interview:{ label: 'Interview', cls: 'bg-green-100 text-green-700',  icon: <Calendar className="w-3.5 h-3.5" /> },
  feedback: { label: 'Feedback',  cls: 'bg-yellow-100 text-yellow-700',icon: <Star className="w-3.5 h-3.5" /> },
};

const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-400', 'bg-pink-500'];

type Tab = 'overview' | 'students' | 'interactions';

const Dashboard: React.FC = () => {
  const location = useLocation();
  const pathPart = location.pathname.split('/').pop();
  const tab: Tab = (pathPart === 'students' || pathPart === 'interactions') ? pathPart : 'overview';
  
  const [search, setSearch]       = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [hiredStudents, setHiredStudents] = useState<number[]>([]);
  const [showCompose, setShowCompose] = useState(false);

  const [students, setStudents]         = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();

  useEffect(() => {
    const load = async () => {
      try {
        const [stuRes, intRes] = await Promise.all([
          api.get('/employers/students'),
          api.get('/employers/interactions'),
        ]);
        setStudents(stuRes.data ?? []);
        setInteractions(intRes.data ?? []);
      } catch (e) {
        console.error('Employer data load error', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const uniqueSkills = Array.from(new Set(students.map((s: any) => (s.skill ?? s.specialization ?? '')).filter(Boolean)));

  const filteredPool = students.filter((s: any) => {
    const q = search.toLowerCase();
    const nameMatch = `${s.first_name} ${s.last_name}`.toLowerCase().includes(q);
    const skillMatch = skillFilter === 'all' || (s.skill ?? s.specialization) === skillFilter;
    return nameMatch && skillMatch;
  });

  const filteredInteractions = interactions.filter((i: any) => {
    const q = search.toLowerCase();
    // Backend returns nested Student object from Sequelize include
    const firstName = i.Student?.first_name ?? i.student_first_name ?? '';
    const lastName  = i.Student?.last_name  ?? i.student_last_name  ?? '';
    const studentName = `${firstName} ${lastName}`.toLowerCase();
    return studentName.includes(q) && (typeFilter === 'all' || i.interaction_type === typeFilter);
  });

  const handleHire = async (id: number) => {
    if (!hiredStudents.includes(id)) {
      setHiredStudents(prev => [...prev, id]);
      try {
        await api.post('/employers/select', { student_id: id, content: 'Employer has selected this student.' });
        const res = await api.get('/employers/interactions');
        setInteractions(res.data ?? []);
      } catch (e) {
        console.error('Failed to select student', e);
      }
    }
  };


  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">



      <div className="flex-1 overflow-y-auto pr-1 pb-4 space-y-4">

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Interactions', value: interactions.length, icon: '💬', color: 'bg-gradient-to-br from-blue-500 to-blue-700' },
                { label: 'Interviews Scheduled', value: interactions.filter(i => i.interaction_type === 'interview').length, icon: '📅', color: 'bg-gradient-to-br from-green-500 to-emerald-700' },
                { label: 'Students Hired', value: hiredStudents.length, icon: '🎉', color: 'bg-gradient-to-br from-orange-500 to-amber-600' },
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

            {/* My Company Profile */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{user.first_name} {user.last_name}</h3>
                  <p className="text-gray-500 text-sm">Employer Account</p>
                </div>
                <div className="ml-auto">
                  <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-bold uppercase">Active</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4" /> {user.email ?? '—'}</div>
                <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4" /> {user.phone ?? '—'}</div>
              </div>
            </div>

            {/* Recent Interactions */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Recent Interactions</h3>
              {interactions.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No interactions yet.</p>}
              <div className="space-y-3">
                {interactions.slice(0, 3).map((i: any, idx: number) => {
                  // Backend nests student as i.Student (Sequelize as: 'Student')
                  const sFirst = i.Student?.first_name ?? i.student_first_name ?? '?';
                  const sLast  = i.Student?.last_name  ?? i.student_last_name  ?? '';
                  return (
                    <div key={i.interaction_id ?? idx} className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className={`w-10 h-10 ${avatarColors[idx % avatarColors.length]} rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {sFirst[0]}{sLast[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${(typeConfig[i.interaction_type] ?? typeConfig.message).cls}`}>
                          {(typeConfig[i.interaction_type] ?? typeConfig.message).label}
                        </span>
                        <p className="text-xs text-gray-700 font-bold mt-1">{sFirst} {sLast}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{i.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── STUDENT POOL ── */}
        {tab === 'students' && (
          <>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                {uniqueSkills.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <select value={skillFilter} onChange={e => setSkillFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="all">All Skills</option>
                      {uniqueSkills.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {filteredPool.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-400 text-sm">No students found.</p>
                </div>
              )}
              {filteredPool.map((s: any, i: number) => {
                const id = s.user_id ?? s.id ?? i;
                const isHired = hiredStudents.includes(id);
                return (
                  <div key={id} className={`bg-white rounded-2xl p-5 shadow-sm border flex items-center gap-4 hover:shadow-md transition ${isHired ? 'border-green-200 bg-green-50/20' : 'border-gray-100'}`}>
                    <div className={`w-12 h-12 ${avatarColors[i % avatarColors.length]} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
                      {s.first_name?.[0]}{s.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-800">{s.first_name} {s.last_name}</p>
                        {s.certified && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-black uppercase">Certified</span>}
                        {isHired && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black uppercase flex items-center gap-1"><CheckCircle className="w-3 h-3" />Hired</span>}
                      </div>
                      {(s.skill ?? s.specialization) && (
                        <p className="text-xs text-gray-400 mt-0.5">Skill: <span className="text-blue-600 font-semibold">{s.skill ?? s.specialization}</span></p>
                      )}
                    </div>
                    <button
                      onClick={() => handleHire(id)}
                      disabled={isHired}
                      className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 ${isHired ? 'bg-green-100 text-green-600 cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}`}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      {isHired ? 'Hired' : 'Select to Hire'}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── INTERACTIONS ── */}
        {tab === 'interactions' && (
          <>
            <div className="flex items-center gap-3 mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search interactions..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
                {(['all', 'message', 'interview', 'feedback'] as const).map(f => (
                  <button key={f} onClick={() => setTypeFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${typeFilter === f ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>{f}</button>
                ))}
              </div>
              <button 
                onClick={() => setShowCompose(true)}
                className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition shadow shadow-blue-200"
                title="New Interaction"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {filteredInteractions.length === 0 && (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                  <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No interactions found.</p>
                </div>
              )}
              {filteredInteractions.map((i: any, idx: number) => {
                const sFirst = i.Student?.first_name ?? i.student_first_name ?? '?';
                const sLast  = i.Student?.last_name  ?? i.student_last_name  ?? '';
                return (
                <div key={i.interaction_id ?? idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className={`w-11 h-11 ${avatarColors[idx % avatarColors.length]} rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0`}>
                    {sFirst[0]}{sLast[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-blue-600 text-sm">{sFirst} {sLast}</p>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${(typeConfig[i.interaction_type] ?? typeConfig.message).cls}`}>
                        {(typeConfig[i.interaction_type] ?? typeConfig.message).label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{i.content}</p>
                    {i.scheduled_at && (
                      <div className="flex items-center gap-1.5 mt-2 bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-lg w-fit font-semibold">
                        <Calendar className="w-3.5 h-3.5" /> {i.scheduled_at}
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {showCompose && (
        <InteractModal 
          students={students}
          onClose={() => setShowCompose(false)} 
          onSuccess={async () => {
            setShowCompose(false);
            const res = await api.get('/employers/interactions');
            setInteractions(res.data ?? []);
          }}
        />
      )}
    </div>
  );
};

const InteractModal: React.FC<{ students: any[], onClose: () => void, onSuccess: () => void }> = ({ students, onClose, onSuccess }) => {
  const [studentId, setStudentId] = useState('');
  const [type, setType] = useState('message');
  const [content, setContent] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!studentId || !content) return;
    setSaving(true);
    try {
      await api.post('/employers/interact', {
        student_id: parseInt(studentId),
        interaction_type: type,
        content,
        scheduled_at: type === 'interview' ? scheduledAt : null,
      });
      onSuccess();
    } catch (e) {
      console.error('Failed to create interaction', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="font-bold text-gray-800 text-lg mb-4">New Interaction</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Select Student</label>
            <select value={studentId} onChange={e => setStudentId(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Choose a student --</option>
              {students.map((s: any) => (
                <option key={s.user_id} value={s.user_id}>{s.first_name} {s.last_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Interaction Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="message">Message</option>
              <option value="interview">Interview</option>
              <option value="feedback">Feedback</option>
            </select>
          </div>

          {type === 'interview' && (
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Interview Date & Time</label>
              <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Message / Details</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={4}
              placeholder="Enter your message or interview details..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={saving || !studentId || !content || (type === 'interview' && !scheduledAt)} 
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
            {saving ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
