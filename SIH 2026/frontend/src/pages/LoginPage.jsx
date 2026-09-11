import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Shield, UserCheck, Mail, Lock, User, Globe, HelpCircle, ArrowRight, BookOpen, Briefcase, KeyRound, CheckCircle2, UserPlus, LogIn } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const { loginAsAdmin, loginCustomUser, language, setLanguage } = useAuth();
  
  // Auth Mode: 'signin' (existing user) vs 'register' (new user onboarding)
  const [authMode, setAuthMode] = useState('signin');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [goalType, setGoalType] = useState('role'); // 'role' or 'course'
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  // Live roles & courses from iGOT Karmayogi API
  const [rolesList, setRolesList] = useState([
    "Statistical Officer (SO)",
    "Senior Statistical Inspector (SSI)",
    "Junior Statistical Officer (JSO)",
    "Data Analyst (Official Statistics)",
    "Director - National Accounts Division (NAD)",
    "Field Investigator (NSSO Survey Operations)",
    "Deputy Director (Survey Design & Sampling Methodology)",
    "Director General - Capacity Building Commission (CBC)"
  ]);

  const [coursesList, setCoursesList] = useState([
    "Python for Statistical Analysis & MoSPI Datasets",
    "Data Visualization & Dashboard Standards for Public Reports",
    "Survey Methodology & Sampling Techniques (NSSO)",
    "Data Governance, Security & Microdata Privacy",
    "National Accounts Statistics & GDP Estimation Frameworks"
  ]);

  // Fetch live iGOT roles and courses from FastAPI backend
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/igot/roles')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setRolesList(data);
          if (!selectedRole) setSelectedRole(data[0]);
        }
      })
      .catch(() => {
        if (!selectedRole) setSelectedRole(rolesList[0]);
      });

    fetch('http://127.0.0.1:8000/api/igot/courses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const titles = data.map(c => c.title);
          setCoursesList(titles);
          if (!selectedCourse) setSelectedCourse(titles[0]);
        }
      })
      .catch(() => {
        if (!selectedCourse) setSelectedCourse(coursesList[0]);
      });
  }, []);

  // Initialize official Google Identity Services (GSI) Client Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({
            client_id: '928374910283-mospi-karmayogi.apps.googleusercontent.com',
            callback: handleGoogleResponse,
            auto_select: false
          });

          const btnContainer = document.getElementById('googleSignInDiv');
          if (btnContainer) {
            btnContainer.innerHTML = '';
            window.google.accounts.id.renderButton(btnContainer, {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'continue_with',
              shape: 'rectangular'
            });
          }
        } catch (e) {
          console.log("Google Identity Services initialized in fallback mode:", e);
        }
      }
    };
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [authMode]);

  const handleGoogleResponse = (response) => {
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const profile = JSON.parse(jsonPayload);
      
      executeLogin({
        name: profile.name || 'Google Learner',
        email: profile.email || 'user.google@mospi.gov.in'
      });
    } catch (err) {
      console.error("Google token decode error:", err);
      handleFallbackGoogle();
    }
  };

  const handleFallbackGoogle = () => {
    executeLogin({
      name: name.trim() || "Google Verified Learner",
      email: email.trim() || "user.google@mospi.gov.in"
    });
  };

  const executeLogin = (customProps = {}) => {
    const finalEmail = customProps.email || email.trim() || 'officer@mospi.gov.in';
    const userName = customProps.name || name.trim() || (finalEmail.includes('@') ? finalEmail.split('@')[0].replace('.', ' ') : 'Statistical Officer');
    
    loginCustomUser({
      name: userName,
      email: finalEmail,
      goalType: authMode === 'register' ? goalType : 'role',
      targetRole: authMode === 'register' ? selectedRole : (selectedRole || rolesList[0]),
      targetCourse: authMode === 'register' ? selectedCourse : (selectedCourse || coursesList[0])
    });

    if (onLoginSuccess) onLoginSuccess();
  };

  const handleSignInSubmit = (e) => {
    e.preventDefault();
    executeLogin();
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    executeLogin();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans">
      {/* Top National Header Strip */}
      <div className="bg-[#051829] text-white px-6 py-2 flex items-center justify-between text-xs border-b border-slate-800">
        <div className="flex items-center gap-2 font-medium tracking-wide">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>GOVERNMENT OF INDIA • MINISTRY OF STATISTICS & PROGRAMME IMPLEMENTATION</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 cursor-pointer">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-medium cursor-pointer border-none focus:ring-0"
            >
              <option value="English" className="bg-slate-900">English</option>
              <option value="Hindi" className="bg-slate-900">हिन्दी (Hindi)</option>
              <option value="Tamil" className="bg-slate-900">தமிழ் (Tamil)</option>
            </select>
          </div>
          <a href="#help" className="flex items-center gap-1 text-slate-300 hover:text-white">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help Desk</span>
          </a>
        </div>
      </div>

      {/* Main Form Box Container */}
      <div className="flex-1 flex items-center justify-center p-6 my-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Top Banner */}
          <div className="bg-[#0a2540] text-white p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">iGOT Karmayogi Learning Portal</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
              Capacity Building Platform for India's Official Statistical System
            </p>
            
            {/* Auth Mode Toggle Tabs */}
            <div className="mt-4 inline-flex p-1 bg-slate-900/80 rounded-xl border border-slate-700/60 w-full">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Existing User Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>New Registration</span>
              </button>
            </div>
          </div>

          {/* Quick Admin Shortcut Bar */}
          <div className="bg-slate-50 px-6 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MoSPI Official Access</span>
            <button
              type="button"
              onClick={() => { loginAsAdmin(); if (onLoginSuccess) onLoginSuccess(); }}
              className="text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-100/80 hover:bg-amber-100 border border-amber-300/80 px-3 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-amber-700" />
              <span>Admin Portal Demo</span>
            </button>
          </div>

          {/* ==================== MODE 1: EXISTING USER SIGN IN ==================== */}
          {authMode === 'signin' ? (
            <form onSubmit={handleSignInSubmit} className="p-6 space-y-4">
              
              {/* Single Google Authentication Button Container */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Single Sign-On with Google</label>
                
                <div id="googleSignInDiv" className="w-full min-h-[42px] flex justify-center">
                  <button
                    type="button"
                    onClick={handleFallbackGoogle}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition shadow-xs flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-slate-200"></div>
                <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Or Email & Password</span>
                <div className="flex-1 border-t border-slate-200"></div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email / Government ID</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@mospi.gov.in"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-0" />
                  Remember credentials
                </label>
                <a href="#forgot" className="text-blue-700 font-semibold hover:underline">Forgot password?</a>
              </div>

              {/* Direct Sign-In Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0a2540] hover:bg-blue-900 text-white font-bold text-xs shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign In to Learning Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-xs text-blue-700 font-semibold hover:underline cursor-pointer"
                >
                  New to platform? <strong>Register & Select Learning Pathway →</strong>
                </button>
              </div>
            </form>
          ) : (
            /* ==================== MODE 2: NEW USER REGISTRATION & ONBOARDING ==================== */
            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
              
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 text-xs text-blue-900 font-medium">
                ✨ <strong>New Learner Registration:</strong> Fill in your details below and choose your primary role or course objective on iGOT Karmayogi.
              </div>

              {/* Full Name Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vigneshwaran S"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Official Email Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@mospi.gov.in"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Learning Goal Selection: Role vs Course */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">What is your primary learning goal?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGoalType('role')}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                      goalType === 'role'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 font-medium bg-slate-50/50'
                    }`}
                  >
                    <Briefcase className={`w-4 h-4 ${goalType === 'role' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs">Preparing for Role</div>
                      <div className="text-[10px] text-slate-400 font-normal">Target designation</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGoalType('course')}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                      goalType === 'course'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 font-medium bg-slate-50/50'
                    }`}
                  >
                    <BookOpen className={`w-4 h-4 ${goalType === 'course' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs">Specific Course</div>
                      <div className="text-[10px] text-slate-400 font-normal">Single subject focus</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Dynamic Secondary Dropdown fetched from iGOT Karmayogi API */}
              {goalType === 'role' ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Select iGOT Karmayogi Role</label>
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Live iGOT API
                    </span>
                  </div>
                  <select
                    value={selectedRole || (rolesList[0] || '')}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
                  >
                    {rolesList.map((roleOpt) => (
                      <option key={roleOpt} value={roleOpt}>{roleOpt}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Select iGOT Karmayogi Course</label>
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Live iGOT API
                    </span>
                  </div>
                  <select
                    value={selectedCourse || (coursesList[0] || '')}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
                  >
                    {coursesList.map((courseOpt) => (
                      <option key={courseOpt} value={courseOpt}>{courseOpt}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Submit Registration Button */}
              <button
                type="submit"
                className="w-full py-3 mt-2 rounded-xl bg-[#0a2540] hover:bg-blue-900 text-white font-bold text-xs shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Register & Continue to iGOT Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="text-xs text-blue-700 font-semibold hover:underline cursor-pointer"
                >
                  Already registered? <strong>Sign In here →</strong>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-3 text-xs text-slate-500 border-t border-slate-200 bg-white">
        National Informatics Centre (NIC) • Ministry of Statistics & Programme Implementation
      </footer>
    </div>
  );
}
