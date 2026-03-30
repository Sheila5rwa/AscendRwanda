import React, { useState, useEffect } from 'react';
import { Plus, FileText, Edit, Trash2, HelpCircle, ClipboardList, Loader2, X, Save, BookOpen } from 'lucide-react';
import api from '../../utils/api';

const typeConfig: Record<string, { label: string; cls: string; icon: React.ReactNode; bg: string }> = {
  note: { label: 'Note', cls: 'bg-blue-100 text-blue-700',   bg: 'bg-blue-50',   icon: <FileText    className="w-4 h-4 text-blue-600" /> },
  quiz: { label: 'Quiz', cls: 'bg-green-100 text-green-700', bg: 'bg-green-50',  icon: <HelpCircle  className="w-4 h-4 text-green-600" /> },
  exam: { label: 'Exam', cls: 'bg-orange-100 text-orange-700',bg:'bg-orange-50', icon: <ClipboardList className="w-4 h-4 text-orange-600" /> },
};

const Administration: React.FC = () => {
  const [modules, setModules]       = useState<any[]>([]);
  const [contents, setContents]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeType, setActiveType] = useState<'all' | 'note' | 'quiz' | 'exam'>('all');
  const [showForm, setShowForm]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm] = useState({
    title: '', module_id: '', content_type: 'note', language: 'English', content_data: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/modules');
      const mods = res.data;
      setModules(mods);
      // Flatten all content items from all modules
      const allContents = mods.flatMap((m: any) =>
        (m.Contents ?? []).map((c: any) => ({ ...c, module_title: m.title }))
      );
      setContents(allContents);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = activeType === 'all' ? contents : contents.filter(c => c.content_type === activeType);

  const handleSave = async () => {
    if (!form.title.trim() || !form.module_id) return;
    setSaving(true);
    try {
      await api.post('/modules/content', {
        module_id:    Number(form.module_id),
        title:        form.title,
        content_type: form.content_type,
        content_data: form.content_data,
      });
      setShowForm(false);
      setForm({ title: '', module_id: '', content_type: 'note', language: 'English', content_data: '' });
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="h-full overflow-y-auto pr-1 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Content Management</h2>
          <p className="text-gray-500 text-sm">Create and manage notes, quizzes, and exams</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Content
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Notes',   value: contents.filter(c => c.content_type === 'note').length, color: 'text-blue-600',   bg: 'bg-blue-50',   icon: '📝', type: 'note'  as const },
          { label: 'Quizzes', value: contents.filter(c => c.content_type === 'quiz').length, color: 'text-green-600',  bg: 'bg-green-50',  icon: '❓', type: 'quiz'  as const },
          { label: 'Exams',   value: contents.filter(c => c.content_type === 'exam').length, color: 'text-orange-500', bg: 'bg-orange-50', icon: '📋', type: 'exam'  as const },
        ].map(stat => (
          <div
            key={stat.label}
            className={`${stat.bg} rounded-2xl p-4 cursor-pointer hover:shadow-sm transition`}
            onClick={() => setActiveType(activeType === stat.type ? 'all' : stat.type)}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{stat.icon}</span>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(['all', 'note', 'quiz', 'exam'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              activeType === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {t === 'all' ? 'All Content' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
          </button>
        ))}
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            <p className="text-sm">No content yet. Create a module first, then add content.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Module</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(item => (
                <tr key={item.content_id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 ${typeConfig[item.content_type]?.bg ?? 'bg-gray-50'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        {typeConfig[item.content_type]?.icon}
                      </div>
                      <span className="font-medium text-gray-800 text-xs truncate max-w-[180px]">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500 truncate max-w-[160px] block">{item.module_title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${typeConfig[item.content_type]?.cls ?? ''}`}>
                      {typeConfig[item.content_type]?.label ?? item.content_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-red-50 transition">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Content Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Add New Content</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Content title..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Module *</label>
                <select
                  value={form.module_id}
                  onChange={e => setForm({ ...form, module_id: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">— Select a module —</option>
                  {modules.map(m => (
                    <option key={m.module_id} value={m.module_id}>{m.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Content Type</label>
                <select
                  value={form.content_type}
                  onChange={e => setForm({ ...form, content_type: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="note">Note</option>
                  <option value="quiz">Quiz</option>
                  <option value="exam">Exam</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Content</label>
                <textarea
                  rows={4}
                  value={form.content_data}
                  onChange={e => setForm({ ...form, content_data: e.target.value })}
                  placeholder="Enter content, quiz questions, or exam details..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.title.trim() || !form.module_id}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Content'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Administration;
