import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import api from '../utils/api';

const PIE_COLORS = ['#ef4444', '#f59e0b', '#22c55e'];

const Dashboard: React.FC = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modRes, progRes] = await Promise.all([
          api.get('/modules'),
          api.get('/students/progress')
        ]);
        setModules(modRes.data);
        setProgress(progRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  const chartData = modules.map(m => {
    const p = progress.find(prog => prog.module_id === m.module_id);
    return {
      name: m.title.length > 10 ? m.title.substring(0, 10) + '...' : m.title,
      score: p ? (p.status === 'completed' ? 100 : 50) : 0
    };
  });

  const breakdownData = [
    { name: 'Completed', value: progress.filter(p => p.status === 'completed').length },
    { name: 'In Progress', value: progress.filter(p => p.status === 'in_progress').length },
    { name: 'Not Started', value: modules.length - progress.length },
  ];

  return (
    <div className="flex gap-5 h-full overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-5 pb-4">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 flex items-center justify-between shadow-md">
          <div className="flex-1">
            <h2 className="text-white font-bold text-lg mb-1">Welcome back, {user.first_name}!</h2>
            <p className="text-blue-100 text-sm max-w-sm">
              You are making great progress in your learning journey. Check your latest module benchmarks below.
            </p>
          </div>
          <button className="ml-6 bg-white text-blue-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition shadow flex-shrink-0">
            View My Portal
          </button>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-5">
          {/* Bar Chart */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700 text-sm">Module Progress</h3>
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} barSize={14}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
                />
                <Bar dataKey="score" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700 text-sm">Learning Breakdown</h3>
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={breakdownData} cx="50%" cy="50%" innerRadius={40} outerRadius={68} dataKey="value" paddingAngle={3}>
                  {breakdownData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ fontSize: 11, color: '#6b7280' }}>{value}</span>}
                />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress Learning */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700 text-sm">My Modules</h3>
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-4">
            {modules.map((m, i) => {
               const p = progress.find(prog => prog.module_id === m.module_id);
               const percent = p ? (p.status === 'completed' ? 100 : 50) : 0;
               return (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0`}>
                    📚
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700">{m.title}</p>
                    <p className="text-xs text-gray-400 mb-1">{m.language}</p>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-blue-500 rounded-full`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 ml-1">{percent}%</span>
                </div>
               );
            })}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-[260px] min-w-[260px] overflow-y-auto space-y-5 pb-4">
        {/* Recent Activity Mock */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700 text-sm">Recent Activity</h3>
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-2.5">
            <p className="text-xs text-gray-400 text-center py-4">No recent activity.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
