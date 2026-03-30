import React, { useEffect, useState, useRef } from 'react';
import { 
  Plus, Edit, Trash2, BookOpen, Loader2, X, 
  ChevronDown, ChevronUp, Save, Bold, Type, 
  Image as ImageIcon, List, Settings, CheckCircle, Info,
  PlusCircle, Trash
} from 'lucide-react';
import api from '../../utils/api';

// ─── Question Manager Modal ──────────────────────────────────────────────────
const QuestionManager: React.FC<{ content: any; onClose: () => void }> = ({ content, onClose }) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [qForm, setQForm] = useState({
    question_text: '',
    question_type: 'MCQ',
    options: ['', '', '', ''],
    correct_answer: '',
    marks: '1'
  });

  const loadQuestions = async () => {
    try {
      const res = await api.get(`/modules/content/${content.content_id}`);
      setQuestions(res.data.Questions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadQuestions(); }, []);

  const handleSaveQuestion = async () => {
    setSaving(true);
    try {
      const payload = {
        content_id: content.content_id,
        question_text: qForm.question_text,
        question_type: qForm.question_type,
        options: qForm.question_type === 'TF' ? ['True', 'False'] : qForm.options.filter(o => o.trim()),
        correct_answer: qForm.correct_answer,
        marks: Number(qForm.marks) || 1
      };
      await api.post('/modules/question/add', payload);
      setQForm({ question_text: '', question_type: 'MCQ', options: ['', '', '', ''], correct_answer: '', marks: '1' });
      setShowForm(false);
      loadQuestions();
    } catch (e) {
      console.error(e);
      alert('Error saving question. Ensure all fields are filled.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.delete(`/modules/question/${id}`);
      loadQuestions();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="font-black text-gray-900 text-xl flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" /> Question Builder
            </h3>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-tight mt-1">{content.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
          ) : (
            <>
              {questions.length === 0 && !showForm && (
                <div className="text-center py-16 bg-blue-50/30 rounded-3xl border border-dashed border-blue-100">
                  <PlusCircle className="w-10 h-10 text-blue-200 mx-auto mb-3" />
                  <p className="text-blue-400 font-bold text-sm">No questions added yet</p>
                  <button onClick={() => setShowForm(true)} className="mt-4 text-blue-600 font-black text-xs uppercase hover:underline">Start Building</button>
                </div>
              )}

              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={q.question_id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm group hover:border-blue-200 transition-all">
                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0">{idx + 1}</span>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 text-sm mb-3">{q.question_text}</p>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {q.options && (typeof q.options === 'string' ? JSON.parse(q.options) : q.options).map((opt: string) => (
                            <div key={opt} className={`px-3 py-2 rounded-xl text-xs flex items-center gap-2 ${opt === q.correct_answer ? 'bg-green-50 text-green-700 font-bold border border-green-100' : 'bg-gray-50 text-gray-500'}`}>
                              {opt === q.correct_answer && <CheckCircle className="w-3 h-3" />} {opt}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-gray-400">
                           <span>TYPE: {q.question_type}</span>
                           <span>MARKS: {q.marks}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteQuestion(q.question_id)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {showForm && (
                <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h4 className="font-black text-blue-800 text-sm uppercase mb-6 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Question
                  </h4>
                  <div className="space-y-5">
                    <div>
                      <label className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-2 block">Question Content</label>
                      <textarea 
                        value={qForm.question_text}
                        onChange={e => setQForm({...qForm, question_text: e.target.value})}
                        className="w-full border border-blue-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all h-24 resize-none"
                        placeholder="Type your question here..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-2 block">Type</label>
                          <select 
                            value={qForm.question_type}
                            onChange={e => setQForm({...qForm, question_type: e.target.value, correct_answer: ''})}
                            className="w-full border border-blue-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none bg-white"
                          >
                            <option value="MCQ">Multiple Choice</option>
                            <option value="TF">True / False</option>
                          </select>
                       </div>
                       <div>
                          <label className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-2 block">Marks</label>
                          <input 
                            type="number"
                            value={qForm.marks}
                            onChange={e => setQForm({...qForm, marks: e.target.value})}
                            className="w-full border border-blue-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none"
                          />
                       </div>
                    </div>

                    {qForm.question_type === 'MCQ' ? (
                      <div className="space-y-3">
                        <label className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-2 block">Options & Correct Answer</label>
                        {qForm.options.map((opt, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <input 
                              type="radio" 
                              name="correct" 
                              checked={qForm.correct_answer === opt && opt !== ''}
                              onChange={() => setQForm({...qForm, correct_answer: opt})}
                              className="w-4 h-4 accent-blue-600 cursor-pointer"
                            />
                            <input 
                              value={opt}
                              onChange={e => {
                                const newOpts = [...qForm.options];
                                newOpts[i] = e.target.value;
                                setQForm({...qForm, options: newOpts});
                              }}
                              placeholder={`Option ${i+1}`}
                              className="flex-1 border border-blue-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-blue-400"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                         <label className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-2 block">Select Correct Answer</label>
                         <div className="flex gap-3">
                            {['True', 'False'].map(val => (
                              <button 
                                key={val}
                                onClick={() => setQForm({...qForm, correct_answer: val})}
                                className={`flex-1 py-3 rounded-2xl font-black text-sm transition-all ${qForm.correct_answer === val ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'}`}
                              >
                                {val}
                              </button>
                            ))}
                         </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button onClick={() => setShowForm(false)} className="flex-1 bg-white text-gray-500 py-3.5 rounded-2xl font-bold text-xs uppercase transition-all">Cancel</button>
                      <button 
                        onClick={handleSaveQuestion}
                        disabled={saving || !qForm.question_text.trim() || !qForm.correct_answer}
                        className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-bold text-xs uppercase hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Question
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {!showForm && (
          <div className="p-8 border-t border-gray-100 bg-white">
            <button onClick={() => setShowForm(true)} className="w-full bg-blue-600 text-white py-4 rounded-3xl font-black text-sm uppercase flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
              <PlusCircle className="w-5 h-5" /> Add New Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Simple Rich Text Editor Component ────────────────────────────────────────
const RichTextEditor: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const exec = (cmd: string, val: string = '') => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = `<img src="${ev.target?.result}" class="max-w-full rounded-xl my-2 shadow-sm" />`;
        exec('insertHTML', img);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all">
      <div className="bg-gray-50 border-b border-gray-100 p-2 flex flex-wrap gap-1">
        <button onClick={() => exec('bold')} className="p-1.5 hover:bg-white rounded transition text-gray-600 hover:text-blue-600" title="Bold"><Bold className="w-4 h-4" /></button>
        <button onClick={() => exec('italic')} className="p-1.5 hover:bg-white rounded transition text-gray-600 hover:text-blue-600 font-italic italic" title="Italic"><i>I</i></button>
        <button onClick={() => exec('underline')} className="p-1.5 hover:bg-white rounded transition text-gray-600 hover:text-blue-600 underline" title="Underline"><u>U</u></button>
        <div className="w-[1px] h-4 bg-gray-200 mx-1 self-center" />
        <button onClick={() => {
          const color = window.prompt('Enter color (hex or name):', '#2563eb');
          if (color) exec('foreColor', color);
        }} className="p-1.5 hover:bg-white rounded transition text-gray-600 hover:text-blue-600" title="Text Color"><Type className="w-4 h-4" /></button>
        <div className="w-[1px] h-4 bg-gray-200 mx-1 self-center" />
        <button onClick={() => exec('insertUnorderedList')} className="p-1.5 hover:bg-white rounded transition text-gray-600 hover:text-blue-600" title="Bullet List"><List className="w-4 h-4" /></button>
        <label className="p-1.5 hover:bg-white rounded transition text-gray-600 hover:text-blue-600 cursor-pointer" title="Insert Image">
          <ImageIcon className="w-4 h-4" />
          <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
        </label>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto outline-none text-sm leading-relaxed text-gray-800 prose prose-sm max-w-none"
      />
    </div>
  );
};

const AdminModules: React.FC = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', language: 'English', duration_minutes: '', image_url: '' });
  
  const [editingModule, setEditingModule] = useState<any>(null);
  
  const [showContentForm, setShowContentForm] = useState<number | null>(null);
  const [contentForm, setContentForm] = useState({ title: '', content_type: 'note', content_data: '', order_index: '1' });

  const [managingQuestions, setManagingQuestions] = useState<any>(null);

  const loadModules = async () => {
    try {
      const res = await api.get('/modules');
      setModules(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadModules(); }, []);

  const handleSaveModule = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        language: form.language,
        duration_minutes: Number(form.duration_minutes) || null,
        image_url: form.image_url,
      };
      
      if (editingModule) {
        await api.put(`/modules/${editingModule.module_id}`, payload);
      } else {
        await api.post('/modules', payload);
      }
      
      setForm({ title: '', language: 'English', duration_minutes: '', image_url: '' });
      setShowForm(false);
      setEditingModule(null);
      loadModules();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModule = async (id: number) => {
    if (!window.confirm('Delete this module and all its content?')) return;
    try {
      await api.delete(`/modules/${id}`);
      loadModules();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveContent = async () => {
    if (!contentForm.title.trim() || !showContentForm) return;
    setSaving(true);
    try {
      await api.post(`/modules/content/add`, {
        module_id: showContentForm,
        title: contentForm.title,
        content_type: contentForm.content_type,
        content_data: contentForm.content_data,
        order_index: Number(contentForm.order_index) || 1,
      });
      setContentForm({ title: '', content_type: 'note', content_data: '', order_index: '1' });
      setShowContentForm(null);
      loadModules();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContent = async (moduleId: number, contentId: number) => {
    if (!window.confirm('Delete this content item?')) return;
    try {
      await api.delete(`/modules/${moduleId}/content/${contentId}`);
      loadModules();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="h-full overflow-y-auto pr-1 pb-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => { setEditingModule(null); setForm({ title: '', language: 'English', duration_minutes: '', image_url: '' }); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow"
        >
          <Plus className="w-4 h-4" /> New Module
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white hover:shadow-lg transition">
          <p className="text-3xl font-black">{modules.length}</p>
          <p className="text-[10px] uppercase font-bold opacity-80 tracking-widest mt-1">Total Modules</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-4 text-white hover:shadow-lg transition">
          <p className="text-3xl font-black">{modules.reduce((a, m) => a + (m.Contents?.length ?? 0), 0)}</p>
          <p className="text-[10px] uppercase font-bold opacity-80 tracking-widest mt-1">Total Content Items</p>
        </div>
      </div>

      {/* Module list */}
      <div className="space-y-2">
        {modules.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
            <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm font-medium">No modules yet. Create your first module.</p>
          </div>
        )}
        {modules.map((m: any) => (
          <div key={m.module_id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
            <div
              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => setExpanded(expanded === m.module_id ? null : m.module_id)}
            >
              <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm">{m.title}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{m.language} · {m.duration_minutes ?? '—'} MIN · {m.Contents?.length ?? 0} ITEMS</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button className="p-1.5 rounded-lg hover:bg-blue-50 transition" onClick={e => { e.stopPropagation(); setEditingModule(m); setForm({ title: m.title, language: m.language, duration_minutes: m.duration_minutes?.toString() || '', image_url: m.image_url || '' }); setShowForm(true); }}>
                  <Edit className="w-3.5 h-3.5 text-blue-500" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-red-50 transition" onClick={e => { e.stopPropagation(); handleDeleteModule(m.module_id); }}>
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
                {expanded === m.module_id
                  ? <ChevronUp className="w-4 h-4 text-gray-300" />
                  : <ChevronDown className="w-4 h-4 text-gray-300" />
                }
              </div>
            </div>
            {expanded === m.module_id && (
              <div className="border-t border-gray-50 px-4 pb-4 pt-2 bg-gray-50/30">
                {(!m.Contents || m.Contents.length === 0) && (
                  <p className="text-xs text-gray-400 py-4 text-center italic">No content items in this module yet.</p>
                )}
                <div className="space-y-1">
                  {m.Contents?.sort((a: any, b: any) => a.order_index - b.order_index).map((c: any) => (
                    <div key={c.content_id} className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0 hover:bg-white px-3 rounded-xl transition group shadow-sm bg-white/50">
                      <span className="text-[10px] font-black text-blue-600 w-4">{c.order_index}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                        c.content_type === 'quiz' ? 'bg-green-100 text-green-700'
                        : c.content_type === 'exam' ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                      }`}>{c.content_type}</span>
                      <p className="text-xs font-semibold text-gray-700 flex-1 truncate">{c.title}</p>
                      
                      <div className="flex items-center gap-1">
                        {(c.content_type === 'quiz' || c.content_type === 'exam') && (
                          <button 
                            onClick={() => setManagingQuestions(c)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                            title="Manage Questions"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => handleDeleteContent(m.module_id, c.content_id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center">
                  <button onClick={() => { setContentForm({ ...contentForm, order_index: String((m.Contents?.length || 0) + 1) }); setShowContentForm(m.module_id); }} className="bg-white border border-gray-200 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-50 transition flex items-center gap-2 shadow-sm">
                    <Plus className="w-3.5 h-3.5" /> Add New Lesson/Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Module Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
            <div className="mb-6">
              <h3 className="font-black text-gray-900 text-xl">{editingModule ? 'Edit Module' : 'New Module'}</h3>
              <p className="text-gray-400 text-xs font-medium">Configure basic module parameters</p>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 block">Module Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Introduction to Leadership"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 block">Module Branding Image (URL)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <ImageIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={form.image_url}
                    onChange={e => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                  />
                </div>
                <p className="text-[9px] text-gray-400 font-bold uppercase mt-2 pl-1">Provide a high-quality landscape image URL</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 block">Language</label>
                  <select
                    value={form.language}
                    onChange={e => setForm({ ...form, language: e.target.value })}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all bg-white"
                  >
                    <option>English</option>
                    <option>Kinyarwanda</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 block">Duration</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.duration_minutes}
                      onChange={e => setForm({ ...form, duration_minutes: e.target.value })}
                      placeholder="Min"
                      className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">MIN</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-50 text-gray-600 py-3.5 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all">Cancel</button>
                <button
                  onClick={handleSaveModule}
                  disabled={saving || !form.title.trim()}
                  className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Processing...' : editingModule ? 'Save' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Content Modal */}
      {showContentForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl p-8 relative">
            <button onClick={() => setShowContentForm(null)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
            <div className="mb-6">
              <h3 className="font-black text-gray-900 text-xl">Prepare Course Content</h3>
              <p className="text-gray-400 text-xs font-medium">Create rich-text lessons, quizzes, or exams</p>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 block">Content Title</label>
                <input
                  type="text"
                  value={contentForm.title}
                  onChange={e => setContentForm({ ...contentForm, title: e.target.value })}
                  placeholder="e.g. Chapter 1: The Foundations"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 block">Content Type</label>
                  <select
                    value={contentForm.content_type}
                    onChange={e => setContentForm({ ...contentForm, content_type: e.target.value })}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all bg-white"
                  >
                    <option value="note">📖 Rich Text Lesson (Note)</option>
                    <option value="quiz">📝 Interactive Quiz</option>
                    <option value="exam">🏆 Final Module Exam</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 block">Sequence Order</label>
                  <input
                    type="number"
                    value={contentForm.order_index}
                    onChange={e => setContentForm({ ...contentForm, order_index: e.target.value })}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 block">
                   {contentForm.content_type === 'note' ? 'Lesson Content (Rich Text)' : 'Instructions & Rules'}
                </label>
                <div className="bg-blue-50/30 p-2 rounded-xl mb-2 flex items-center gap-2 text-[10px] text-blue-600 font-bold uppercase">
                  <Info className="w-3 h-3" />
                  {contentForm.content_type === 'note' ? 'Write your lesson content below.' : 'Define the rules for this interactive section. You will add specific questions after saving this.'}
                </div>
                {contentForm.content_type === 'note' ? (
                  <RichTextEditor 
                    value={contentForm.content_data} 
                    onChange={v => setContentForm({ ...contentForm, content_data: v })} 
                  />
                ) : (
                  <textarea
                    value={contentForm.content_data}
                    onChange={e => setContentForm({ ...contentForm, content_data: e.target.value })}
                    placeholder="Enter interactive elements instructions or quiz rules..."
                    rows={4}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all resize-none"
                  />
                )}
              </div>
              
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowContentForm(null)} className="flex-1 bg-gray-50 text-gray-600 py-3.5 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all">Cancel</button>
                <button
                  onClick={handleSaveContent}
                  disabled={saving || !contentForm.title.trim() || !contentForm.content_data.trim()}
                  className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Add Content'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Managing Questions Modal */}
      {managingQuestions && (
        <QuestionManager 
          content={managingQuestions} 
          onClose={() => { setManagingQuestions(null); loadModules(); }} 
        />
      )}
    </div>
  );
};

export default AdminModules;
