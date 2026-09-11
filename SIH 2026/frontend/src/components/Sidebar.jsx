import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Award,
  GitBranch,
  Sparkles,
  BookOpen,
  FileQuestion,
  TrendingUp,
  Globe,
  Settings,
  LogOut,
  Users,
  BarChart3,
  FolderOpen,
  Wand2,
  FileText,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen, onSwitchLogin }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const employeeNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-competency', label: 'My Competency', icon: Award },
    { id: 'learning-path', label: 'Learning Path', icon: GitBranch, badge: 'AI' },
    { id: 'ai-recommendations', label: 'AI Recommendations', icon: Sparkles, badge: 'Smart' },
    { id: 'my-courses', label: 'My Courses', icon: BookOpen },
    { id: 'my-quizzes', label: 'My Quizzes', icon: FileQuestion },
    { id: 'my-progress', label: 'My Progress', icon: TrendingUp },
    { id: 'igot-karmayogi', label: 'iGOT Karmayogi', icon: Globe, badge: 'Gov' },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const adminNav = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-employees', label: 'Employees', icon: Users },
    { id: 'admin-competency-analytics', label: 'Competency Analytics', icon: BarChart3 },
    { id: 'admin-learning-resources', label: 'Learning Resources', icon: FolderOpen },
    { id: 'admin-quiz-generator', label: 'AI Quiz Generator', icon: Wand2, badge: 'AI' },
    { id: 'admin-quiz-management', label: 'Quiz Management', icon: FileQuestion },
    { id: 'admin-igot-integration', label: 'iGOT Integration', icon: Layers },
    { id: 'admin-reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const navItems = isAdmin ? adminNav : employeeNav;

  const handleSelect = (id) => {
    setActiveTab(id);
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      <aside className={`
        fixed lg:relative top-[75px] lg:top-0 left-0 h-[calc(100vh-75px)] lg:h-auto w-64 bg-white border-r border-slate-200 z-40 lg:z-auto transition-transform duration-300 ease-in-out flex flex-col justify-between shadow-sm shrink-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 overflow-y-auto">
          {/* Header Role Tag */}
          <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current View</span>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-amber-500' : 'bg-blue-600'}`}></span>
                {isAdmin ? 'Administrator Portal' : 'Employee Workspace'}
              </p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
              {isAdmin ? 'Admin' : 'Officer'}
            </span>
          </div>

          {/* Navigation links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group cursor-pointer
                    ${isActive
                      ? (isAdmin ? 'bg-amber-50 text-amber-900 font-bold border-l-4 border-amber-600 shadow-xs' : 'bg-blue-50 text-blue-900 font-bold border-l-4 border-blue-700 shadow-xs')
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? (isAdmin ? 'text-amber-700' : 'text-blue-700') : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        item.badge === 'AI' ? 'bg-purple-100 text-purple-700' :
                        item.badge === 'Gov' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => {
              logout();
              if (onSwitchLogin) onSwitchLogin();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout / Switch Login
          </button>
        </div>
      </aside>
    </>
  );
}
