import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, BookOpen, Loader2, X, ChevronDown, ChevronUp, Save } from 'lucide-react';
import api from '../../utils/api';

const AdminModules: React.FC = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', language: 'English', duration_minutes: '' });
  
  const [editingModule, setEditingModule] = useState<any>(null);
  
  const [showContentForm, setShowContentForm] = useState<number | null>(null);
  const [contentForm, setContentForm] = useState({ title: '', content_type: 'note', content_data: '', order_index: '1' });

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
      };
      
      if (editingModule) {
        await api.put(`/modules/${editingModule.module_id}`, payload);
      } else {
        await api.post('/modules', payload);
      }
      
      setForm({ title: '', language: 'English', duration_minutes: '' });
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
      await api.post(`/modules/${showContentForm}/content`, {
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
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Learning Modules</h2>
          <p className="text-gray-500 text-sm">Manage all training modules</p>
        </div>
        <button
          onClick={() => { setEditingModule(null); setForm({ title: '', language: 'English', duration_minutes: '' }); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow"
        >
          <Plus className="w-4 h-4" /> New Module
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white">
          <p className="text-3xl font-black">{modules.length}</p>
          <p className="text-sm opacity-90 mt-1">Total Modules</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-4 text-white">
          <p className="text-3xl font-black">{modules.reduce((a, m) => a + (m.Contents?.length ?? 0), 0)}</p>
          <p className="text-sm opacity-90 mt-1">Total Content Items</p>
        </div>
      </div>

      {/* Module list */}
      <div className="space-y-2">
        {modules.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No modules yet. Create your first module.</p>
          </div>
        )}
        {modules.map((m: any) => (
          <div key={m.module_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div
              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => setExpanded(expanded === m.module_id ? null : m.module_id)}
            >
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{m.title}</p>
                <p className="text-xs text-gray-400">{m.language} · {m.duration_minutes ?? '—'} min · {m.Contents?.length ?? 0} items</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button className="p-1.5 rounded-lg hover:bg-blue-50 transition" onClick={e => { e.stopPropagation(); setEditingModule(m); setForm({ title: m.title, language: m.language, duration_minutes: m.duration_minutes?.toString() || '' }); setShowForm(true); }}>
                  <Edit className="w-3.5 h-3.5 text-blue-500" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-red-50 transition" onClick={e => { e.stopPropagation(); handleDeleteModule(m.module_id); }}>
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
                {expanded === m.module_id
                  ? <ChevronUp className="w-4 h-4 text-gray-400" />
                  : <ChevronDown className="w-4 h-4 text-gray-400" />
                }
              </div>
            </div>
            {expanded === m.module_id && (
              <div className="border-t border-gray-100 px-4 pb-4 pt-2">
                {(!m.Contents || m.Contents.length === 0) && (
                  <p className="text-xs text-gray-400 py-2">No content items in this module.</p>
                )}
                {m.Contents?.sort((a: any, b: any) => a.order_index - b.order_index).map((c: any) => (
                  <div key={c.content_id} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition group">
                    <span className="text-[10px] font-bold text-gray-400 w-4">{c.order_index}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      c.content_type === 'quiz' ? 'bg-green-100 text-green-700'
                      : c.content_type === 'exam' ? 'bg-orange-100 text-orange-700'
                      : 'bg-blue-100 text-blue-700'
                    }`}>{c.content_type}</span>
                    <p className="text-xs text-gray-700 flex-1">{c.title}</p>
                    <button onClick={() => handleDeleteContent(m.module_id, c.content_id)} className="p-1 text-red-400 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
                <div className="mt-3">
                  <button onClick={() => { setContentForm({ ...contentForm, order_index: String((m.Contents?.length || 0) + 1) }); setShowContentForm(m.module_id); }} className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Content Item
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Module Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800 text-lg">{editingModule ? 'Edit Module' : 'Create New Module'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Module Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Introduction to Computer Literacy"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Language</label>
                <select
                  value={form.language}
                  onChange={e => setForm({ ...form, language: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option>English</option>
                  <option>Kinyarwanda</option>
                  <option>French</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Duration (minutes)</label>
                <input
                  type="number"
                  value={form.duration_minutes}
                  onChange={e => setForm({ ...form, duration_minutes: e.target.value })}
                  placeholder="e.g. 120"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50"
                >Cancel</button>
                <button
                  onClick={handleSaveModule}
                  disabled={saving || !form.title.trim()}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : editingModule ? 'Save Changes' : 'Create Module'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Content Modal */}
      {showContentForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800 text-lg">Add Content Item</h3>
              <button onClick={() => setShowContentForm(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Title *</label>
                <input
                  type="text"
                  value={contentForm.title}
                  onChange={e => setContentForm({ ...contentForm, title: e.target.value })}
                  placeholder="e.g. Lesson 1: Hardware Basics"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Type</label>
                  <select
                    value={contentForm.content_type}
                    onChange={e => setContentForm({ ...contentForm, content_type: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="note">Note (Reading)</option>
                    <option value="quiz">Quiz</option>
                    <option value="exam">Final Exam</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Order / Sequence</label>
                  <input
                    type="number"
                    value={contentForm.order_index}
                    onChange={e => setContentForm({ ...contentForm, order_index: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Content Data (Text / Rules) *</label>
                <textarea
                  value={contentForm.content_data}
                  onChange={e => setContentForm({ ...contentForm, content_data: e.target.value })}
                  placeholder="Enter the lesson text or quiz instructions..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowContentForm(null)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50"
                >Cancel</button>
                <button
                  onClick={handleSaveContent}
                  disabled={saving || !contentForm.title.trim() || !contentForm.content_data.trim()}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Add Content'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModules;
