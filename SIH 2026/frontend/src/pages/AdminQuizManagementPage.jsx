import React from 'react';
import { FileQuestion, Award, Users, CheckCircle2, Trash2, Eye } from 'lucide-react';

export default function AdminQuizManagementPage({ onGenerateNew }) {
  const quizzes = [
    {
      id: 1,
      title: "Python for Statistical Analysis Assessment",
      competency: "Python",
      difficulty: "Medium",
      total_questions: 10,
      attempts: 420,
      avg_score: "78%",
      pass_rate: "85%",
      status: "Published"
    },
    {
      id: 2,
      title: "Data Visualization & Reporting Standards",
      competency: "Data Visualization",
      difficulty: "Hard",
      total_questions: 10,
      attempts: 310,
      avg_score: "64%",
      pass_rate: "70%",
      status: "Published"
    },
    {
      id: 3,
      title: "NSS Survey Methodology & Sampling",
      competency: "Survey Methodology",
      difficulty: "Hard",
      total_questions: 15,
      attempts: 580,
      avg_score: "82%",
      pass_rate: "88%",
      status: "Published"
    }
  ];

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
            Assessment Repository
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
            Quiz Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Published AI assessments and overall employee performance metrics
          </p>
        </div>

        <button
          onClick={onGenerateNew}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
        >
          + Generate New Quiz
        </button>
      </div>

      {/* Published Quizzes Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-6">Quiz Title</th>
                <th className="py-3.5 px-6">Competency</th>
                <th className="py-3.5 px-6">Questions</th>
                <th className="py-3.5 px-6">Attempts</th>
                <th className="py-3.5 px-6">Avg Score</th>
                <th className="py-3.5 px-6">Pass Rate</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {quizzes.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-6 font-bold text-slate-900">{q.title}</td>
                  <td className="py-4 px-6 text-slate-600 font-semibold">{q.competency}</td>
                  <td className="py-4 px-6 text-slate-600 font-mono">{q.total_questions} MCQs</td>
                  <td className="py-4 px-6 font-extrabold text-slate-800">{q.attempts}</td>
                  <td className="py-4 px-6 font-bold text-blue-700">{q.avg_score}</td>
                  <td className="py-4 px-6 font-bold text-emerald-700">{q.pass_rate}</td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] uppercase border border-emerald-200">
                      {q.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
