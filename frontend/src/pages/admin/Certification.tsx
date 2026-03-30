import React, { useState } from 'react';
import { Award, QrCode, Download, Search, CheckCircle } from 'lucide-react';

const certificates = [
  { id: 1, student: 'Marie Claire Iradukunda', module: 'Introduction to Computer Literacy', issued: '15 Jan 2026', qrCode: 'QR-2026-001-MCL', verified: true, color: 'bg-green-500' },
  { id: 2, student: 'Patrick Nkurunziza', module: 'Introduction to Computer Literacy', issued: '10 Jan 2026', qrCode: 'QR-2026-002-PKN', verified: true, color: 'bg-blue-500' },
  { id: 3, student: 'Patrick Nkurunziza', module: 'English for the Workplace', issued: '20 Jan 2026', qrCode: 'QR-2026-003-PKN', verified: true, color: 'bg-purple-500' },
  { id: 4, student: 'Amina Uwimana', module: 'Introduction to Computer Literacy', issued: '18 Jan 2026', qrCode: 'QR-2026-004-AMU', verified: false, color: 'bg-orange-500' },
  { id: 5, student: 'Alexis Bizimana', module: 'Digital Financial Literacy', issued: '22 Jan 2026', qrCode: 'QR-2026-005-ALB', verified: true, color: 'bg-teal-500' },
  { id: 6, student: 'Solange Ingabire', module: 'Introduction to Computer Literacy', issued: '25 Jan 2026', qrCode: 'QR-2026-006-SOI', verified: true, color: 'bg-pink-500' },
];

const avatarColors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-teal-500', 'bg-pink-500'];

const Certification: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCert, setSelectedCert] = useState<typeof certificates[0] | null>(null);

  const filtered = certificates.filter(
    (c) =>
      c.student.toLowerCase().includes(search.toLowerCase()) ||
      c.module.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto pr-1 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Certification</h2>
          <p className="text-gray-500 text-sm">QR-coded certificates for verified module completion</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2">
          <Award className="w-4 h-4" /> Issue Certificate
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total Issued', value: certificates.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: '🎓' },
          { label: 'Verified', value: certificates.filter((c) => c.verified).length, color: 'text-green-600', bg: 'bg-green-50', icon: '✅' },
          { label: 'Pending Verification', value: certificates.filter((c) => !c.verified).length, color: 'text-orange-500', bg: 'bg-orange-50', icon: '⏳' },
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

      {/* Search */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by student or module..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
        />
      </div>

      {/* Certificate Cards */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((cert, i) => (
          <div
            key={cert.id}
            onClick={() => setSelectedCert(cert)}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group"
          >
            {/* Certificate Header */}
            <div className={`${avatarColors[i % avatarColors.length]} rounded-xl p-4 mb-4 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
              <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full translate-y-4 -translate-x-4" />
              <Award className="w-8 h-8 text-white mb-2" />
              <p className="text-white font-bold text-sm">Certificate of Completion</p>
              <p className="text-white/80 text-xs">Ascend Rwanda</p>
            </div>

            <div className="mb-3">
              <h4 className="font-bold text-gray-800 text-sm mb-0.5">{cert.student}</h4>
              <p className="text-xs text-gray-500">{cert.module}</p>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-400">Issued: {cert.issued}</p>
                <p className="text-xs font-mono text-gray-500 mt-0.5">{cert.qrCode}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <QrCode className="w-6 h-6 text-gray-600" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${cert.verified ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
                <CheckCircle className="w-3 h-3" />
                {cert.verified ? 'Verified' : 'Pending'}
              </span>
              <button className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
                <Download className="w-3 h-3" /> Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Certificate Preview Modal */}
      {selectedCert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedCert(null)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Certificate of Completion</p>
              <h3 className="text-lg font-bold text-gray-800 mt-1">Ascend Rwanda</h3>
            </div>
            <div className="border-t border-b border-gray-100 py-4 mb-4 text-center">
              <p className="text-xs text-gray-400 mb-1">This certifies that</p>
              <p className="text-xl font-bold text-blue-700">{selectedCert.student}</p>
              <p className="text-xs text-gray-400 my-2">has successfully completed</p>
              <p className="text-base font-semibold text-gray-800">{selectedCert.module}</p>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400">Issued on</p>
                <p className="text-sm font-semibold text-gray-700">{selectedCert.issued}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">QR Code</p>
                <p className="text-xs font-mono text-gray-600">{selectedCert.qrCode}</p>
              </div>
            </div>
            {/* Fake QR code pattern */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                <QrCode className="w-12 h-12 text-gray-700" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedCert(null)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">Close</button>
              <button className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certification;
