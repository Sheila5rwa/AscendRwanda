import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Building2, Loader2, X, Save, Mail, Phone, MapPin, Search } from 'lucide-react';
import api from '../../utils/api';

interface Employer {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  company_name?: string;
  location?: string;
  phone?: string;
  status?: string;
}

const AdminEmployers: React.FC = () => {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Employer | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', company_name: '', location: '', phone: '' });

  const loadEmployers = async () => {
    setLoading(true);
    try {
      // Fetch all users who are employers via admin route (if available) or use seed data
      await api.get('/employers/students'); // placeholder — real admin user list needs a backend route
      setEmployers([]); // Real implementation would list employers from /api/admin/users?role=employer

    } catch {
      setEmployers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEmployers(); }, []);

  const openCreate = () => {
    setForm({ first_name: '', last_name: '', email: '', company_name: '', location: '', phone: '' });
    setEditTarget(null);
    setShowForm(true);
  };

  const openEdit = (emp: Employer) => {
    setForm({
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      company_name: emp.company_name ?? '',
      location: emp.location ?? '',
      phone: emp.phone ?? '',
    });
    setEditTarget(emp);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editTarget) {
        // Edit: update via PUT (requires backend admin route — for now just close)
        alert('Edit functionality requires an admin PUT endpoint. Coming soon.');
      } else {
        // Create new employer via signup — omit national_id entirely to avoid unique constraint
        await api.post('/auth/signup', {
          first_name:  form.first_name,
          last_name:   form.last_name,
          email:       form.email,
          password:    'Ascend@2026',  // temporary default password
          role:        'employer',
          phone_number: form.phone || undefined,
          // national_id omitted — employers don't have a national ID in this context
        });
        // Optimistically add to local list
        setEmployers(prev => [
          ...prev,
          {
            user_id:      Date.now(),
            first_name:   form.first_name,
            last_name:    form.last_name,
            email:        form.email,
            company_name: form.company_name,
            location:     form.location,
            phone:        form.phone,
          } as Employer,
        ]);
      }
      setShowForm(false);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Failed to save employer.';
      alert(`Error: ${msg}`);
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this employer?')) return;
    try {
      // await api.delete(`/admin/employers/${id}`);
      setEmployers(prev => prev.filter(e => e.user_id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = employers.filter(e =>
    `${e.first_name} ${e.last_name} ${e.company_name ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="h-full overflow-y-auto pr-1 pb-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Employer Management</h2>
          <p className="text-gray-500 text-sm">Manage employer accounts</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow"
        >
          <Plus className="w-4 h-4" /> Add Employer
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search employers..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Employer</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-16 text-gray-400 text-sm">
                  <Building2 className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                  No employers found.{' '}
                  <button onClick={openCreate} className="text-blue-600 underline font-medium">Add one to get started.</button>
                </td>
              </tr>
            )}
            {filtered.map(emp => (
              <tr key={emp.user_id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                      {emp.first_name?.[0]}{emp.last_name?.[0]}
                    </div>
                    <span className="font-medium text-gray-800">{emp.first_name} {emp.last_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">{emp.company_name ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" />{emp.email}</span>
                    {emp.phone && <span className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{emp.phone}</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 flex items-center gap-1">
                  {emp.location ? <><MapPin className="w-3 h-3" />{emp.location}</> : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(emp)} className="p-1.5 rounded-lg hover:bg-blue-50 transition">
                      <Edit className="w-3.5 h-3.5 text-blue-500" />
                    </button>
                    <button onClick={() => handleDelete(emp.user_id)} className="p-1.5 rounded-lg hover:bg-red-50 transition">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800 text-lg">{editTarget ? 'Edit Employer' : 'Add Employer'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">First Name *</label>
                  <input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Last Name *</label>
                  <input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Company Name</label>
                <input value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Location</label>
                  <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Phone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployers;
