import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, CheckCircle2, RotateCcw, ArrowRight, Bot, Sparkles, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QuizResultsPage({ results, onContinueLearning, onRetakeQuiz, onViewCompetency }) {
  const { updateEmployeeCompetency } = useAuth();

  const scorePct = results?.scorePct || 80;
  const correctCount = results?.correctCount || 8;
  const totalQuestions = results?.totalQuestions || 10;
  const topicBreakdown = results?.topicBreakdown || [
    { topic: "Python Basics", score: 90 },
    { topic: "Data Handling", score: 80 },
    { topic: "Data Visualization", score: 60 },
    { topic: "Statistical Programming", score: 85 }
  ];
  const aiFeedback = results?.aiFeedback || "You performed well in Python fundamentals but need additional practice in Data Visualization. We recommend revisiting the Data Visualization module and attempting the practice quiz.";

  useEffect(() => {
    // Trigger festive confetti if score is high
    if (scorePct >= 70) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Fallback
      }
    }
    // Dynamically update Vigneshwaran S's overall competency score
    updateEmployeeCompetency(scorePct);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans py-4 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs text-center relative overflow-hidden space-y-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
          Assessment Evaluation Complete
        </span>

        <h2 className="text-3xl font-black text-slate-900">Quiz Results</h2>

        {/* Large Score Display */}
        <div className="my-6">
          <div className="inline-flex flex-col items-center justify-center w-40 h-40 rounded-full bg-gradient-to-tr from-[#0a2540] to-blue-900 text-white shadow-2xl ring-8 ring-blue-50">
            <span className="text-5xl font-black text-amber-400">{scorePct}%</span>
            <span className="text-xs font-bold text-slate-200 mt-1">{correctCount} / {totalQuestions} Correct</span>
          </div>
        </div>

        <p className="text-xs font-semibold text-slate-600">
          Official Assessment Metric • Automatically updated your employee competency profile
        </p>
      </div>

      {/* Performance by Topic Breakdown */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Performance by Topic</h3>
          <p className="text-xs text-slate-500">Breakdown of accuracy per statistical sub-domain</p>
        </div>

        <div className="space-y-4">
          {topicBreakdown.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800">{item.topic}</span>
                <span className={`font-mono ${item.score >= 75 ? 'text-emerald-700 font-extrabold' : 'text-amber-700'}`}>
                  {item.score}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${item.score >= 75 ? 'bg-emerald-600' : 'bg-amber-500'}`}
                  style={{ width: `${item.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🤖 AI Feedback Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-blue-800 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            🤖 AI Feedback & Next Steps
          </h3>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800 italic">
          "{aiFeedback}"
        </p>

        <div className="flex items-center gap-2 text-[11px] text-amber-300 font-semibold pt-1">
          <Sparkles className="w-4 h-4" />
          <span>Competency Profile automatically recalculated (+2% Overall Score)</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <button
          onClick={onContinueLearning}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Continue Learning Path</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={onRetakeQuiz}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition cursor-pointer flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake Quiz</span>
        </button>
        <button
          onClick={onViewCompetency}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0a2540] hover:bg-blue-900 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>View Updated Competency</span>
        </button>
      </div>
    </div>
  );
}
