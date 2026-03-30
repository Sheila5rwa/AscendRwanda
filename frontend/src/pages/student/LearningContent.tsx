import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, BookOpen, FileText, CheckCircle, 
  AlertCircle, ArrowRight, Loader2, Award 
} from 'lucide-react';
import api from '../../utils/api';

const LearningContent: React.FC = () => {
  const { moduleId, contentId } = useParams();
  const navigate = useNavigate();
  
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Quiz State
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await api.get(`/modules/${moduleId}`);
        const found = res.data.Contents.find((c: any) => String(c.content_id) === contentId);
        if (!found) throw new Error('Content not found');
        setContent(found);
        
        // If it's a note, mark as completed immediately
        if (found.content_type === 'note') {
          await api.post('/students/content/complete', { content_id: found.content_id });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [moduleId, contentId]);

  const handleQuizSubmit = async () => {
    setSubmitting(true);
    try {
      const formattedAnswers: Record<number, string> = {};
      content.Questions.forEach((q: any, idx: number) => {
        formattedAnswers[q.question_id] = quizAnswers[idx];
      });

      const res = await api.post('/students/submit-attempt', {
        content_id: content.content_id,
        answers: formattedAnswers,
      });
      setQuizResult(res.data);
    } catch (err: any) {
      setError('Failed to submit attempt');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      <p className="font-bold text-gray-400">Loading lesson...</p>
    </div>
  );

  if (error || !content) return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <AlertCircle className="w-12 h-12 text-red-500" />
      <p className="font-bold text-gray-700">{error || 'Something went wrong'}</p>
      <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">Go Back</button>
    </div>
  );

  const isQuiz = content.content_type === 'quiz' || content.content_type === 'exam';

  return (
    <div className="h-full flex flex-col bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/student/my-courses`)} 
            className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="font-black text-gray-900 text-lg uppercase tracking-tight">{content.title}</h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isQuiz ? 'bg-orange-500' : 'bg-blue-500'}`} />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{content.content_type}</span>
            </div>
          </div>
        </div>
        
        {isQuiz && !quizResult && (
          <div className="px-6 py-2 bg-orange-50 rounded-2xl border border-orange-100">
             <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Question {quizStep + 1} of {content.Questions?.length}</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {!isQuiz ? (
          /* Reading Note View */
          <div className="max-w-4xl mx-auto">
             <div 
               className="prose prose-blue max-w-none text-gray-700 leading-relaxed rich-content"
               dangerouslySetInnerHTML={{ __html: content.content_data }}
             />
             <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                      <CheckCircle className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-sm font-black text-gray-900 uppercase">Lesson Completed</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">This note is marked as read.</p>
                   </div>
                </div>
                <button 
                  onClick={() => navigate('/student/my-courses')}
                  className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                >
                   Next Lesson <ArrowRight className="w-4 h-4" />
                </button>
             </div>
          </div>
        ) : (
          /* Quiz / Exam View */
          <div className="max-w-2xl mx-auto py-8">
            {!quizResult ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {content.Questions && content.Questions[quizStep] && (
                  <>
                    <div className="mb-8">
                       <h3 className="text-xl font-bold text-gray-800 leading-tight mb-2">
                         {content.Questions[quizStep].question_text}
                       </h3>
                       <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Select the correct answer below</p>
                    </div>

                    <div className="grid gap-3 mb-10">
                      {(() => {
                        let opts = [];
                        try {
                          opts = typeof content.Questions[quizStep].options === 'string' 
                            ? JSON.parse(content.Questions[quizStep].options) 
                            : (content.Questions[quizStep].options || []);
                        } catch (e) { opts = []; }
                        
                        return opts.map((opt: string, i: number) => (
                          <button
                            key={i}
                            onClick={() => setQuizAnswers(prev => ({ ...prev, [quizStep]: opt }))}
                            className={`w-full text-left p-5 rounded-3xl border-2 transition-all group relative overflow-hidden ${
                              quizAnswers[quizStep] === opt 
                                ? 'border-blue-600 bg-blue-50/50' 
                                : 'border-gray-50 hover:border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                               <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                                 quizAnswers[quizStep] === opt ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-gray-100 text-gray-400'
                               }`}>
                                 {String.fromCharCode(65 + i)}
                               </div>
                               <span className={`text-sm font-bold ${quizAnswers[quizStep] === opt ? 'text-blue-900' : 'text-gray-600'}`}>{opt}</span>
                            </div>
                            {quizAnswers[quizStep] === opt && <div className="absolute top-0 right-0 w-8 h-8 bg-blue-600 rounded-bl-3xl flex items-center justify-end p-2 text-white"><CheckCircle className="w-3 h-3" /></div>}
                          </button>
                        ));
                      })()}
                    </div>

                    <div className="flex gap-4">
                       {quizStep > 0 && (
                         <button 
                           onClick={() => setQuizStep(s => s - 1)}
                           className="flex-1 py-4 rounded-3xl border-2 border-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                         >
                           Previous
                         </button>
                       )}
                       
                       {quizStep < content.Questions.length - 1 ? (
                         <button 
                           disabled={!quizAnswers[quizStep]}
                           onClick={() => setQuizStep(s => s + 1)}
                           className="flex-[2] bg-blue-600 text-white py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-30 flex items-center justify-center gap-2"
                         >
                           Next Question <ArrowRight className="w-4 h-4" />
                         </button>
                       ) : (
                         <button 
                           disabled={!quizAnswers[quizStep] || submitting}
                           onClick={handleQuizSubmit}
                           className="flex-[2] bg-emerald-600 text-white py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-30 items-center justify-center flex gap-2"
                         >
                           {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                           {submitting ? 'Submitting...' : 'Finish Attempt'}
                         </button>
                       )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Quiz Result View */
              <div className="text-center animate-in zoom-in-95 duration-500">
                <div className={`w-32 h-32 rounded-full mx-auto mb-8 flex items-center justify-center ${quizResult.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                   {quizResult.passed ? <CheckCircle className="w-16 h-16" /> : <AlertCircle className="w-16 h-16" />}
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-2">{quizResult.passed ? 'Excellent Work!' : 'Almost There!'}</h3>
                <p className="text-gray-400 font-bold uppercase tracking-widest mb-10">You scored {quizResult.score} out of {quizResult.totalPossible}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-10">
                   <div className="bg-white border-2 border-gray-50 p-6 rounded-[32px]">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Percentage</p>
                      <p className={`text-2xl font-black ${quizResult.passed ? 'text-emerald-600' : 'text-orange-500'}`}>{quizResult.percentage}%</p>
                   </div>
                   <div className="bg-white border-2 border-gray-50 p-6 rounded-[32px]">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                      <p className={`text-2xl font-black ${quizResult.passed ? 'text-emerald-600' : 'text-red-500'}`}>{quizResult.passed ? 'PASSED' : 'FAILED'}</p>
                   </div>
                </div>

                {quizResult.certificate && (
                  <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-8 rounded-[40px] text-white flex flex-col items-center gap-4 mb-10 shadow-xl shadow-orange-100">
                     <Award className="w-12 h-12" />
                     <div className="text-center">
                        <h4 className="font-black text-lg uppercase tracking-tight">Certification Earned!</h4>
                        <p className="text-white/80 text-xs font-bold uppercase tracking-widest">You have mastered this module</p>
                     </div>
                     <button 
                       onClick={() => navigate('/student/certificates')}
                       className="bg-white text-orange-600 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg"
                     >
                       View Certificate
                     </button>
                  </div>
                )}

                <div className="flex gap-4">
                   <button 
                     onClick={() => navigate('/student/my-courses')}
                     className="flex-1 bg-gray-900 text-white py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                   >
                     Back to Modules
                   </button>
                   {!quizResult.passed && content.content_type === 'quiz' && (
                     <button 
                        onClick={() => { setQuizResult(null); setQuizStep(0); setQuizAnswers({}); }}
                        className="flex-1 bg-blue-600 text-white py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                     >
                        Try Again
                     </button>
                   )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningContent;
