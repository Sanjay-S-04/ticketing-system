import React, { useState } from 'react';
import { Sparkles, Globe, ArrowRight, ExternalLink, Bot, Filter, Award } from 'lucide-react';

export default function AIRecommendationsPage({ onStartCourse, onOpenIGOTModal }) {
  const [filter, setFilter] = useState('All');

  const recommendations = [
    {
      id: 1,
      title: 'Python for Statistical Analysis',
      competency: 'Statistical Programming',
      gapMatched: '25% Gap in Python',
      difficulty: 'Intermediate',
      duration: '4 hours',
      progress: 35,
      provider: 'iGOT Karmayogi',
      igotBadge: true,
      reason: 'High competency gap detected (25% below required role level). Essential for statistical automation.',
      url: 'https://igotkarmayogi.gov.in/app/toc/course_python_stats'
    },
    {
      id: 2,
      title: 'Data Visualization for Official Statistics',
      competency: 'Data Visualization',
      gapMatched: '35% Gap in Data Vis',
      difficulty: 'Intermediate',
      duration: '5 hours',
      progress: 10,
      provider: 'iGOT Karmayogi',
      igotBadge: true,
      reason: 'Largest competency gap (35%). Critical for presenting national economic indicators.',
      url: 'https://igotkarmayogi.gov.in/app/toc/course_datavis_gov'
    },
    {
      id: 3,
      title: 'Survey Methodology & Sampling Techniques',
      competency: 'Survey Methodology',
      gapMatched: '7% Gap in Methodology',
      difficulty: 'Advanced',
      duration: '6 hours',
      progress: 65,
      provider: 'MoSPI Internal Academy',
      igotBadge: false,
      reason: 'Core requirement for Statistical Officer role. Align with NSS survey standards.',
      url: '#'
    },
    {
      id: 4,
      title: 'Statistical Data Management & Governance',
      competency: 'Data Management',
      gapMatched: '10% Gap in Management',
      difficulty: 'Intermediate',
      duration: '3.5 hours',
      progress: 0,
      provider: 'iGOT Karmayogi',
      igotBadge: true,
      reason: 'Recommended to ensure data integrity and security compliance in official statistics.',
      url: 'https://igotkarmayogi.gov.in/app/toc/course_datagov_mospi'
    }
  ];

  const filtered = recommendations.filter(item => {
    if (filter === 'iGOT') return item.igotBadge;
    if (filter === 'High Gap') return item.gapMatched.includes('35%') || item.gapMatched.includes('25%');
    return true;
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0a2540] to-blue-900 text-white rounded-2xl p-6 shadow-md border border-blue-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px] uppercase flex items-center gap-1">
              <Bot className="w-3.5 h-3.5" /> AI Recommendation Engine
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Personalized AI Learning Recommendations
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Calculated by evaluating your Statistical Officer role requirements, current assessment scores, and iGOT Karmayogi framework alignment.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-700/60">
          <Filter className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-300 font-semibold">Filter:</span>
          {['All', 'iGOT', 'High Gap'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filter === f ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Recommendation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] uppercase border border-rose-200">
                  {item.gapMatched}
                </span>
                {item.igotBadge && (
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-emerald-600" /> iGOT Karmayogi
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1.5">{item.title}</h3>

              {/* Rationale Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 mb-4 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">AI Rationale: </span>
                  <span>{item.reason}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600 mb-4">
                <span className="bg-slate-100 px-2.5 py-1 rounded-lg">Difficulty: {item.difficulty}</span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-lg">Duration: {item.duration}</span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-lg">Competency: {item.competency}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => onStartCourse(item)}
                className="flex-1 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition cursor-pointer text-center"
              >
                Start Course Now
              </button>
              {item.igotBadge && (
                <button
                  onClick={() => onOpenIGOTModal(item)}
                  className="py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Open iGOT</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
