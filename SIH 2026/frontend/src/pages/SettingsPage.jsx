import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Globe, Shield, Save } from 'lucide-react';

export default function SettingsPage() {
  const { user, language, setLanguage, showToast } = useAuth();

  const handleSave = (e) => {
    e.preventDefault();
    showToast("Settings updated successfully!");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h2 className="text-2xl font-extrabold text-slate-900">Portal Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">Manage user preferences, portal language, and notifications</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Profile Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-700" />
            Official Account Info
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Full Name</label>
              <input type="text" defaultValue={user?.name} className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-800" readOnly />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Employee ID</label>
              <input type="text" defaultValue={user?.employee_id} className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-slate-800" readOnly />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Official Email</label>
              <input type="text" defaultValue={user?.email} className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-800" readOnly />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Department</label>
              <input type="text" defaultValue={user?.department} className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-800" readOnly />
            </div>
          </div>
        </div>

        {/* Regional & Accessibility */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-600" />
            Language & Region
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Portal Display Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full sm:w-64 p-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Hindi">हिन्दी (Hindi)</option>
                <option value="Tamil">தமிழ் (Tamil)</option>
                <option value="Telugu">తెలుగు (Telugu)</option>
                <option value="Bengali">বাংলা (Bengali)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
