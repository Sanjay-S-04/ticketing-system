import React from 'react';
import { CheckCircle2, PlayCircle, Circle, Sparkles, ArrowRight, Award, ExternalLink } from 'lucide-react';

export default function LearningPathPage({ setActiveTab, onStartCourse, onOpenIGOTModal }) {
  const steps = [
    {
      step: 1,
      title: 'Statistics Fundamentals',
      competency: 'Statistics',
      status: 'completed',
      badge: 'Completed',
      duration: '4 hours',
      score: '90%',
      desc: 'Mastered basic sampling, distributions, and descriptive stats.'
    },
    {
      step: 2,
      title: 'Python for Statistical Analysis',
      competency: 'Statistical Programming',
      status: 'active',
      badge: 'AI Recommended',
      duration: '4 hours',
      progress: '35%',
      desc: 'Currently in progress. Pandas dataframes, NumPy vectors, and cleaning.',
      igot: true
    },
    {
      step: 3,
      title: 'Data Visualization for Official Statistics',
      competency: 'Data Visualization',
      status: 'pending',
      badge: 'Next Step',
      duration: '5 hours',
      desc: 'Seaborn dashboards, CPI charts, and official MoSPI layout standards.',
      igot: true
    },
    {
      step: 4,
      title: 'Advanced Statistical Programming',
      competency: 'Data Analysis',
      status: 'pending',
      badge: 'Upcoming',
      duration: '6 hours',
      desc: 'Regression modeling, VIF metrics, and National Account aggregations.'
    },
    {
      step: 5,
      title: 'Final Competency Assessment',
      competency: 'Official Statistics Certification',
      status: 'pending',
      badge: 'Final Evaluation',
      duration: '1 hour',
      desc: 'Comprehensive AI-evaluated assessment for Statistical Officer competency milestone.'
    }
  ];

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
            Role Roadmap • Statistical Officer
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
            Your Personalized Learning Path
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-sequenced learning path based on your competency gap analysis
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-2xl text-right">
          <span className="text-[10px] font-bold uppercase text-blue-700 tracking-wider">Overall Progress</span>
          <div className="text-2xl font-black text-blue-900">42%</div>
          <span className="text-[10px] font-semibold text-slate-600">2 of 5 Milestones Active</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Learning Path Progress</span>
          <span className="text-blue-700 font-extrabold">42% Completed</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-600 to-amber-500 rounded-full" style={{ width: '42%' }}></div>
        </div>
      </div>

      {/* Visual Timeline Section */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-8 relative">
          {/* Vertical Connecting Line */}
          <div className="absolute left-6 top-8 bottom-8 w-1 bg-slate-200 z-0 hidden md:block"></div>

          {steps.map((item) => {
            const isCompleted = item.status === 'completed';
            const isActive = item.status === 'active';

            return (
              <div key={item.step} className="relative z-10 flex flex-col md:flex-row items-start gap-6 group">
                {/* Step Circle Icon */}
                <div className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 shadow-md transition-transform duration-200 group-hover:scale-105
                  ${isCompleted ? 'bg-emerald-600 text-white' : isActive ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-100' : 'bg-slate-100 text-slate-400 border border-slate-300'}
                `}>
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : isActive ? <PlayCircle className="w-6 h-6 animate-pulse" /> : <Circle className="w-6 h-6" />}
                </div>

                {/* Step Content Card */}
                <div className={`
                  flex-1 p-5 rounded-2xl border transition-all duration-200 w-full
                  ${isActive ? 'bg-blue-50/50 border-amber-400 shadow-md ring-1 ring-amber-400/30' : isCompleted ? 'bg-slate-50/60 border-slate-200' : 'bg-white border-slate-200'}
                `}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">STEP {item.step}</span>
                      <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      {isActive && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px] uppercase border border-amber-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600" /> AI Recommended
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase border border-emerald-300">
                          ✓ Completed ({item.score})
                        </span>
                      )}
                      {!isCompleted && !isActive && (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px] uppercase border border-slate-200">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-3">{item.desc}</p>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-slate-500 font-medium">
                      <span>Duration: {item.duration}</span>
                      <span>Competency: {item.competency}</span>
                      {item.igot && <span className="text-emerald-700 font-bold">iGOT Karmayogi Course</span>}
                    </div>

                    {isActive && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onStartCourse({ title: item.title, competency: item.competency })}
                          className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          Continue Learning
                        </button>
                        {item.igot && (
                          <button
                            onClick={() => onOpenIGOTModal({ title: item.title, url: 'https://igotkarmayogi.gov.in/app/toc/course_python_stats' })}
                            className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 flex items-center gap-1 cursor-pointer"
                          >
                            <span>iGOT</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
