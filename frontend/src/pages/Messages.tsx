import React, { useState } from 'react';
import { Send, Search } from 'lucide-react';

const conversations = [
  { id: 1, name: 'RwandaTech Solutions', role: 'Employer', avatar: 'RT', color: 'bg-blue-600', lastMessage: 'We are reviewing your profile for junior developer role.', time: '10:32 AM', unread: 2 },
  { id: 2, name: 'Dr. Kagame Eric', role: 'Mentor', avatar: 'KE', color: 'bg-indigo-500', lastMessage: 'Great progress on Module 3! Keep it up.', time: '09:15 AM', unread: 0 },
  { id: 3, name: 'Kigali Business Hub', role: 'Employer', avatar: 'KB', color: 'bg-green-600', lastMessage: 'Please share your certificate for verification.', time: 'Yesterday', unread: 1 },
  { id: 4, name: 'Prof. Uwase Celestine', role: 'Mentor', avatar: 'UC', color: 'bg-purple-500', lastMessage: 'Your quiz score has improved significantly!', time: 'Yesterday', unread: 0 },
  { id: 5, name: 'AgriDigital Rwanda', role: 'Employer', avatar: 'AD', color: 'bg-orange-500', lastMessage: 'Interview confirmed for March 22 at 2PM.', time: 'Mon', unread: 3 },
];

const messageHistory: Record<number, { from: string; text: string; time: string; mine: boolean }[]> = {
  1: [
    { from: 'RwandaTech Solutions', text: 'Hello! We noticed your profile on Ascend Rwanda.', time: '09:00 AM', mine: false },
    { from: 'Me', text: 'Thank you! I am very interested in opportunities with RwandaTech.', time: '09:05 AM', mine: true },
    { from: 'RwandaTech Solutions', text: 'We are reviewing your profile for junior developer role.', time: '10:32 AM', mine: false },
  ],
  2: [
    { from: 'Dr. Kagame Eric', text: 'How are you progressing with Module 3?', time: '08:50 AM', mine: false },
    { from: 'Me', text: 'I completed the quiz yesterday with 78%!', time: '09:00 AM', mine: true },
    { from: 'Dr. Kagame Eric', text: 'Great progress on Module 3! Keep it up.', time: '09:15 AM', mine: false },
  ],
  3: [
    { from: 'Kigali Business Hub', text: 'Hi, we have a data entry position available.', time: 'Yesterday 2:00 PM', mine: false },
    { from: 'Me', text: 'That sounds great! What are the requirements?', time: 'Yesterday 2:30 PM', mine: true },
    { from: 'Kigali Business Hub', text: 'Please share your certificate for verification.', time: 'Yesterday 3:00 PM', mine: false },
  ],
};

const Messages: React.FC = () => {
  const [activeConv, setActiveConv] = useState(conversations[0]);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  const filteredConvs = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const messages = messageHistory[activeConv.id] || [];

  return (
    <div className="h-full flex gap-4 overflow-hidden">
      {/* Conversation List */}
      <div className="w-64 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-sm mb-3">Messages</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConvs.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConv(conv)}
              className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition text-left border-b border-gray-50 ${activeConv.id === conv.id ? 'bg-blue-50' : ''}`}
            >
              <div className={`w-9 h-9 ${conv.color} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                {conv.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-800 truncate">{conv.name}</p>
                  <span className="text-xs text-gray-400 flex-shrink-0">{conv.time}</span>
                </div>
                <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  {conv.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className={`w-10 h-10 ${activeConv.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
            {activeConv.avatar}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">{activeConv.name}</p>
            <p className="text-xs text-gray-400">{activeConv.role}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${msg.mine ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <p className="text-xs leading-relaxed">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.mine ? 'text-blue-200' : 'text-gray-400'}`}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              onKeyDown={(e) => e.key === 'Enter' && setMessage('')}
            />
            <button
              onClick={() => setMessage('')}
              className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-700 transition"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
