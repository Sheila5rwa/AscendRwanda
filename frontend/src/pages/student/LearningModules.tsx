import React, { useState, useEffect } from 'react';
import { 
  BookOpen, CheckCircle, 
  ArrowRight, Loader2, Search, Filter 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const LearningModules: React.FC = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [modRes, progRes] = await Promise.all([
        api.get('/modules'),
        api.get('/students/progress')
      ]);
      setModules(modRes.data || []);
      setProgress(progRes.data || []);
    } catch (e) {
      console.error('Failed to load catalog', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnroll = async (moduleId: number) => {
    setEnrolling(moduleId);
    try {
      await api.post('/students/start-module', { module_id: moduleId });
      // Redirect to the now-enrolled modules list
      navigate('/student/my-courses');
    } catch (e) {
      console.error('Enrollment failed', e);
      alert('Failed to enroll. Please try again.');
    } finally {
      setEnrolling(null);
    }
  };

  const getStatus = (moduleId: number) => {
    const p = progress.find(p => p.module_id === moduleId);
    if (!p) return 'not_started';
    return p.status;
  };

  const filtered = modules.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="h-full overflow-y-auto pb-8 pr-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">Course Discover</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Explore and enroll in new learning modules</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for a course topic..."
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-semibold shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
          />
        </div>
        <button className="bg-white border border-gray-100 p-3.5 rounded-2xl shadow-sm text-gray-400 hover:text-blue-600 transition-all">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-2 gap-6">
        {filtered.length === 0 && (
          <div className="col-span-2 py-20 text-center bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
            <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-bold">No modules matched your search</p>
          </div>
        )}
        
        {filtered.map((m) => {
          const status = getStatus(m.module_id);
          return (
            <div key={m.module_id} className="group bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              {/* Background Decor */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full translate-x-16 -translate-y-8 group-hover:scale-110 transition-transform" />
              
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-100 group-hover:rotate-6 transition-transform">
                  <BookOpen className="w-7 h-7" />
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-black text-gray-800 mb-2 leading-tight min-h-[3rem] line-clamp-2">{m.title}</h3>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-wider">
                    <span className="text-gray-400">{m.language}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="text-blue-600">{m.duration_minutes || '--'} Min Duration</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  {status === 'not_started' ? (
                    <button 
                      onClick={() => handleEnroll(m.module_id)}
                      disabled={enrolling === m.module_id}
                      className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-50 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 mt-2"
                    >
                      {enrolling === m.module_id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        <>
                          Enroll Now <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center justify-between w-full mt-2">
                       <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                        status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {status === 'completed' ? <><CheckCircle className="w-3 h-3 inline mr-1" /> Completed</> : 'In Progress'}
                      </span>
                      <button 
                        onClick={() => navigate('/student/dashboard')}
                        className="text-blue-600 font-black text-xs hover:underline flex items-center gap-1"
                      >
                        {status === 'completed' ? 'Review' : 'Continue'} <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningModules;
