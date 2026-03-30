import React, { useState } from 'react';
import { Mail, Lock, LogIn, Award, Loader2, Phone, CreditCard } from 'lucide-react';
import { UserRole } from '../components/Sidebar';
import api from '../utils/api';

interface LoginProps {
  onLogin: (role: UserRole) => void;
  onNavigateToSignup: () => void;
  onBackToLanding: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToSignup, onBackToLanding }) => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | 'nid'>('email');
  const [identifier, setIdentifier] = useState(''); // Stores email, phone, or NID based on selected method
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      let endpoint = '/auth/signin';
      let payload: any = { password };

      if (loginMethod === 'email') {
        payload.email = identifier;
      } else if (loginMethod === 'phone') {
        endpoint = '/auth/signin-phone';
        payload.phone_number = identifier;
      } else if (loginMethod === 'nid') {
        endpoint = '/auth/signin-nid';
        payload.national_id = identifier;
      }

      const response = await api.post(endpoint, payload);
      console.log('[Login Response]', response.data);
      
      // Robust extraction: support both top-level and nested 'data' structures
      const data = response.data.data || response.data;
      const accessToken = data.accessToken || data.token;
      const userRole = data.role;

      if (!accessToken || !userRole) {
          console.error('[Login Error] Missing token or role in response:', data);
          setError('Invalid server response: missing credentials.');
          return;
      }
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(data));
      
      onLogin(userRole);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef0f8] flex items-center justify-center p-4">
      <div className="w-full max-w-[1000px] h-[600px] bg-white rounded-3xl shadow-2xl flex overflow-hidden">
        {/* Left Side: Visual/Branding */}
        <div className="hidden md:flex flex-col flex-1 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-12 text-white relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600">
                <Award className="w-7 h-7" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Ascend Rwanda</h1>
            </div>
            
            <h2 className="text-4xl font-extrabold mb-4 leading-tight">
              Empowering the Next Generation of Tech Leaders.
            </h2>
            <p className="text-blue-100 text-lg max-w-md">
              Join our platform to learn, find mentorship, and connect with top employers across Rwanda.
            </p>
          </div>
          
          {/* Decorative Elements */}
          <div className="mt-auto relative z-10 grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-2xl font-bold">10k+</p>
              <p className="text-sm text-blue-200">Active Students</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-2xl font-bold">500+</p>
              <p className="text-sm text-blue-200">Employer Partners</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 flex flex-col justify-center p-8 md:p-14 bg-white">
          <div className="w-full max-w-sm mx-auto">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
              <p className="text-gray-500">Please enter your details to sign in.</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
                {error}
              </div>
            )}

            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => { setLoginMethod('email'); setIdentifier(''); setError(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  loginMethod === 'email' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod('phone'); setIdentifier(''); setError(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  loginMethod === 'phone' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Phone
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod('nid'); setIdentifier(''); setError(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  loginMethod === 'nid' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                National ID
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {loginMethod === 'email' && 'Email Address'}
                  {loginMethod === 'phone' && 'Phone Number'}
                  {loginMethod === 'nid' && 'National ID'}
                </label>
                <div className="relative">
                  {loginMethod === 'email' && <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />}
                  {loginMethod === 'phone' && <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />}
                  {loginMethod === 'nid' && <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />}
                  <input
                    type={loginMethod === 'email' ? 'email' : 'text'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    placeholder={
                      loginMethod === 'email' ? 'Enter your email' :
                      loginMethod === 'phone' ? 'e.g., +250788123456' :
                      'Enter your 16-digit ID'
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Password</label>
                  <a href="#" className="text-xs text-blue-600 font-semibold hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 text-center space-y-3">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button onClick={onNavigateToSignup} className="text-blue-600 font-semibold hover:underline">
                  Sign up for free
                </button>
              </p>
              <button 
                onClick={onBackToLanding}
                className="text-xs text-gray-400 hover:text-blue-600 transition font-medium"
              >
                ← Back to Landing Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
