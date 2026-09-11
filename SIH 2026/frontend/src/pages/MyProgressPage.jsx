import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { TrendingUp, Flame, BookCheck, Award, Clock, Sparkles } from 'lucide-react';

export default function MyProgressPage() {
  const { user } = useAuth();

  const progressData = [
    { month: 'January', score: 52 },
    { month: 'February', score: 61 },
    { month: 'March', score: 68 },
    { month: 'April', score: user?.overall_competency || 72 }
  ];

  const skillBreakdown = [
    { skill: 'Python', value: 60 },
    { skill: 'Data Vis', value: 45 },
    { skill: 'Statistics', value: 90 },
    { skill: 'Survey Method', value: 78 },
    { skill: 'Data Mgmt', value: 70 }
  ];

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
            Analytics & Improvement History
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
            My Progress Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuous progress monitoring for Vigneshwaran S • Statistical Officer
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Learning Streak</span>
            <h3 className="text-xl font-extrabold text-slate-900">14 Days 🔥</h3>
            <p className="text-[10px] text-slate-500">Active daily learning</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            <BookCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Courses Completed</span>
            <h3 className="text-xl font-extrabold text-slate-900">8 Modules</h3>
            <p className="text-[10px] text-slate-500">iGOT & MoSPI courses</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quizzes Completed</span>
            <h3 className="text-xl font-extrabold text-slate-900">12 AI Assessments</h3>
            <p className="text-[10px] text-slate-500">85% average score</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Learning Hours</span>
            <h3 className="text-xl font-extrabold text-slate-900">34.5 Hours</h3>
            <p className="text-[10px] text-slate-500">Total capacity building</p>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Competency Improvement Trend</h3>
            <p className="text-xs text-slate-500">Historical overall score growth from January to April</p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#475569' }} />
                <YAxis domain={[40, 100]} tick={{ fontSize: 12, fill: '#475569' }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 6, fill: '#2563eb' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Domain-wise Proficiency</h3>
            <p className="text-xs text-slate-500">Current skill levels across key statistical domains</p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="skill" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#475569' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
