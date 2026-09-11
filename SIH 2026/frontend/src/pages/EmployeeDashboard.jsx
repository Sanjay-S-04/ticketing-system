import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import KPICard from '../components/KPICard';
import AILearningInsightCard from '../components/AILearningInsightCard';
import FromLearningToCompetency from '../components/FromLearningToCompetency';
import { Award, CheckCircle2, BookOpen, FileCheck, ArrowRight, ExternalLink, Sparkles, Globe } from 'lucide-react';

export default function EmployeeDashboard({ setActiveTab, onStartCourse, onOpenIGOTModal }) {
  const { user } = useAuth();
  const [selectedIGOTCourse, setSelectedIGOTCourse] = useState(null);

  const competencyGaps = [
    { title: 'Python for Statistical Analysis', current: 60, required: 85, gap: 25, priority: 'High', color: 'bg-rose-500', badgeColor: 'bg-rose-100 text-rose-800' },
    { title: 'Data Visualization', current: 45, required: 80, gap: 35, priority: 'High', color: 'bg-rose-500', badgeColor: 'bg-rose-100 text-rose-800' },
    { title: 'Statistical Programming', current: 55, required: 80, gap: 25, priority: 'Medium', color: 'bg-amber-500', badgeColor: 'bg-amber-100 text-amber-800' },
    { title: 'Survey Methodology', current: 78, required: 85, gap: 7, priority: 'Achieved', color: 'bg-emerald-500', badgeColor: 'bg-emerald-100 text-emerald-800' }
  ];

  const recommendedCourses = [
    {
      id: 1,
      title: 'Python for Statistical Analysis',
      competency: 'Statistical Programming',
      reason: 'High competency gap detected',
      difficulty: 'Intermediate',
      duration: '4 hours',
      progress: 35,
      provider: 'iGOT Karmayogi',
      igotBadge: true,
      url: 'https://igotkarmayogi.gov.in/app/toc/course_python_stats'
    },
    {
      id: 2,
      title: 'Data Visualization for Official Statistics',
      competency: 'Data Visualization',
      reason: 'Largest competency gap (35%)',
      difficulty: 'Intermediate',
      duration: '5 hours',
      progress: 10,
      provider: 'iGOT Karmayogi',
      igotBadge: true,
      url: 'https://igotkarmayogi.gov.in/app/toc/course_datavis_gov'
    },
    {
      id: 3,
      title: 'Survey Methodology & Sampling Techniques',
      competency: 'Survey Methodology',
      reason: 'Official Statistics Role Core',
      difficulty: 'Advanced',
      duration: '6 hours',
      progress: 65,
      provider: 'MoSPI Internal Academy',
      igotBadge: false,
      url: '#'
    },
    {
      id: 4,
      title: 'Statistical Data Management',
      competency: 'Data Management',
      reason: 'Role relevance & governance',
      difficulty: 'Intermediate',
      duration: '3.5 hours',
      progress: 0,
      provider: 'iGOT Karmayogi',
      igotBadge: true,
      url: 'https://igotkarmayogi.gov.in/app/toc/course_datagov_mospi'
    }
  ];

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
            Official Statistical Officer Profile
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
            Good Morning, {user?.name || 'Vigneshwaran S'} 👋
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Continue your personalized capacity building journey in Official Statistics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('learning-path')}
            className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs border border-blue-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>View Learning Timeline</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('my-quizzes')}
            className="px-4 py-2.5 rounded-xl bg-[#0a2540] hover:bg-blue-900 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Take AI Quiz</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Overall Competency"
          value={`${user?.overall_competency || 72}%`}
          subtitle="Target Role Threshold: 85%"
          icon={Award}
          color="blue"
          trend="+4% this month"
        />
        <KPICard
          title="Competencies Achieved"
          value={user?.competency_achieved || "12 / 16"}
          subtitle="4 Required Gaps Remaining"
          icon={CheckCircle2}
          color="emerald"
        />
        <KPICard
          title="Active Learning Courses"
          value={user?.active_courses || "4"}
          subtitle="3 iGOT Karmayogi Courses"
          icon={BookOpen}
          color="amber"
        />
        <KPICard
          title="Latest Quiz Score"
          value={`${user?.latest_quiz_score || 85}%`}
          subtitle="Python Statistical Analysis"
          icon={FileCheck}
          color="purple"
          trend="Passed"
        />
      </div>

      {/* AI Insight Card */}
      <AILearningInsightCard onViewRecommendations={() => setActiveTab('ai-recommendations')} />

      {/* Top Competency Gap Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Your Top Competency Gaps</h3>
            <p className="text-xs text-slate-500">Identified based on Statistical Officer competency benchmarks</p>
          </div>
          <button
            onClick={() => setActiveTab('my-competency')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Competency Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5">
          {competencyGaps.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 flex items-center gap-2">
                  {item.title}
                  <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase ${item.badgeColor}`}>
                    {item.priority} Priority
                  </span>
                </span>
                <span className="text-slate-600 font-mono">
                  Current: {item.current}% • Req: {item.required}% (Gap: {item.gap}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative">
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-700`}
                  style={{ width: `${item.current}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recommended For You</h3>
            <p className="text-xs text-slate-500">Personalized courses aligned with iGOT Karmayogi learning framework</p>
          </div>
          <button
            onClick={() => setActiveTab('ai-recommendations')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
          >
            <span>View All AI Recommendations ({recommendedCourses.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-bold text-[10px] uppercase border border-purple-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Recommended
                  </span>
                  {course.igotBadge && (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-emerald-600" /> iGOT Karmayogi
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-slate-900 mb-1">{course.title}</h4>
                <p className="text-xs text-slate-500 italic mb-3">"{course.reason}"</p>

                <div className="flex flex-wrap gap-3 text-xs text-slate-600 font-medium mb-4">
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Difficulty: {course.difficulty}</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Duration: {course.duration}</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Competency: {course.competency}</span>
                </div>

                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                    <span>Learning Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${course.progress}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onStartCourse(course)}
                  className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition shadow-xs cursor-pointer text-center"
                >
                  Start Learning
                </button>
                {course.igotBadge && (
                  <button
                    onClick={() => onOpenIGOTModal(course)}
                    className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open in iGOT</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* From Learning to Competency Visual Component */}
      <FromLearningToCompetency />

      {/* iGOT Modal Simulation */}
      {selectedIGOTCourse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">iGOT Karmayogi Integration</h4>
              </div>
              <button onClick={() => setSelectedIGOTCourse(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              You are opening <strong>{selectedIGOTCourse.title}</strong> directly on the iGOT Karmayogi Portal. Your learning completion will automatically sync back to MoSPI Competency Platform.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 mb-4">
              Endpoint: {selectedIGOTCourse.url}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setSelectedIGOTCourse(null)} className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-xs text-slate-700">Cancel</button>
              <a href={selectedIGOTCourse.url} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1">
                <span>Proceed to iGOT</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
