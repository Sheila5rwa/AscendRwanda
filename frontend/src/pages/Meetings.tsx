import React, { useState } from 'react';
import { Calendar, Clock, Video, Phone, Plus, CheckCircle, X } from 'lucide-react';

const meetings = [
  { id: 1, title: 'Interview – RwandaTech Solutions', with: 'Amina Uwimana', type: 'interview', date: '20 Mar 2026', time: '10:00 AM', status: 'upcoming', mode: 'video', color: 'bg-blue-500' },
  { id: 2, title: 'Mentorship Review', with: 'Jean Paul Habimana', type: 'mentorship', date: '21 Mar 2026', time: '2:00 PM', status: 'upcoming', mode: 'call', color: 'bg-indigo-500' },
  { id: 3, title: 'Interview – AgriDigital Rwanda', with: 'Solange Ingabire', type: 'interview', date: '22 Mar 2026', time: '2:00 PM', status: 'upcoming', mode: 'video', color: 'bg-orange-500' },
  { id: 4, title: 'Group Mentorship Session', with: 'Multiple Students', type: 'mentorship', date: '15 Mar 2026', time: '11:00 AM', status: 'completed', mode: 'call', color: 'bg-green-500' },
  { id: 5, title: 'Employer Orientation', with: 'Kigali Business Hub', type: 'employer', date: '10 Mar 2026', time: '9:30 AM', status: 'completed', mode: 'video', color: 'bg-purple-500' },
];

const statusCls: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const Meetings: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [showSchedule, setShowSchedule] = useState(false);

  const filtered = filter === 'all' ? meetings : meetings.filter((m) => m.status === filter);

  return (
    <div className="h-full overflow-y-auto pr-1 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Call Meetings</h2>
          <p className="text-gray-500 text-sm">Schedule and manage video/call meetings</p>
        </div>
        <button
          onClick={() => setShowSchedule(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Schedule Meeting
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total Meetings', value: meetings.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: '📅' },
          { label: 'Upcoming', value: meetings.filter((m) => m.status === 'upcoming').length, color: 'text-orange-500', bg: 'bg-orange-50', icon: '⏰' },
          { label: 'Completed', value: meetings.filter((m) => m.status === 'completed').length, color: 'text-green-600', bg: 'bg-green-50', icon: '✅' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-4`}>
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
        {(['all', 'upcoming', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Meeting Cards */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((meeting) => (
          <div key={meeting.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-10 h-10 ${meeting.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                {meeting.mode === 'video' ? (
                  <Video className="w-5 h-5 text-white" />
                ) : (
                  <Phone className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 text-sm leading-tight">{meeting.title}</h4>
                <p className="text-xs text-gray-400 mt-0.5">with {meeting.with}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {meeting.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {meeting.time}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusCls[meeting.status]}`}>
                {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
              </span>
              {meeting.status === 'upcoming' ? (
                <button className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition font-medium">
                  {meeting.mode === 'video' ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                  Join
                </button>
              ) : (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <CheckCircle className="w-3 h-3" /> Done
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Modal */}
      {showSchedule && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Schedule Meeting</h3>
              <button onClick={() => setShowSchedule(false)} className="p-1 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Meeting Title</label>
                <input type="text" placeholder="e.g., Interview – Company Name" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Participant</label>
                <input type="text" placeholder="Student or employer name..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Date</label>
                  <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Time</label>
                  <input type="time" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Meeting Type</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option>Video Call</option>
                  <option>Phone Call</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowSchedule(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">Cancel</button>
                <button onClick={() => setShowSchedule(false)} className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">Schedule</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meetings;
