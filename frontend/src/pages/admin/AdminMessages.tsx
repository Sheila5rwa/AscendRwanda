import React from 'react';
import { MessageSquare } from 'lucide-react';

const AdminMessages: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <MessageSquare className="w-14 h-14 text-gray-200 mb-3" />
      <h3 className="font-bold text-gray-600 text-lg">Messages</h3>
      <p className="text-gray-400 text-sm mt-1">Admin messaging will appear here</p>
    </div>
  );
};

export default AdminMessages;
