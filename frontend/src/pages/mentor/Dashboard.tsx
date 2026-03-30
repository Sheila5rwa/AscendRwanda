import React, { useState, useEffect, useRef } from 'react';
import {
  Users, AlertTriangle, CheckCircle, MessageSquare,
  X, Save, Edit3, Send, Search, Loader2, Calendar,
  MoreHorizontal, User, History
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import api from '../../utils/api';

const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-400', 'bg-pink-500'];

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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        {!saved ? (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-800">{studentName}</h3>
                <p className="text-xs text-gray-400">Enrolled Student</p>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Course Progress</label>
                <span className="text-xs font-bold text-blue-600">{sysProg}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${sysProg}%` }} />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Mentor Observations & Feedback</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={4}
                className="w-full border border-gray-200 rounded-2xl p-4 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all resize-none"
                placeholder="Share your thoughts on student progress..."
              />
            </div>
            <div className="flex items-start gap-3 mb-6 bg-red-50 p-4 rounded-2xl border border-red-100">
              <button
                onClick={() => setFlagged(!flagged)}
                className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${flagged ? 'bg-red-600 text-white' : 'bg-white border border-red-200 text-red-600'}`}
              >
                <AlertTriangle className="w-3 h-3" />
              </button>
              <div>
                 <p className="text-xs font-bold text-red-900">Flag for Support</p>
                 <p className="text-[10px] text-red-700/70 leading-relaxed uppercase tracking-tighter font-medium">Mark this student if they need priority pedagogical or emotional support.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 bg-gray-50 text-gray-600 py-3 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all">Cancel</button>
              <button disabled={saving} onClick={handleSave} className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? 'Saving...' : 'Update Record'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="font-black text-gray-900 text-lg mb-1">Record Synchronized</h3>
            <p className="text-sm text-gray-400 mb-6 font-medium">Progress notes and flags saved successfully.</p>
            <button onClick={onClose} className="w-full bg-blue-600 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100">Done</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'students' | 'messages';

const MentorDashboard: React.FC = () => {
  const location = useLocation();
  const pathPart = location.pathname.split('/').pop();
  const tab: Tab = (pathPart === 'students' || pathPart === 'messages') ? pathPart : 'overview';
  
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filterFlagged, setFilterFlagged] = useState(false);
  
  const [msgText, setMsgText] = useState('');
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/mentors/students');
      setStudentsList(res.data);
      if (res.data.length > 0 && !activeChatId) {
        setActiveChatId(res.data[0].student_id);
      }
    } catch (e) {
      console.error('Failed to load mentor students', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    if (!activeChatId) return;
    try {
      const res = await api.get(`/students/interactions?student_id=${activeChatId}`);
      setChatMessages(res.data || []);
    } catch (e) {
      console.error('Failed to load chat history', e);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchChatHistory();
    const interval = setInterval(fetchChatHistory, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [activeChatId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!msgText.trim() || !activeChatId) return;
    setIsSending(true);
    try {
      await api.post('/mentors/message', { student_id: activeChatId, content: msgText });
      setMsgText('');
      fetchChatHistory();
    } catch (e) {
       console.error('Failed to send message', e);
    } finally {
      setIsSending(false);
    }
  };

  const filteredStudents = studentsList.filter(s => {
    const name = `${s.Student?.first_name} ${s.Student?.last_name}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const matchFlag = filterFlagged ? s.flagged : true;
    return matchSearch && matchFlag;
  });

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  const activeStudent = studentsList.find(s => s.student_id === activeChatId);

  return (
    <div className="h-full flex flex-col overflow-hidden">
        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="overflow-y-auto space-y-5 pb-8 pr-1">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Assigned Students', value: studentsList.length, icon: '👥', color: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
                { label: 'Flagged Learners', value: studentsList.filter(s => s.flagged).length, icon: '🚩', color: 'bg-gradient-to-br from-red-500 to-rose-600' },
                { label: 'Avg Progress', value: studentsList.length > 0 ? (studentsList.reduce((acc, s) => acc + toPercent(s.Student?.Progresses?.[0]?.completed_content || 0, s.Student?.Progresses?.[0]?.Module?.Contents?.length || 1), 0) / studentsList.length).toFixed(0) + '%' : '0%', icon: '📈', color: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
              ].map(stat => (
                <div key={stat.label} className={`${stat.color} rounded-3xl p-6 text-white shadow-xl shadow-gray-100 flex flex-col justify-between h-32 hover:scale-[1.02] transition-transform`}>
                   <p className="text-[10px] text-white/70 font-black uppercase tracking-widest">{stat.label}</p>
                   <div className="flex items-end justify-between">
                     <span className="text-3xl font-black">{stat.value}</span>
                     <span className="text-3xl opacity-30">{stat.icon}</span>
                   </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-black text-gray-900 text-lg flex items-center gap-2 underline decoration-red-500 decoration-4 underline-offset-4">Critical Interventions</h3>
                  <p className="text-gray-400 text-xs font-semibold mt-1">Students flagged for urgent support</p>
                </div>
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                   <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                {studentsList.filter(s => s.flagged).length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mb-2" />
                    <p className="text-gray-500 font-bold text-sm">Clear Horizon</p>
                    <p className="text-xs">No flagged learners at this moment.</p>
                  </div>
                )}
                {studentsList.filter(s => s.flagged).map((s, i) => (
                  <div key={s.mentorship_id} className="flex items-center gap-4 p-4 bg-red-50/50 rounded-2xl hover:bg-red-50 transition border border-transparent hover:border-red-100 group">
                    <div className="w-12 h-12 bg-white p-1 rounded-2xl shadow-sm">
                      <div className={`w-full h-full ${avatarColors[i % avatarColors.length]} rounded-xl flex items-center justify-center text-white text-xs font-black`}>
                        {`${s.Student?.first_name?.[0] || ''}${s.Student?.last_name?.[0] || ''}`.toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-gray-800">{s.Student?.first_name} {s.Student?.last_name}</p>
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">Priority Level: High</p>
                    </div>
                    <button onClick={() => setSelectedStudent(s)} className="bg-white text-red-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm">Review</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STUDENTS ── */}
        {tab === 'students' && (
          <div className="flex-1 flex flex-col overflow-hidden pb-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assigned students..." className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-sm" />
              </div>
              <button
                onClick={() => setFilterFlagged(!filterFlagged)}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${filterFlagged ? 'bg-red-600 text-white shadow-xl shadow-red-100' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50 shadow-sm'}`}
              >
                <AlertTriangle className="w-4 h-4" /> {filterFlagged ? 'Show All' : 'Urgent Only'}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
              {filteredStudents.length === 0 && (
                <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-gray-100">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No students available</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {filteredStudents.map((s, i) => {
                  const totalComp = s.Student?.Progresses?.reduce((a: number, c: any) => a + (c.completed_content||0), 0) || 0;
                  const totalMod = s.Student?.Progresses?.reduce((acc: number, cur: any) => acc + (cur.Module?.Contents?.length || 0), 0) || 1;
                  const prog = toPercent(totalComp, totalMod);
                  
                  return (
                  <div key={s.mentorship_id} className={`bg-white rounded-[32px] p-6 shadow-sm border transition-all hover:shadow-xl group relative overflow-hidden ${s.flagged ? 'border-red-100' : 'border-gray-50'}`}>
                    {s.flagged && <div className="absolute top-0 right-0 w-16 h-16 bg-red-500 rounded-bl-[40px] flex items-center justify-end p-3 text-white"><AlertTriangle className="w-5 h-5 mb-2 ml-2" /></div>}
                    
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 ${avatarColors[i % avatarColors.length]} rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-gray-100`}>
                        {`${s.Student?.first_name?.[0] || ''}${s.Student?.last_name?.[0] || ''}`.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-gray-900 text-sm truncate uppercase tracking-tight">{s.Student?.first_name} {s.Student?.last_name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Class of 2026 · {s.Student?.role}</p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                       <div>
                          <div className="flex justify-between mb-1.5">
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Mastery</span>
                             <span className="text-[10px] font-black text-blue-600 tracking-widest">{prog}%</span>
                          </div>
                          <div className="h-2 bg-gray-50 rounded-full overflow-hidden p-0.5">
                             <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${prog}%` }} />
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-2">
                       <button onClick={() => setSelectedStudent(s)} className="flex-1 bg-gray-800 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2">
                         <Edit3 className="w-3.5 h-3.5" /> Insights
                       </button>
                       <button onClick={() => {setActiveChatId(s.student_id); window.location.hash = 'messages';}} className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                         <MessageSquare className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── MESSAGES (Dual Pane Layout) ── */}
        {tab === 'messages' && (
          <div className="flex-1 flex gap-6 overflow-hidden pb-4">
            {/* List Pane */}
            <div className="w-[320px] flex flex-col bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 border-b border-gray-50">
                  <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest mb-4">Learners</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter..." className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-xs font-bold focus:outline-none" />
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                  {studentsList.map((s, i) => (
                    <button 
                      key={s.student_id} 
                      onClick={() => setActiveChatId(s.student_id)}
                      className={`w-full flex items-center gap-3 p-4 transition-all relative ${activeChatId === s.student_id ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                    >
                      {activeChatId === s.student_id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />}
                      <div className={`w-10 h-10 ${avatarColors[i % avatarColors.length]} rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-sm`}>
                        {`${s.Student?.first_name?.[0] || ''}${s.Student?.last_name?.[0] || ''}`.toUpperCase()}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className={`text-xs font-black truncate uppercase tracking-tight ${activeChatId === s.student_id ? 'text-blue-600' : 'text-gray-800'}`}>
                          {s.Student?.first_name} {s.Student?.last_name}
                        </p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase truncate">Student ID: {s.student_id}</p>
                      </div>
                      {s.flagged && <AlertTriangle className="w-3 h-3 text-red-500" />}
                    </button>
                  ))}
               </div>
            </div>

            {/* Conversation Pane */}
            <div className="flex-1 flex flex-col bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden relative">
               {!activeStudent ? (
                 <div className="flex-1 flex items-center justify-center text-center p-12 opacity-30">
                    <div>
                      <MessageSquare className="w-16 h-16 mx-auto mb-4" />
                      <p className="font-black uppercase tracking-widest text-xs">Select a learner to start chatting</p>
                    </div>
                 </div>
               ) : (
                 <>
                   {/* Chat Header */}
                   <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white z-10">
                      <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 ${avatarColors[activeChatId! % avatarColors.length]} rounded-xl flex items-center justify-center text-white text-[10px] font-black`}>
                           {`${activeStudent.Student?.first_name?.[0] || ''}${activeStudent.Student?.last_name?.[0] || ''}`.toUpperCase()}
                         </div>
                         <div>
                            <h4 className="font-black text-gray-900 text-sm uppercase tracking-tight">{activeStudent.Student?.first_name} {activeStudent.Student?.last_name}</h4>
                            <div className="flex items-center gap-2">
                               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                               <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Connected</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <button className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors"><Calendar className="w-4 h-4 text-gray-400" /></button>
                         <button className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors"><History className="w-4 h-4 text-gray-400" /></button>
                         <button className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors"><MoreHorizontal className="w-4 h-4 text-gray-400" /></button>
                      </div>
                   </div>

                   {/* Chat History */}
                   <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/20 custom-scrollbar">
                      {chatMessages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                           <p className="text-xs font-black uppercase tracking-widest">No conversation history</p>
                        </div>
                      )}
                      
                      {[...chatMessages].reverse().map((msg: any) => {
                         const isMe = !!msg.mentor_id; // If mentor_id exists, mentor sent it
                         return (
                           <div key={msg.interaction_id} className={`flex items-start gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                              <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold ${isMe ? 'bg-blue-600' : 'bg-gray-400'}`}>
                                 {isMe ? 'ME' : 'ST'}
                              </div>
                              <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : ''}`}>
                                 <div className={`p-4 rounded-2xl shadow-sm border ${isMe ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none' : 'bg-white text-gray-700 border-gray-100 rounded-tl-none'}`}>
                                    <p className="text-xs font-semibold leading-relaxed">{msg.content}</p>
                                 </div>
                                 <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase block px-1">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </span>
                              </div>
                           </div>
                         );
                      })}
                      <div ref={chatEndRef} />
                   </div>

                   {/* Footer / Input */}
                   <div className="p-6 bg-white border-t border-gray-50">
                      <div className="relative group">
                         <textarea 
                           value={msgText}
                           onChange={e => setMsgText(e.target.value)}
                           rows={2}
                           placeholder="Type pedagogical feedback or message..."
                           className="w-full bg-gray-50 border border-transparent rounded-3xl pl-6 pr-16 py-4 text-sm font-semibold focus:outline-none focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 transition-all resize-none shadow-inner"
                         />
                         <button 
                           onClick={handleSendMessage}
                           disabled={!msgText.trim() || isSending}
                           className="absolute right-3 bottom-4 w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center transition-all hover:bg-blue-700 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:scale-100 shadow-lg shadow-blue-100"
                         >
                            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                         </button>
                      </div>
                      <div className="flex items-center gap-4 mt-3 pl-2">
                         <div className="flex items-center gap-1.5 cursor-pointer">
                            <span className="w-2 h-2 bg-blue-600 rounded-full" />
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600">Learning Feedback</span>
                         </div>
                         <div className="flex items-center gap-1.5 cursor-pointer">
                            <span className="w-2 h-2 bg-orange-500 rounded-full" />
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-orange-500">Career Support</span>
                         </div>
                      </div>
                   </div>
                 </>
               )}
            </div>
          </div>
        )}
        
        {selectedStudent && <StudentNoteModal student={selectedStudent} onClose={() => setSelectedStudent(null)} onRefresh={fetchStudents} />}
    </div>
  );
};

export default MentorDashboard;
