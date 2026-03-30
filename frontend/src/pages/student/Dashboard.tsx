import React, { useState, useEffect } from 'react';
import {
  BookOpen, Award, Play, Download,
  MessageSquare, BarChart2, FileText, X, Loader2
} from 'lucide-react';
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
  const [tab, setTab] = useState<Tab>('overview');
  const [modules, setModules] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [activeModuleData, setActiveModuleData] = useState<any>(null);
  
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [modRes, progRes, certRes, intRes] = await Promise.all([
        api.get('/modules'),
        api.get('/students/progress'),
        api.get('/students/certificates'),
        api.get('/students/interactions')
      ]);
      setModules(modRes.data);
      setProgress(progRes.data);
      setCertificates(certRes.data);
      setInteractions(intRes.data);
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

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'modules', label: 'My Modules', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'quizzes', label: 'Quizzes & Exams', icon: <FileText className="w-4 h-4" /> },
    { id: 'certificates', label: 'Certificates', icon: <Award className="w-4 h-4" /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  const handleStartModule = async (moduleId: number) => {
    try {
      await api.post('/students/start-module', { module_id: moduleId });
      setActiveModuleId(moduleId);
      fetchData();
    } catch (err) {
      console.error('Error starting module', err);
    }
  };

  const handleLessonAction = (content: any) => {
    setSelectedContent(content);
    if (content.content_type === 'exam' || content.content_type === 'quiz') {
      setQuizOpen(true);
      setQuizStep(0);
      setQuizAnswers({});
      setQuizSubmitted(false);
    } else {
      setNotesOpen(true);
    }
  };

  const handleQuizSubmit = async () => {
    try {
      const formattedAnswers: Record<number, string> = {};
      Object.keys(quizAnswers).forEach(stepIdx => {
        const questionId = selectedContent.Questions[+stepIdx].question_id;
        formattedAnswers[questionId] = quizAnswers[+stepIdx];
      });

      const res = await api.post('/students/submit-attempt', {
        content_id: selectedContent.content_id,
        answers: formattedAnswers,
      });
      setQuizResult(res.data);
      setQuizSubmitted(true);
      fetchData();
    } catch (err) {
      console.error('Error submitting quiz', err);
    }
  };

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

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 mb-4 shadow-sm border border-gray-100 flex-shrink-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              if (t.id !== 'modules') setActiveModuleId(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
              tab === t.id ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 pb-4 space-y-4">
        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Modules Enrolled" value={modules.length} icon="📚" color="bg-gradient-to-br from-blue-500 to-blue-700" />
              <StatCard label="Completed" value={progress.filter(p => p.status === 'completed').length} icon="✅" color="bg-gradient-to-br from-green-500 to-emerald-700" />
              <StatCard label="Certificates" value={certificates.length} icon="🏆" color="bg-gradient-to-br from-orange-500 to-amber-600" />
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Learning Progress</h3>
              <div className="space-y-3">
                {modules.map((m) => {
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
                {modules.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No modules available.</p>}
              </div>
            </div>
          </>
        )}

        {tab === 'modules' && (
          <>
            {activeModuleId === null ? (
              <div className="grid grid-cols-2 gap-4">
                {modules.map((m) => {
                  const status = getModuleStatus(m.module_id);
                  return (
                    <div
                      key={m.module_id}
                      onClick={() => handleStartModule(m.module_id)}
                      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition-all"
                    >
                      <h3 className="font-bold text-gray-800 text-sm mb-1">{m.title}</h3>
                      <p className="text-xs text-gray-400 mb-3">{m.language} · {m.duration_minutes} min</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${status === 'completed' ? 'bg-green-100 text-green-700' : (status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500')}`}>
                        {status.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <button onClick={() => setActiveModuleId(null)} className="flex items-center gap-2 text-blue-600 text-sm font-semibold mb-4 hover:underline">
                  ← Back to Modules
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
                      {activeModuleData.Contents && activeModuleData.Contents.map((content: any) => (
                        <div key={content.content_id} className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 hover:shadow cursor-pointer" onClick={() => handleLessonAction(content)}>
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            {content.content_type === 'quiz' || content.content_type === 'exam' ? <FileText className="w-4 h-4 text-orange-500" /> : <Play className="w-4 h-4 text-blue-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">{content.title}</p>
                            <p className="text-xs text-gray-400 capitalize">{content.content_type}</p>
                          </div>
                          <button className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition">Start</button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {tab === 'certificates' && (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <div key={cert.certificate_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white">
                  <h3 className="font-bold text-lg">{cert.LearningModule?.title}</h3>
                  <p className="text-amber-200 text-sm mt-1">Awarded to: {user.first_name} {user.last_name}</p>
                </div>
                <div className="p-5 flex items-center justify-between">
                  {cert.qr_code ? (
                    <img src={cert.qr_code} alt="QR Code" className="w-20 h-20" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100" />
                  )}
                  <a href={cert.qr_code} download={`Certificate_${cert.certificate_id}.png`} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                    <Download className="w-4 h-4" /> Download
                  </a>
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
            <h3 className="font-bold text-gray-800 text-lg">Employer Messages & Interactions</h3>
            {interactions.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No messages yet.</p>
              </div>
            ) : (
              interactions.map((i: any) => (
                <div key={i.interaction_id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {i.Employer?.first_name?.[0]}{i.Employer?.last_name?.[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{i.Employer?.first_name} {i.Employer?.last_name}</p>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase font-bold">{i.interaction_type}</span>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(i.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">{i.content}</p>
                    {i.scheduled_at && (
                      <div className="mt-3 bg-blue-50 text-blue-700 p-2 rounded-lg text-xs font-semibold">
                        Scheduled Time: {new Date(i.scheduled_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {quizOpen && selectedContent && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            {!quizSubmitted ? (
              <>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800">{selectedContent.title}</h3>
                    <button onClick={() => setQuizOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                {selectedContent.Questions && selectedContent.Questions[quizStep] && (
                  <>
                    <p className="text-sm font-semibold text-gray-800 mb-4">{selectedContent.Questions[quizStep].question_text}</p>
                    <div className="space-y-2 mb-6">
                      {selectedContent.Questions[quizStep].options.map((opt: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => setQuizAnswers(a => ({ ...a, [quizStep]: opt }))}
                          className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${quizAnswers[quizStep] === opt ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold' : 'border-gray-200 hover:border-blue-300'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      {quizStep < selectedContent.Questions.length - 1
                        ? <button onClick={() => setQuizStep(s => s + 1)} className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-semibold">Next</button>
                        : <button onClick={handleQuizSubmit} className="flex-1 bg-green-600 text-white py-2 rounded-xl text-sm font-semibold">Submit Quiz</button>
                      }
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <h3 className="font-bold text-gray-800 text-lg mb-1">Quiz Completed!</h3>
                <p className="text-3xl font-bold text-blue-600 mb-4">{quizResult?.score} / {quizResult?.totalPossible}</p>
                <button onClick={() => { setQuizOpen(false); setQuizSubmitted(false); }} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold">Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {notesOpen && selectedContent && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">{selectedContent.title}</h3>
                <button onClick={() => setNotesOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="prose prose-blue max-w-none mb-6 text-gray-600 text-sm overflow-y-auto max-h-[60vh]">
              {selectedContent.content_data}
            </div>
            <div className="flex justify-end">
                <button onClick={() => setNotesOpen(false)} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">Finish Reading</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
