import React from 'react';
import { FileQuestion, Award, CheckCircle2, Play, Sparkles, RefreshCw } from 'lucide-react';

export default function MyQuizzesPage({ onStartQuiz }) {
  const quizzes = [
    {
      id: 1,
      title: 'Python for Statistical Analysis Assessment',
      competency: 'Python',
      difficulty: 'Medium',
      questionsCount: 10,
      status: 'Available',
      lastScore: '85%',
      badge: 'AI Generated'
    },
    {
      id: 2,
      title: 'Data Visualization & Reporting Quiz',
      competency: 'Data Visualization',
      difficulty: 'Intermediate',
      questionsCount: 10,
      status: 'Available',
      lastScore: '60%',
      badge: 'Needs Improvement'
    },
    {
      id: 3,
      title: 'National Sample Survey Methodology',
      competency: 'Survey Methodology',
      difficulty: 'Hard',
      questionsCount: 15,
      status: 'Available',
      lastScore: '78%',
      badge: 'Passed'
    }
  ];

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
            AI Assessment Engine
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
            My Quizzes & Assessments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate your statistical competencies through AI-generated multiple choice assessments
          </p>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[10px] uppercase border border-purple-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {quiz.badge}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Last Score: {quiz.lastScore}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">{quiz.title}</h3>

              <div className="space-y-1.5 text-xs text-slate-600 font-medium mb-4">
                <div className="flex justify-between">
                  <span>Competency Target:</span>
                  <span className="font-bold text-slate-800">{quiz.competency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Questions:</span>
                  <span className="font-bold text-slate-800">{quiz.questionsCount} MCQs</span>
                </div>
                <div className="flex justify-between">
                  <span>Difficulty:</span>
                  <span className="font-bold text-slate-800">{quiz.difficulty}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onStartQuiz}
              className="w-full py-3 rounded-xl bg-[#0a2540] hover:bg-blue-900 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Start Assessment</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
