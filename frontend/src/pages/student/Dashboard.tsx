import React, { useState, useEffect } from 'react';
import {
  Award, Play, Download,
  MessageSquare, FileText, Loader2
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

// ─── Sub-components ──────────────────────────────────────────────────────────
const StatCard: React.FC<{ label: string; value: string | number; icon: string; color: string; sub?: string }> = ({ label, value, icon, color, sub }) => (
  <div className={`${color} rounded-2xl p-4 text-white shadow-md`}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-2xl">{icon}</span>
      <span className="text-2xl font-bold">{value}</span>
    </div>
    <p className="text-sm font-medium opacity-90">{label}</p>
    {sub && <p className="text-xs opacity-70 mt-0.5">{sub}</p>}
  </div>
);

const ProgressBar: React.FC<{ percent: number; color: string }> = ({ percent, color }) => (
  <div className="w-full bg-gray-100 rounded-full h-2">
    <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${percent}%` }} />
  </div>
);

type Tab = 'overview' | 'modules' | 'quizzes' | 'certificates' | 'messages';

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const getTabFromPath = (path: string): Tab => {
    if (path.includes('overview')) return 'overview';
    if (path.includes('my-courses')) return 'modules';
    if (path.includes('quizzes')) return 'quizzes';
    if (path.includes('certificates')) return 'certificates';
    if (path.includes('messages')) return 'messages';
    return 'overview';
  };

  const tab = getTabFromPath(location.pathname);
  const [modules, setModules] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [activeModuleData, setActiveModuleData] = useState<any>(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [modRes, progRes, certRes, intRes, attRes] = await Promise.all([
        api.get('/modules'),
        api.get('/students/progress'),
        api.get('/students/certificates'),
        api.get('/students/interactions'),
        api.get('/students/attempts')
      ]);
      setModules(modRes.data);
      setProgress(progRes.data);
      setCertificates(certRes.data);
      setInteractions(intRes.data);
      setAttempts(attRes.data || []);
    } catch (err) {
      console.error('Error fetching student data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeModuleId) {
      const offlineCache = localStorage.getItem(`offline_module_${activeModuleId}`);
      api.get(`/modules/${activeModuleId}`).then(res => {
        setActiveModuleData(res.data);
      }).catch(err => {
        if (offlineCache) {
          setActiveModuleData(JSON.parse(offlineCache));
        } else {
          console.error(err);
        }
      });
    }
  }, [activeModuleId]);

  const handleLessonAction = (content: any) => {
    navigate(`/student/learning/${activeModuleId}/${content.content_id}`);
  };

  const enrolledModules = modules.filter(m => progress.some(p => p.module_id === m.module_id));

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center font-bold text-gray-400 flex-col gap-3">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p>Loading your portal...</p>
      </div>
    );
  }

  const getModuleProgress = (moduleId: number) => {
    const p = progress.find(p => p.module_id === moduleId);
    if (!p) return 0;
    return p.status === 'completed' ? 100 : (p.status === 'in_progress' ? 50 : 0);
  };

  const getModuleStatus = (moduleId: number) => {
    const p = progress.find(p => p.module_id === moduleId);
    return p ? p.status : 'not_started';
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Profile Strip */}
      <div className="flex items-center gap-4 bg-white rounded-2xl px-5 py-3 mb-4 shadow-sm border border-gray-100 flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow">
          {user.first_name?.[0]}{user.last_name?.[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-sm">{user.first_name} {user.last_name}</p>
          <p className="text-xs text-gray-400">ID: {user.user_id} · {user.role}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 pb-4 space-y-4">
        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Modules Enrolled" value={enrolledModules.length} icon="📚" color="bg-gradient-to-br from-blue-500 to-blue-700" />
              <StatCard label="Completed" value={progress.filter(p => p.status === 'completed').length} icon="✅" color="bg-gradient-to-br from-green-500 to-emerald-700" />
              <StatCard label="Certificates" value={certificates.length} icon="🏆" color="bg-gradient-to-br from-orange-500 to-amber-600" />
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Learning Progress</h3>
              <div className="space-y-3">
                {enrolledModules.map((m) => {
                  const prog = getModuleProgress(m.module_id);
                  const status = getModuleStatus(m.module_id);
                  return (
                    <div key={m.module_id} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-base flex-shrink-0">
                        📚
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-gray-700 truncate">{m.title}</p>
                          <span className="text-xs text-gray-400 ml-2">{prog}%</span>
                        </div>
                        <ProgressBar percent={prog} color={status === 'completed' ? 'bg-green-500' : 'bg-blue-500'} />
                      </div>
                    </div>
                  );
                })}
                {enrolledModules.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No modules enrolled yet.</p>}
              </div>
            </div>
          </>
        )}

        {tab === 'modules' && (
          <>
            {activeModuleId === null ? (
              <div className="grid grid-cols-2 gap-4">
                {enrolledModules.map((m) => {
                  const status = getModuleStatus(m.module_id);
                  return (
                    <div
                      key={m.module_id}
                      onClick={() => setActiveModuleId(m.module_id)}
                      className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.02] cursor-pointer transition-all flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="font-black text-gray-900 text-sm mb-1 uppercase tracking-tight">{m.title}</h3>
                        <p className="text-[10px] font-bold text-gray-400 mb-3">{m.language} · {m.duration_minutes} min</p>
                      </div>
                      <span className={`text-[10px] w-fit px-3 py-1 rounded-full font-black uppercase tracking-widest ${status === 'completed' ? 'bg-emerald-100 text-emerald-700' : (status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500')}`}>
                        {status.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
                {enrolledModules.length === 0 && (
                  <div className="col-span-2 text-center py-24 bg-white rounded-[40px] border border-dashed border-gray-100">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">You haven't enrolled in any modules yet.</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <button onClick={() => setActiveModuleId(null)} className="flex items-center gap-2 text-blue-600 text-sm font-semibold mb-4 hover:underline">
                  ← Back to My Journey
                </button>
                {activeModuleData && (
                  <>
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-4 text-white relative">
                      <h2 className="font-bold text-lg">{activeModuleData.title}</h2>
                      <p className="text-white/80 text-xs">{activeModuleData.language} · {activeModuleData.duration_minutes} min</p>
                      <button 
                        onClick={async () => {
                          try {
                            const res = await api.get(`/modules/${activeModuleData.module_id}/offline-bundle`);
                            localStorage.setItem(`offline_module_${activeModuleData.module_id}`, JSON.stringify(res.data));
                            alert('Module downloaded directly for offline use!');
                          } catch (err) {
                            console.error('Failed to download module', err);
                          }
                        }}
                        className="absolute right-6 top-6 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" /> Download Offline
                      </button>
                    </div>
                    <div className="space-y-2">
                      {activeModuleData.Contents && activeModuleData.Contents.map((content: any) => {
                        const mStat = progress.find(p => p.module_id === activeModuleId);
                        let comp = mStat?.completed_contents || [];
                        if (typeof comp === 'string') comp = JSON.parse(comp);
                        const isDone = comp.includes(content.content_id);
                        
                        return (
                          <div key={content.content_id} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 hover:shadow-md cursor-pointer group transition-all" onClick={() => handleLessonAction(content)}>
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${isDone ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                              {content.content_type === 'quiz' || content.content_type === 'exam' ? <Award className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{content.title}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase">{content.content_type} · Mastering Skills</p>
                            </div>
                            <div className={`text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest transition-all ${isDone ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-gray-900 text-white'}`}>
                              {isDone ? 'Completed' : 'Study'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {tab === 'quizzes' && (
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h3 className="font-black text-gray-900 uppercase tracking-tight">Recent Assessments</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global learning results</p>
              </div>
              <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Assessment Name</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Completed</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Achieved Mark</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attempts.map((att) => (
                    <tr key={att.attempt_id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-8 py-5">
                         <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{att.Content?.title}</p>
                         <p className="text-[9px] font-bold text-gray-400 uppercase">{att.Content?.content_type}</p>
                      </td>
                      <td className="px-8 py-5 text-[10px] font-bold text-gray-600 uppercase">
                        {new Date(att.completed_at).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest ${att.score >= (att.total_possible ? att.total_possible * 0.7 : 0) ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                           Mark: {att.score}/{att.total_possible || '?' }
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {att.score >= 70 && (
                          <button onClick={() => navigate('/student/certificates')} className="text-[10px] font-bold text-blue-600 uppercase hover:underline">View Cert</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {attempts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-30">
                          <Loader2 className="w-8 h-8 animate-spin" />
                          <p className="text-[10px] font-black uppercase tracking-widest">No results yet</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'certificates' && (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <div key={cert.certificate_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white">
                  <h3 className="font-bold text-lg">{cert.Module?.title || cert.LearningModule?.title}</h3>
                  <p className="text-amber-200 text-sm mt-1">Awarded to: {user.first_name} {user.last_name}</p>
                </div>
                <div className="p-5 flex items-center justify-between">
                  {cert.qr_code ? (
                    <div className="flex items-center gap-4">
                       <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${cert.qr_code}`} alt="QR Code" className="w-12 h-12" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification ID</p>
                          <p className="text-xs font-mono text-gray-600">{cert.qr_code.substring(0, 12)}...</p>
                       </div>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gray-100" />
                  )}
                   <button 
                     onClick={() => navigate(`/student/certificate/${cert.certificate_id}?autoPrint=true`)} 
                     className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                   >
                    <Download className="w-4 h-4" /> View / Download
                  </button>
                </div>
              </div>
            ))}
            {certificates.length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                < Award className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">You haven't earned any certificates yet.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'messages' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-lg uppercase tracking-tight">Active Conversations</h3>
            {interactions.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm italic">No messages yet.</p>
              </div>
            ) : (
              interactions.map((i: any) => {
                const sender = i.Employer || i.Mentor;
                const isMentor = !!i.Mentor;
                return (
                <div key={i.interaction_id} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${isMentor ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                    {sender?.first_name?.[0]}{sender?.last_name?.[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="font-black text-gray-900 text-sm uppercase tracking-tight">{sender?.first_name} {sender?.last_name}</p>
                        <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-black tracking-widest ${isMentor ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                          {isMentor ? 'Mentor Message' : i.interaction_type}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(i.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-3 leading-relaxed">{i.content}</p>
                    {i.scheduled_at && (
                      <div className="mt-4 bg-blue-50/50 text-blue-700 p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        Meeting: {new Date(i.scheduled_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
