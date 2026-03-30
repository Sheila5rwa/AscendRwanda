import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Download, ChevronLeft, Award, 
  ShieldCheck, Loader2, AlertCircle 
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';

const CertificateView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certData, setCertData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const autoPrint = searchParams.get('autoPrint') === 'true';

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const res = await api.get(`/students/certificates/${id}/qr`);
        setCertData(res.data);
      } catch (err: any) {
        setError('Certificate not found or expired.');
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [id]);

  useEffect(() => {
    if (!loading && certData && autoPrint) {
      setTimeout(() => {
        window.print();
        // Optionally go back after printing/cancelling
        // navigate(-1); 
      }, 800);
    }
  }, [loading, certData, autoPrint]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
    </div>
  );

  if (error || !certData) return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <AlertCircle className="w-12 h-12 text-red-500" />
      <p className="text-gray-700 font-bold">{error}</p>
      <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-6 py-2 rounded-xl">Go Back</button>
    </div>
  );

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* Action Bar */}
      <div className="px-8 py-4 bg-white border-b border-gray-100 flex items-center justify-between no-print overflow-x-auto">
        <div className="flex items-center gap-4 min-w-fit">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="font-black text-gray-900 uppercase tracking-tight text-sm">Official Credential</h2>
        </div>
        <div className="flex items-center gap-3 min-w-fit ml-4">
          <button onClick={handlePrint} className="bg-gray-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all">
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      </div>

      {/* Certificate Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-12 flex justify-center items-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed ">
        
        {/* THE PREMIUM CERTIFICATE DESIGN */}
        <div 
          id="certificate-paper"
          className="relative w-full max-w-[1000px] aspect-[1.414/1] bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border-[20px] border-[#1e293b] p-1 overflow-hidden group print:shadow-none print:border-8 print:m-0"
        >
          {/* Internal Gold Border */}
          <div className="h-full w-full border-[6px] border-[#d4af37] p-8 md:p-16 flex flex-col items-center text-center relative overflow-hidden">
            
            {/* Background Decorative Medallion (Faded) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
               <Award className="w-[500px] h-[500px] text-[#d4af37]" />
            </div>

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-[#d4af37]/30" />
            <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-[#d4af37]/30" />

            {/* Content Top */}
            <div className="relative z-10 mb-2">
               <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="h-[2px] w-12 md:w-20 bg-gradient-to-r from-transparent to-[#d4af37]" />
                  <span className="text-[#d4af37] font-black uppercase tracking-[0.3em] text-[10px] md:text-sm">Ascend Rwanda</span>
                  <div className="h-[2px] w-12 md:w-20 bg-gradient-to-l from-transparent to-[#d4af37]" />
               </div>
               <h1 className="text-4xl md:text-7xl font-black text-[#1e293b] uppercase tracking-tighter mb-2 scale-y-110">Certificate</h1>
               <p className="text-lg md:text-2xl font-serif text-[#d4af37] italic uppercase tracking-widest border-t border-b border-[#d4af37]/20 py-2 inline-block px-12">of achievement</p>
            </div>

            {/* Content Mid */}
            <div className="relative z-10 flex-1 flex flex-col justify-start pt-6 w-full py-4">
               <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[8px] md:text-[10px] mb-4">This highly prestigious credential is proudly presented to</p>
               <h2 className="text-4xl md:text-7xl font-black text-[#1e293b] uppercase mb-6 tracking-tight drop-shadow-md">{user.first_name} {user.last_name}</h2>
               
               <div className="max-w-xl mx-auto h-[1px] w-full bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent mb-6" />
               
               <p className="text-gray-500 font-bold text-sm md:text-xl mb-2">For successfully completing the comprehensive learning module</p>
               <h3 className="text-2xl md:text-4xl font-black text-[#d4af37] uppercase tracking-wider mb-8">{certData.module}</h3>

               <p className="max-w-xl mx-auto text-gray-400 text-[9px] md:text-xs italic leading-relaxed">
                 Demonstrating exceptional proficiency, commitment, and mastery in the subject matter. 
                 Validated through rigorous assessment and academic excellence at the Ascend Rwanda vocational accelerator.
               </p>
            </div>

            {/* Footers with Seals */}
            {/* Footers with Seals - Stable Grid - MOVED UP - TIGHTER GAP */}
            <div className="relative z-10 w-full mt-2 grid grid-cols-3 items-end px-4 md:px-10 pb-2">
               {/* QR Column */}
               <div className="flex flex-col items-center">
                  <div className="p-1.5 border-2 border-[#1e293b] rounded-xl bg-white shadow-lg w-fit">
                    <img src={certData.qr_image} alt="QR Code" className="w-16 h-16 md:w-24 md:h-24 object-contain" />
                  </div>
                  <p className="text-[7px] md:text-[9px] font-black text-[#1e293b] uppercase tracking-widest mt-2">Verify Authenticity</p>
               </div>

               {/* Medal Column (Center) - Refactored for Stability */}
               <div className="flex justify-center items-end h-full min-w-[150px]">
                  <div className="relative mb-4">
                    {/* Ribbons First */}
                    <div className="absolute top-[60%] left-1/2 -translate-x-1/2 flex gap-1 z-10">
                       <div className="w-6 md:w-8 h-16 md:h-24 bg-[#1e293b] rotate-[15deg] origin-top shadow-lg" />
                       <div className="w-6 md:w-8 h-16 md:h-24 bg-[#1e293b] -rotate-[15deg] origin-top shadow-lg" />
                    </div>
                    {/* Medal Second (On Top) */}
                    <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-[#d4af37] shadow-[0_0_40px_rgba(212,175,55,0.4)] border-4 border-white flex items-center justify-center relative z-20">
                       <div className="w-full h-full rounded-full border-2 border-dashed border-[#1e293b]/10 flex items-center justify-center">
                          <Award className="w-10 h-10 md:w-16 md:h-16 text-[#1e293b]" />
                       </div>
                    </div>
                  </div>
               </div>

               {/* Signature Column */}
               <div className="flex flex-col items-center">
                  <div className="mb-2 text-center">
                     <p className="font-serif text-2xl md:text-4xl text-[#1e293b] tracking-wider mb-1">Sheila Milena</p>
                     <div className="h-[2px] w-36 md:w-56 bg-gradient-to-r from-transparent via-[#1e293b] to-transparent" />
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] md:text-[10px] font-black text-[#1e293b] uppercase tracking-[0.1em]">Director of Ascend Rwanda</p>
                    <p className="text-[7px] md:text-[8px] text-gray-500 font-bold mt-1 uppercase tracking-widest">Issued: {new Date(certData.issued_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
               </div>
            </div>

            {/* Official ID Footer */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 no-print">
               <div className="flex items-center gap-2 text-[7px] md:text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em]">
                  <ShieldCheck className="w-3 h-3" />
                  Credential ID: {id?.substring(0, 8)}-{new Date(certData.issued_at).getTime()}
               </div>
            </div>

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* 1. Global Reset - Landscape and Single Page */
          @page {
            size: landscape;
            margin: 0 !important;
          }
          
          html, body { 
            margin: 0 !important; 
            padding: 0 !important; 
            height: 100%;
            overflow: hidden !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* 2. Hide ALL application UI wrappers that are not the certificate */
          header, nav, aside, footer, button, .no-print, .topbar, .sidebar { 
            display: none !important; 
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* 3. Neutralize the App Shell hierarchy completely */
          #root, #root > div, .min-h-screen, .bg-\[#eef0f8\], .flex, .flex-1, .p-4, .px-6, .pt-3 {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            height: auto !important;
            width: 100% !important;
            background: white !important;
            box-shadow: none !important;
            max-width: none !important;
            border-radius: 0 !important;
            overflow: visible !important;
          }

          /* 4. Ensure ONLY one page by making the paper absolute */
          #certificate-paper {
            display: flex !important;
            flex-direction: column !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 99.8vh !important; /* Slightly less than 100 to avoid rounding-up second page */
            border: 15px solid #1e293b !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            z-index: 9999 !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
          }
        }

        .rich-content img { max-width: 100%; height: auto; border-radius: 12px; margin: 20px 0; }
        .rich-content h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; color: #111827; }
        .rich-content p { margin-bottom: 1rem; line-height: 1.7; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}} />
    </div>
  );
};

export default CertificateView;
