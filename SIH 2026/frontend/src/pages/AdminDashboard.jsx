import React from 'react';
import KPICard from '../components/KPICard';
import {
  Users,
  Award,
  BookOpen,
  Wand2,
  BarChart3,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  FileText
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function AdminDashboard({ setActiveTab }) {
  const deptData = [
    { department: 'Statistics', score: 85 },
    { department: 'Data Analysis', score: 76 },
    { department: 'Python', score: 58 },
    { department: 'Visualization', score: 48 },
    { department: 'Survey Method', score: 71 }
  ];

  const orgGaps = [
    { rank: 1, name: 'Data Visualization', priority: 'High', gap: '35% Gap', impact: 'Affects 450 Officers' },
    { rank: 2, name: 'Python for Statistics', priority: 'High', gap: '27% Gap', impact: 'Affects 620 Officers' },
    { rank: 3, name: 'Statistical Programming', priority: 'Medium', gap: '18% Gap', impact: 'Affects 310 Officers' },
    { rank: 4, name: 'Survey Methodology', priority: 'Medium', gap: '9% Gap', impact: 'Affects 180 Officers' }
  ];

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="bg-[#0a2540] text-white rounded-2xl p-6 shadow-md border border-blue-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-blue-900/80 px-2.5 py-1 rounded border border-blue-700">
            MoSPI Capacity Building Directorate
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-2">
            Admin Dashboard
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Organization-wide Competency Analytics & iGOT Karmayogi Governance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('admin-quiz-generator')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            <span>Generate AI Quiz</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Total Employees" value="1,250" subtitle="Across 8 MoSPI Divisions" icon={Users} color="blue" />
        <KPICard title="Average Competency" value="74%" subtitle="Target Target: 85%" icon={Award} color="emerald" trend="+3% MoM" />
        <KPICard title="Active Learners" value="890" subtitle="71.2% Participation" icon={BookOpen} color="amber" />
        <KPICard title="Courses Available" value="85" subtitle="iGOT & Internal" icon={FileText} color="purple" />
        <KPICard title="Quizzes Generated" value="320" subtitle="AI Generated MCQs" icon={Wand2} color="indigo" />
      </div>

      {/* Department Competency Chart & Top Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Department Competency Overview</h3>
              <p className="text-xs text-slate-500">Average competency scores by skill domain across 1,250 officers</p>
            </div>
            <span className="text-xs text-slate-400 font-medium">Benchmark: 85%</span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#475569' }} />
                <Tooltip />
                <Bar dataKey="score" fill="#0a2540" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Org-wide Gaps Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">Organization-wide Competency Gaps</h3>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>

            <div className="space-y-3">
              {orgGaps.map((gap) => (
                <div key={gap.rank} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{gap.rank}. {gap.name}</span>
                    <span className="text-[10px] text-slate-500">{gap.impact}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] uppercase ${gap.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                    {gap.gap}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('admin-competency-analytics')}
            className="w-full py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs border border-blue-200 transition flex items-center justify-center gap-1.5 cursor-pointer mt-4"
          >
            <span>View Detailed Analytics</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
