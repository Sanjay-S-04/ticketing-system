import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { Award, ArrowRight, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function MyCompetencyPage({ setActiveTab }) {
  const { user } = useAuth();

  const competencyData = [
    { competency: 'Statistics', Current: 90, Required: 90, gap: 0, priority: 'Low', status: 'Achieved' },
    { competency: 'Python', Current: 60, Required: 85, gap: 25, priority: 'High', status: 'Needs Improvement' },
    { competency: 'Data Visualization', Current: 45, Required: 80, gap: 35, priority: 'High', status: 'High Priority' },
    { competency: 'Survey Methodology', Current: 78, Required: 85, gap: 7, priority: 'Medium', status: 'Needs Improvement' },
    { competency: 'Data Management', Current: 70, Required: 80, gap: 10, priority: 'Medium', status: 'Needs Improvement' },
    { competency: 'Data Analysis', Current: 76, Required: 85, gap: 9, priority: 'Medium', status: 'Needs Improvement' }
  ];

  const getStatusBadge = (status) => {
    if (status === 'Achieved') return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase border border-emerald-300">Achieved</span>;
    if (status === 'High Priority') return <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[10px] uppercase border border-rose-300">High Priority</span>;
    return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px] uppercase border border-amber-300">Needs Improvement</span>;
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
            Official Competency Framework
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
            My Competency Profile
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Role Benchmark: Statistical Officer • Ministry of Statistics & Programme Implementation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('ai-recommendations')}
            className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs border border-blue-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-700" />
            <span>View Recommendations</span>
          </button>
          <button
            onClick={() => setActiveTab('my-quizzes')}
            className="px-4 py-2.5 rounded-xl bg-[#0a2540] hover:bg-blue-900 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Take Assessment</span>
          </button>
        </div>
      </div>

      {/* Radar Chart & Overall Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score Box */}
        <div className="bg-gradient-to-br from-[#0a2540] to-blue-950 text-white rounded-2xl p-6 border border-blue-900 shadow-md flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Competency Benchmark</span>
            <h3 className="text-xl font-extrabold mt-1">Overall Competency Score</h3>
            <p className="text-xs text-slate-300 mt-1">Calculated across 6 primary statistical domains</p>
          </div>

          <div className="my-8 text-center">
            <div className="inline-flex items-center justify-center w-36 h-36 rounded-full bg-blue-900/60 border-4 border-amber-500/80 shadow-2xl relative">
              <span className="text-5xl font-black text-white">{user?.overall_competency || 72}%</span>
            </div>
            <p className="text-xs font-semibold text-amber-300 mt-3">Target Required Level: 85%</p>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>Domain Mastery:</span>
              <span className="font-bold text-white">1 Achieved / 5 In Progress</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Highest Priority Gap:</span>
              <span className="font-bold text-rose-400">Data Vis (35% Gap)</span>
            </div>
          </div>
        </div>

        {/* Large Recharts Radar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-base font-bold text-slate-900">Competency Radar Map</h3>
            <p className="text-xs text-slate-500">Visual comparison between current competency level and target requirement</p>
          </div>

          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={competencyData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="competency" stroke="#334155" tick={{ fill: '#1e293b', fontSize: 11, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                <Radar name="Current Level" dataKey="Current" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.4} />
                <Radar name="Required Level" dataKey="Required" stroke="#d97706" fill="#f59e0b" fillOpacity={0.2} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Competency Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Competency Breakdown Table</h3>
            <p className="text-xs text-slate-500">Detailed gap analysis per statistical skill domain</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-6">Competency</th>
                <th className="py-3.5 px-6">Current Level</th>
                <th className="py-3.5 px-6">Required Level</th>
                <th className="py-3.5 px-6">Gap</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {competencyData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    {item.competency}
                  </td>
                  <td className="py-4 px-6 font-bold text-blue-700">{item.Current}%</td>
                  <td className="py-4 px-6 font-semibold text-slate-700">{item.Required}%</td>
                  <td className="py-4 px-6 font-bold text-rose-600">{item.gap > 0 ? `${item.gap}%` : '0%'}</td>
                  <td className="py-4 px-6">{getStatusBadge(item.status)}</td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setActiveTab('ai-recommendations')}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-blue-700 font-bold text-xs transition border border-slate-200 cursor-pointer"
                    >
                      Improve
                    </button>
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
