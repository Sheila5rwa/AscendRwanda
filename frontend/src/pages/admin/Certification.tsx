import React, { useState, useEffect } from 'react';
import { Award, QrCode, Download, Search, CheckCircle, Loader2, X } from 'lucide-react';
import api from '../../utils/api';

const avatarColors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-teal-500', 'bg-pink-500'];

const Certification: React.FC = () => {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCert, setSelectedCert] = useState<any | null>(null);

  const fetchCertificates = async () => {
    try {
      const res = await api.get('/admin/certificates');
      setCertificates(res.data || []);
    } catch (e) {
      console.error('Failed to load certificates', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const filtered = certificates.filter(
    (c) => {
      const sName = `${c.User?.first_name} ${c.User?.last_name}`.toLowerCase();
      const mTitle = c.Module?.title?.toLowerCase() || '';
      const q = search.toLowerCase();
      return sName.includes(q) || mTitle.includes(q);
    }
  );

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="h-full overflow-y-auto pr-1 pb-4">
      {/* Certification content starts here */}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total Issued', value: certificates.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: '🎓' },
          { label: 'Verified', value: certificates.length, color: 'text-green-600', bg: 'bg-green-50', icon: '✅' },
          { label: 'Pending', value: 0, color: 'text-orange-500', bg: 'bg-orange-50', icon: '⏳' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 shadow-sm border border-white/50`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{stat.icon}</span>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{stat.label}</p>
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
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-all"
        />
      </div>

      {/* Certificate Cards */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
            <Award className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No certificates found.</p>
          </div>
        )}
        {filtered.map((cert, i) => (
          <div
            key={cert.certificate_id}
            onClick={() => setSelectedCert(cert)}
            className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group relative overflow-hidden"
          >
            {/* Certificate Header Decor */}
            <div className={`${avatarColors[i % avatarColors.length]} rounded-2xl p-4 mb-4 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
              <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full translate-y-4 -translate-x-4" />
              <Award className="w-8 h-8 text-white mb-2" />
              <p className="text-white font-black text-sm">CERTIFICATE</p>
              <p className="text-white/80 text-[10px] font-bold">ASCEND RWANDA</p>
            </div>

            <div className="mb-3">
              <h4 className="font-bold text-gray-800 text-sm mb-0.5">{cert.User?.first_name} {cert.User?.last_name}</h4>
              <p className="text-xs text-blue-600 font-semibold">{cert.Module?.title}</p>
            </div>

            <div className="flex items-center justify-between mb-3 bg-gray-50 p-2 rounded-xl">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Issued</p>
                <p className="text-xs font-semibold text-gray-600">{new Date(cert.issued_at).toLocaleDateString()}</p>
              </div>
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-100">
                <QrCode className="w-5 h-5 text-gray-600" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-black uppercase bg-green-100 text-green-700`}>
                <CheckCircle className="w-3 h-3" /> VERIFIED
              </span>
              <button className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-bold transition-all">
                <Download className="w-3.5 h-3.5" /> DOWNLOAD
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Certificate Preview Modal */}
      {selectedCert && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setSelectedCert(null)}>
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedCert(null)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
            
            <div className="text-center mb-8 pt-4">
              <div className="w-20 h-20 bg-blue-50 rounded-[24px] flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <Award className="w-10 h-10 text-blue-600" />
              </div>
              <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">Certificate of Completion</p>
              <h3 className="text-2xl font-black text-gray-900 mt-2">Ascend Rwanda</h3>
            </div>

            <div className="border-y border-gray-100 py-6 mb-6 text-center bg-gray-50/50 rounded-2xl">
              <p className="text-xs text-gray-400 mb-2 font-medium">This certifies that</p>
              <p className="text-2xl font-black text-blue-700 mb-4">{selectedCert.User?.first_name} {selectedCert.User?.last_name}</p>
              <p className="text-xs text-gray-400 mb-2 font-medium">has successfully completed</p>
              <p className="text-lg font-bold text-gray-800 leading-tight">{selectedCert.Module?.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-2xl">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Issue Date</p>
                <p className="text-sm font-bold text-gray-700">{new Date(selectedCert.issued_at).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Status</p>
                <div className="flex items-center gap-1.5 text-green-600 font-bold text-sm">
                  <CheckCircle className="w-4 h-4" /> VERIFIED
                </div>
              </div>
            </div>

            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
                <QrCode className="w-full h-full text-gray-900" />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedCert(null)} 
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all border-b-4 active:border-b-0 active:translate-y-1"
              >
                Close
              </button>
              <button className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2">
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
