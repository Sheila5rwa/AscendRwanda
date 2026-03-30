/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

// Since this is a public endpoint and doesn't need auth tokens,
// we can use standard axios if our api wrapper forces redirects on 401.
// But we'll try to use the api wrapper first, or just raw axios to be safe since it's a public route.
const isProd = import.meta.env.PROD;
const API_URL = isProd ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3000/api');

const VerifyCertificate: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await axios.get(`${API_URL}/verify/${token}`);
        setResult(response.data);
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          setError('Certificate not found or invalid QR token.');
        } else {
          setError('An error occurred while verifying the certificate.');
        }
      } finally {
        setLoading(false);
      }
    };
    if (token) verify();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef0f8] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Verifying Certificate...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef0f8] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-br-[100px] opacity-10"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500 rounded-tl-[100px] opacity-10"></div>

        <div className="relative z-10">
          <Award className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-gray-900 mb-2">Ascend Rwanda</h1>
          <p className="text-gray-500 mb-8 font-semibold">Official Certificate Verification</p>

          {error || !result?.valid ? (
            <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 flex flex-col items-center shadow-inner">
              <XCircle className="w-12 h-12 text-red-500 mb-2" />
              <h2 className="text-xl font-bold mb-1">Verification Failed</h2>
              <p className="text-red-600/80 text-sm font-medium">{error}</p>
            </div>
          ) : (
            <div className="space-y-6 text-left">
              <div className="bg-green-50 text-green-700 p-4 rounded-2xl border border-green-100 flex items-center gap-3 shadow-inner">
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <h2 className="font-bold">Verified Successfully</h2>
                  <p className="text-xs text-green-600/80 font-semibold">This is an authentic Ascend Rwanda certificate.</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Recipient Name</p>
                  <p className="font-bold text-gray-900 text-lg">{result.certificate.student.name}</p>
                </div>
                
                {result.certificate.student.national_id && result.certificate.student.national_id !== 'N/A' && (
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">National ID</p>
                    <p className="font-bold text-gray-700">***{result.certificate.student.national_id.slice(-4)}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Module Completed</p>
                  <p className="font-bold text-blue-700 text-lg">{result.certificate.module.title}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">{result.certificate.module.description}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Issue Date</p>
                  <p className="font-bold text-gray-700">
                    {new Date(result.certificate.issued_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link to="/" className="text-blue-600 font-bold hover:underline">
              Return to Ascend Rwanda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
