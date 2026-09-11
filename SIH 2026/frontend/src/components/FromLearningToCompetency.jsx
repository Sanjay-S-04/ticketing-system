import React from 'react';
import { Target, Search, Sparkles, BookOpen, RotateCcw, TrendingUp, ArrowRight } from 'lucide-react';

export default function FromLearningToCompetency() {
  const steps = [
    { title: 'ASSESS', desc: 'Competency Profiling', icon: Target, color: 'bg-blue-600' },
    { title: 'IDENTIFY GAP', desc: 'Role Matrix Mapping', icon: Search, color: 'bg-rose-600' },
    { title: 'PERSONALIZE', desc: 'AI Recommendation', icon: Sparkles, color: 'bg-purple-600' },
    { title: 'LEARN', desc: 'iGOT Karmayogi Hub', icon: BookOpen, color: 'bg-amber-600' },
    { title: 'ASSESS AGAIN', desc: 'AI-Generated Quiz', icon: RotateCcw, color: 'bg-indigo-600' },
    { title: 'IMPROVE', desc: 'Competency Achieved', icon: TrendingUp, color: 'bg-emerald-600' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
            Adaptive Learning Engine
          </span>
          <h3 className="text-xl font-bold text-slate-900 mt-2">
            From Learning to Competency
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuous capacity building workflow for India's Official Statistical System
          </p>
        </div>
        <div className="text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          🔄 Dynamic Feedback Loop Active
        </div>
      </div>

      {/* Interactive Process Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="relative flex flex-col items-center text-center p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-blue-300 hover:bg-blue-50/40 transition group">
              <div className={`w-10 h-10 rounded-xl ${step.color} text-white flex items-center justify-center shadow-md mb-2 group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold text-slate-900 tracking-wider uppercase">
                {step.title}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 font-medium leading-tight">
                {step.desc}
              </span>
              {idx < steps.length - 1 && (
                <ArrowRight className="hidden md:block absolute -right-3 top-6 w-4 h-4 text-slate-300 z-10" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
