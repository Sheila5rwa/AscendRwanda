import React from 'react';
import { CheckCircle, BookOpen, Clock, Users, ArrowRight, Star } from 'lucide-react';

const courses = [
  {
    id: 1,
    title: 'Computer Literacy',
    description: 'Master the essentials of modern computing, from file management to professional software suites.',
    duration: '8 Weeks',
    students: '1.2k+',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600',
    features: ['Hardware Basics', 'Office Productivity', 'Internet Safety']
  },
  {
    id: 2,
    title: 'English for the Workplace',
    description: 'Develop the professional communication skills needed to excel in international business environments.',
    duration: '10 Weeks',
    students: '850+',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600',
    features: ['Professional Emails', 'Presentation Skills', 'Business Vocabulary']
  },
  {
    id: 3,
    title: 'Graphic Design Fundamentals',
    description: 'Learn the principles of visual communication and master industry-standard design tools.',
    duration: '12 Weeks',
    students: '640+',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=600',
    features: ['Color Theory', 'Typography', 'Logo Design']
  }
];

interface EnrollmentProps {
  onGetStarted: () => void;
}

const Enrollment: React.FC<EnrollmentProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/5 -skew-x-12 transform translate-x-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
              <Star className="w-3 h-3 fill-current" /> Transform Your Career
            </span>
            <h1 className="text-5xl font-black text-gray-900 leading-tight mb-6">
              Empowering Rwanda's <span className="text-blue-600">Next Generation</span> of Professionals
            </h1>
            <p className="text-xl text-gray-500 mb-10 leading-relaxed">
              Join thousands of students across Rwanda who are gaining practical skills, 
              connecting with industry mentors, and launching successful careers.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={onGetStarted}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 flex items-center gap-2"
              >
                Browse All Courses <ArrowRight className="w-5 h-5" />
              </button>
              <button className="bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition">
                Success Stories
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Courses */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Featured Courses</h2>
            <p className="text-gray-500">Pick a module that suits your career path and start learning today.</p>
          </div>
          <button className="text-blue-600 font-bold hover:underline">View All Programs</button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 group">
              <div className="h-56 overflow-hidden relative">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-sm">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-bold text-gray-800">{course.rating}</span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition">{course.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center gap-6 mb-8 text-sm text-gray-400">
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {course.duration}</div>
                  <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {course.students} Students</div>
                </div>

                <div className="space-y-3 mb-8">
                  {course.features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {f}
                    </div>
                  ))}
                </div>

                <button 
                  onClick={onGetStarted}
                  className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition duration-300"
                >
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-gray-900 mt-32 py-24 rounded-[4rem] mx-4 sm:mx-8 lg:mx-20 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-black text-white mb-6">Why Start Your Journey With Ascend Rwanda?</h2>
          <p className="text-gray-400 text-lg mb-16 max-w-2xl mx-auto">
            We provide more than just lessons; we provide a complete ecosystem for professional growth.
          </p>
          
          <div className="grid md:grid-cols-3 gap-12 text-left">
            {[
              { title: 'Industry Mentors', desc: 'Get direct guidance from experts working in top Rwandan and international companies.', icon: <Users className="w-8 h-8" /> },
              { title: 'Practical Learning', desc: 'Our courses focus on real-world application, not just theory. Build projects that matter.', icon: <BookOpen className="w-8 h-8" /> },
              { title: 'Certification', desc: 'Earn verifiable digital certificates that are recognized by employers across the region.', icon: <CheckCircle className="w-8 h-8" /> }
            ].map((item, idx) => (
              <div key={idx}>
                <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
                  {item.icon}
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{item.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enrollment;
