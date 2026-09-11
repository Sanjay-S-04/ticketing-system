import React from 'react';
import { Bot, ArrowRight, Sparkles } from 'lucide-react';

export default function AILearningInsightCard({ onViewRecommendations }) {
  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-blue-800 relative overflow-hidden">
      {/* Background glowing gradient accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shrink-0 mt-0.5">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                🤖 AI Learning Insight
              </h3>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Intelligent Engine
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed max-w-3xl">
              "Your largest competency gap is <strong className="text-amber-300">Data Visualization (35% gap)</strong>. Based on your role as <span className="underline decoration-amber-400/60 underline-offset-2">Statistical Officer</span>, previous learning activity, and assessment performance, we recommend completing the Data Visualization learning path before your next competency assessment."
            </p>
          </div>
        </div>

        <button
          onClick={onViewRecommendations}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-98 hover:shadow-amber-500/25"
        >
          <span>View AI Recommendations</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
