import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Award, Briefcase, TrendingUp, Loader2 } from 'lucide-react';
import api from '../../utils/api';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ students: 0, modules: 0, certificates: 0, employers: 0 });
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, modsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/modules')
        ]);
        
        const { totalStudents, totalEmployers, totalModules, totalCertificates } = statsRes.data;
        setStats({
          students: totalStudents,
          modules: totalModules,
          certificates: totalCertificates,
          employers: totalEmployers
        });
        
        setModules(modsRes.data);
      } catch (e) {
        console.error('Failed to load admin stats', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  const statCards = [
    { label: 'Students', value: stats.students, icon: Users, color: 'from-blue-500 to-blue-700', emoji: '👥' },
    { label: 'Modules', value: stats.modules, icon: BookOpen, color: 'from-indigo-500 to-indigo-700', emoji: '📚' },
    { label: 'Certificates Issued', value: stats.certificates, icon: Award, color: 'from-amber-500 to-orange-600', emoji: '🏆' },
    { label: 'Employers', value: stats.employers, icon: Briefcase, color: 'from-emerald-500 to-green-700', emoji: '🏢' },
  ];

  return (
    <div className="h-full overflow-y-auto pr-1 pb-4">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
        <p className="text-gray-500 text-sm">Welcome back, {user.first_name} {user.last_name}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {statCards.map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 text-white shadow-md`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{s.emoji}</span>
              <span className="text-3xl font-black">{s.value}</span>
            </div>
            <p className="text-sm font-medium opacity-90">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Modules overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" /> Learning Modules
          </h3>
          <span className="text-xs text-gray-400">{modules.length} total</span>
        </div>
        <div className="space-y-2">
          {modules.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-6">No modules yet. Create one in the Modules section.</p>
          )}
          {modules.map((m: any) => (
            <div key={m.module_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{m.title}</p>
                <p className="text-xs text-gray-400">{m.language} · {m.duration_minutes ?? '—'} min</p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                {m.Contents?.length ?? 0} items
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
