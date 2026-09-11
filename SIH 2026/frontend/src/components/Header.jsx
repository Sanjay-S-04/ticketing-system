import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Globe, Bell, UserCheck, Shield, Sparkles, Menu, KeyRound } from 'lucide-react';

export default function Header({ toggleMobileSidebar, onSwitchLogin }) {
  const { user, language, setLanguage, loginAsEmployee, loginAsAdmin } = useAuth();

  return (
    <header className="bg-[#0a2540] text-white sticky top-0 z-40 shadow-md border-b border-blue-900">
      {/* Top National Strip */}
      <div className="bg-[#051829] px-4 py-1 flex items-center justify-between text-xs text-slate-300 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="font-medium tracking-wide">GOVERNMENT OF INDIA • MINISTRY OF STATISTICS & PROGRAMME IMPLEMENTATION (MoSPI)</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline">Official Statistical System Capacity Building Portal</span>
          <div className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-medium cursor-pointer border-none focus:ring-0 focus:outline-none"
            >
              <option value="English" className="bg-slate-900 text-white">English</option>
              <option value="Hindi" className="bg-slate-900 text-white">हिन्दी (Hindi)</option>
              <option value="Tamil" className="bg-slate-900 text-white">தமிழ் (Tamil)</option>
              <option value="Telugu" className="bg-slate-900 text-white">తెలుగు (Telugu)</option>
              <option value="Bengali" className="bg-slate-900 text-white">বাংলা (Bengali)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg bg-blue-950/60 text-slate-200 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-lg font-bold text-slate-950 text-xl tracking-wider">
              <Sparkles className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  AI Learning Platform
                </h1>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                  iGOT Aligned
                </span>
              </div>
              <p className="text-xs text-slate-300 hidden sm:block">
                Intelligent Capacity Building for India's Official Statistical System
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Role Switcher */}
          {user && (
            <div className="hidden sm:flex items-center bg-slate-900/80 p-1 rounded-lg border border-slate-700/60 text-xs">
              <button
                onClick={loginAsEmployee}
                className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  user.role === 'Employee'
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Employee
              </button>
              <button
                onClick={loginAsAdmin}
                className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  user.role === 'Admin'
                    ? 'bg-amber-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Administrator
              </button>
            </div>
          )}

          {/* Onboarding & Custom Login Button */}
          <button
            onClick={onSwitchLogin}
            title="Open Onboarding & Login Portal"
            className="px-3 py-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-800 border border-blue-700/60 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Onboarding / Login</span>
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white relative transition">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-[#0a2540]"></span>
          </button>

          {/* User Profile Badge */}
          {user && (
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-700/60">
              <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-xs shadow-inner">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
                <p className="text-[10px] text-slate-300">{user.designation}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
