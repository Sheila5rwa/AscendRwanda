import React, { useState } from 'react';
import { Mail, Lock, User, UserPlus, Award, Loader2, Calendar, Shield } from 'lucide-react';
import { UserRole } from '../components/Sidebar';
import api from '../utils/api';

interface SignupProps {
  onSignup: (role: UserRole) => void;
  onNavigateToLogin: () => void;
  onBackToLanding: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup, onNavigateToLogin, onBackToLanding }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    dob: '',
    guardian_id: '',
    role: 'student' as UserRole,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUnder16, setIsUnder16] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'dob') {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      setIsUnder16(age < 16 && age >= 0);
    }
  };

  const setRole = (role: UserRole) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/signup', formData);
      const signinRes = await api.post('/auth/signin', {
        email: formData.email,
        password: formData.password
      });
      
      const { accessToken, role } = signinRes.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(signinRes.data));
      
      onSignup(role);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef0f8] flex items-center justify-center p-4">
      <div className="w-full max-w-[1000px] h-[600px] bg-white rounded-3xl shadow-2xl flex overflow-hidden">
        {/* Left Side: Visual/Branding */}
        <div className="hidden md:flex flex-col flex-1 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-800 p-12 text-white relative overflow-hidden">
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-black/20 to-transparent"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-purple-600">
                <Award className="w-7 h-7" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Ascend Rwanda</h1>
            </div>
            
            <h2 className="text-4xl font-extrabold mb-4 leading-tight">
              Start Your Journey With Us Today.
            </h2>
            <p className="text-purple-100 text-lg max-w-md">
              Create an account to unlock personalized learning paths, professional mentorship, and exclusive job opportunities.
            </p>
          </div>
          
          {/* Decorative Elements */}
          <div className="mt-auto relative z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-purple-700 flex items-center justify-center text-xs font-bold">AB</div>
                  <div className="w-8 h-8 rounded-full bg-orange-400 border-2 border-purple-700 flex items-center justify-center text-xs font-bold">CD</div>
                  <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-purple-700 flex items-center justify-center text-xs font-bold">EF</div>
                </div>
                <p className="text-sm font-semibold">Join the community</p>
              </div>
              <p className="text-xs text-purple-200">Connect with thousands of peers and mentors who are actively shaping the future of Rwanda.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Signup Form */}
        <div className="flex-1 flex flex-col justify-center p-8 md:p-14 bg-white overflow-y-auto">
          <div className="w-full max-w-sm mx-auto">
            <div className="mb-6 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
              <p className="text-gray-500">Sign up to get started.</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div className="flex bg-gray-100 p-1 rounded-xl mb-2">
                {(['student', 'mentor', 'employer'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${formData.role === r ? 'bg-white text-purple-600 shadow shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      placeholder="Amina"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      placeholder="Uwimana"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                  />
                </div>
              </div>

              {isUnder16 && (
                <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 mb-3">
                  <p className="text-xs text-orange-800 font-semibold mb-2">
                    Since you are under 16, a Guardian ID is required.
                  </p>
                  <label className="block text-sm font-semibold text-orange-900 mb-1">Guardian ID</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
                    <input
                      type="text"
                      name="guardian_id"
                      value={formData.guardian_id}
                      onChange={handleChange}
                      required={isUnder16}
                      placeholder="e.g. 1198080012345678"
                      className="w-full pl-10 pr-4 py-2 border border-orange-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-shadow"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button onClick={onNavigateToLogin} className="text-purple-600 font-semibold hover:underline">
                  Sign in
                </button>
              </p>
              <button 
                onClick={onBackToLanding}
                className="text-xs text-gray-400 hover:text-purple-600 transition font-medium"
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

export default Signup;
