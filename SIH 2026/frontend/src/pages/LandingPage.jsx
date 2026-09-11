import React from 'react';
import { Sparkles, Award, BookOpen, Brain, CheckCircle2, ArrowRight, Shield, Layers, Users } from 'lucide-react';
import FromLearningToCompetency from '../components/FromLearningToCompetency';

export default function LandingPage({ onLoginClick, onExploreClick }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Public Header */}
      <header className="bg-[#0a2540] text-white border-b border-blue-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">AI Learning Platform</h1>
              <p className="text-xs text-slate-300">India's Official Statistical System (MoSPI)</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onExploreClick}
              className="text-xs font-semibold text-slate-300 hover:text-white hidden sm:block cursor-pointer"
            >
              Platform Overview
            </button>
            <button
              onClick={onLoginClick}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <span>Portal Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#0a2540] via-[#103358] to-[#0a2540] text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-700/60 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4" />
            iGOT Karmayogi Ecosystem Aligned
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Build Competencies.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400">
              Strengthen Official Statistics.
            </span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-slate-200 max-w-3xl mx-auto leading-relaxed">
            An AI-powered learning platform that identifies competency gaps, personalizes training recommendations through iGOT Karmayogi, and generates intelligent assessments for India's Official Statistical System.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onLoginClick}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-102"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onExploreClick}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700 transition cursor-pointer"
            >
              Explore Platform Features
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-slate-800/80 pt-8 text-left">
            <div>
              <div className="text-2xl font-extrabold text-amber-400">1,250+</div>
              <div className="text-xs text-slate-400">Statistical Officers</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">16 Core</div>
              <div className="text-xs text-slate-400">Competency Frameworks</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-amber-400">iGOT</div>
              <div className="text-xs text-slate-400">Integrated Resources</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">AI Engine</div>
              <div className="text-xs text-slate-400">Automated MCQ Quizzes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-extrabold text-slate-900">Enterprise Capacity Building Features</h2>
          <p className="text-xs text-slate-600 mt-2">Purpose-built for the Ministry of Statistics & Programme Implementation (MoSPI)</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-6">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">AI Competency Analysis</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Identify skill gaps using assessments and employee competency profiles mapped against official role requirements.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-6">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Personalized Learning</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive role-based training recommendations seamlessly aligned with iGOT Karmayogi ecosystem resources.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-6">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">AI Assessment Generator</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generate quizzes and MCQs automatically from uploaded statistical learning materials in seconds.
            </p>
          </div>
        </div>

        {/* Process Diagram Component */}
        <div className="mt-16">
          <FromLearningToCompetency />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#051829] text-slate-400 text-xs py-8 px-6 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" />
            <span>India's Official Statistical System • MoSPI Capacity Building Framework</span>
          </div>
          <div>© 2026 Ministry of Statistics and Programme Implementation. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
