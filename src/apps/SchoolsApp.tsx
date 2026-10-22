import React, { useState } from 'react';
import { GraduationCap, ChevronRight, BookOpen, Users, CheckCircle, ArrowLeft } from 'lucide-react';
import { useLearningStore } from '../store/learningStore';
import { useActivityStore } from '../store/activityStore';

const SCHOOLS = [
  {
    id: 'hallbridge',
    name: 'Hallbridge University',
    type: 'University',
    country: 'United Kingdom',
    color: 'bg-hk-blue',
    accent: 'text-hk-blue',
    borderAccent: 'border-hk-blue/30',
    description: 'A research-intensive university offering programmes in STEM, humanities, social sciences, and professional disciplines.',
    departments: ['School of Computing & AI', 'Faculty of Natural Sciences', 'Department of Mathematics', 'School of Engineering'],
    courses: [
      { code: 'CS101', name: 'Introduction to Computer Science', credits: 20 },
      { code: 'PHYS201', name: 'Classical Mechanics', credits: 20 },
      { code: 'MATH301', name: 'Linear Algebra & Calculus', credits: 20 },
      { code: 'AI401', name: 'Machine Learning Fundamentals', credits: 20 },
    ],
    students: '12,400',
    founded: '1892',
  },
  {
    id: 'meridian',
    name: 'Meridian Secondary School',
    type: 'Secondary School',
    country: 'Nigeria',
    color: 'bg-hk-emerald',
    accent: 'text-hk-emerald',
    borderAccent: 'border-hk-emerald/30',
    description: 'A secondary school providing quality education from JSS1 through SS3 with strong emphasis on STEM and critical thinking.',
    departments: ['Science Department', 'Mathematics Department', 'Languages & Humanities', 'Technology & ICT'],
    courses: [
      { code: 'PHY-SS2', name: 'Further Physics (SS2)', credits: 0 },
      { code: 'MATH-SS3', name: 'Advanced Mathematics (SS3)', credits: 0 },
      { code: 'CHEM-SS1', name: 'Chemistry Fundamentals (SS1)', credits: 0 },
      { code: 'ICT-JS3', name: 'Introduction to Programming', credits: 0 },
    ],
    students: '1,850',
    founded: '2008',
  },
  {
    id: 'nova',
    name: 'Nova Technical Academy',
    type: 'Specialist Academy',
    country: 'Ghana',
    color: 'bg-orange-500',
    accent: 'text-orange-400',
    borderAccent: 'border-orange-500/30',
    description: 'A specialist technical academy focused on software engineering, data science, electronics, and applied computing for working professionals.',
    departments: ['Software Engineering Track', 'Data Science Track', 'Electronics & Embedded Systems', 'AI & Robotics'],
    courses: [
      { code: 'SWE-001', name: 'Full-Stack Web Development', credits: 40 },
      { code: 'DS-001', name: 'Data Science with Python', credits: 40 },
      { code: 'ES-001', name: 'Embedded Systems & Arduino', credits: 30 },
      { code: 'AI-001', name: 'Applied AI & Robotics', credits: 40 },
    ],
    students: '620',
    founded: '2019',
  },
];

