import React from 'react';

export default function KPICard({ title, value, subtitle, icon: Icon, color = 'blue', trend }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-lg border ${colorMap[color] || colorMap.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">{subtitle}</span>
          {trend && (
            <span className="font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