export const SchoolsApp: React.FC = () => {
  const { context, enrollSchool, unenrollSchool } = useLearningStore();
  const { addEvent } = useActivityStore();
  const [selectedSchool, setSelectedSchool] = useState<typeof SCHOOLS[0] | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [justEnrolled, setJustEnrolled] = useState<string | null>(null);

  const handleEnroll = (schoolId: string) => {
    setEnrolling(true);
    setTimeout(() => {
      enrollSchool(schoolId);
      addEvent('SCHOOL_ENROLLED', 'schools', { schoolId });
      setEnrolling(false);
      setJustEnrolled(schoolId);
      setTimeout(() => setJustEnrolled(null), 3000);
    }, 1200);
  };

  const isEnrolled = (id: string) => context.enrolledSchools.includes(id);

  return (
    <div className="h-full flex flex-col bg-hk-bg">
      <div className="flex items-center gap-3 px-6 py-3 border-b border-hk-border bg-hk-surface/50">
        {selectedSchool && (
          <button onClick={() => setSelectedSchool(null)} className="text-hk-muted hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </button>
        )}
        <GraduationCap size={18} className="text-cyan-400" />
        <h1 className="text-white font-semibold">
          {selectedSchool ? selectedSchool.name : 'Digital Schools'}
        </h1>
        {!selectedSchool && (
          <span className="text-hk-muted text-xs ml-1">Demonstration institutions</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {!selectedSchool ? (
          <div className="max-w-3xl">
            <p className="text-hk-muted text-sm mb-6">
              These are demonstration institutions. Each school is a digital environment within HK OS — not the OS itself.
              You can leave a school's resources and return to Code Lab, Simulation, or any HK OS application at any time.
            </p>
            <div className="grid gap-4">
              {SCHOOLS.map(school => (
                <button
                  key={school.id}
                  onClick={() => setSelectedSchool(school)}
                  className={`text-left p-5 rounded-xl border bg-hk-surface transition-all hover:border-opacity-80 ${
                    isEnrolled(school.id) ? school.borderAccent : 'border-hk-border'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${school.color} flex items-center justify-center shrink-0`}>
                      <GraduationCap size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-semibold">{school.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-hk-bg text-hk-muted border border-hk-border">{school.type}</span>
                        {isEnrolled(school.id) && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${school.accent} bg-opacity-10 flex items-center gap-1`}>
                            <CheckCircle size={9} /> Enrolled
                          </span>
                        )}
                      </div>
                      <p className="text-hk-muted text-xs mt-1">{school.country} · {school.students} students · Est. {school.founded}</p>
                      <p className="text-hk-muted text-xs mt-2 line-clamp-2">{school.description}</p>
                    </div>
                    <ChevronRight size={16} className="text-hk-muted mt-1 shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl">
            {/* School details */}
            <div className={`p-5 rounded-xl border ${selectedSchool.borderAccent} bg-hk-surface mb-6`}>
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl ${selectedSchool.color} flex items-center justify-center`}>
                  <GraduationCap size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-white font-bold text-lg">{selectedSchool.name}</h2>
                  <p className="text-hk-muted text-sm">{selectedSchool.type} · {selectedSchool.country}</p>
                  <p className="text-hk-muted text-xs mt-2">{selectedSchool.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center"><p className="text-white font-bold">{selectedSchool.students}</p><p className="text-hk-muted text-xs">Students</p></div>
                <div className="text-center"><p className="text-white font-bold">{selectedSchool.founded}</p><p className="text-hk-muted text-xs">Founded</p></div>
                <div className="text-center"><p className="text-white font-bold">{selectedSchool.courses.length}</p><p className="text-hk-muted text-xs">Courses</p></div>
              </div>
            </div>

            {/* Departments */}
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2"><Users size={14} /> Academic Departments</h3>
              <div className="grid grid-cols-2 gap-2">
                {selectedSchool.departments.map((dept, i) => (
                  <div key={i} className="px-3 py-2 rounded-lg bg-hk-surface border border-hk-border text-xs text-hk-muted">{dept}</div>
                ))}
              </div>
            </div>

            {/* Courses */}
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2"><BookOpen size={14} /> Available Courses</h3>
              <div className="space-y-2">
                {selectedSchool.courses.map((course, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-hk-surface border border-hk-border">
                    <span className={`font-mono text-xs ${selectedSchool.accent} shrink-0`}>{course.code}</span>
                    <span className="text-white text-sm flex-1">{course.name}</span>
                    {course.credits > 0 && <span className="text-hk-muted text-xs">{course.credits} credits</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Enroll button */}
            {!isEnrolled(selectedSchool.id) ? (
              <button
                onClick={() => handleEnroll(selectedSchool.id)}
                disabled={enrolling}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                  enrolling ? 'bg-hk-border text-hk-muted cursor-wait' : `${selectedSchool.color} text-white hover:opacity-90`
                }`}
              >
                {enrolling ? 'Enrolling...' : `Enroll in ${selectedSchool.name}`}
              </button>
            ) : (
              <div className="space-y-3">
                {justEnrolled === selectedSchool.id && (
                  <div className={`p-3 rounded-xl border ${selectedSchool.borderAccent} ${selectedSchool.accent} bg-opacity-5 text-sm flex items-center gap-2 animate-fadeIn`}>
                    <CheckCircle size={14} /> Successfully enrolled!
                  </div>
                )}
                <div className={`flex items-center justify-center gap-2 py-3 rounded-xl border ${selectedSchool.borderAccent} ${selectedSchool.accent} text-sm font-medium`}>
                  <CheckCircle size={14} /> Enrolled
                </div>
                <button
                  onClick={() => unenrollSchool(selectedSchool.id)}
                  className="w-full py-2 text-xs text-hk-muted hover:text-hk-red transition-colors"
                >
                  Withdraw enrollment
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
