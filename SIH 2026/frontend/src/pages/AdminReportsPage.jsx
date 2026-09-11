import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, Printer, Filter, CheckCircle2 } from 'lucide-react';

export default function AdminReportsPage() {
  const { showToast } = useAuth();

  const handleExport = (type) => {
    showToast(`Exported Official Capacity Building Report (${type}) successfully!`);
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
            Executive Governance
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
            Learning & Compliance Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate printable audit reports for Ministry leadership and iGOT compliance reviews
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('CSV')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport('PDF')}
            className="px-4 py-2 rounded-xl bg-[#0a2540] hover:bg-blue-900 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Download Official PDF Report</span>
          </button>
        </div>
      </div>

      {/* Available Pre-built Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Monthly Competency Audit</h3>
          <p className="text-xs text-slate-500">Summary of 1,250 officers progress across 8 divisions for MoSPI Director General.</p>
          <button onClick={() => handleExport('PDF')} className="text-xs font-bold text-blue-700 hover:underline">Generate Report →</button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">iGOT Karmayogi Compliance Report</h3>
          <p className="text-xs text-slate-500">NPCSCB compliance metrics and completed hours per statistical officer.</p>
          <button onClick={() => handleExport('PDF')} className="text-xs font-bold text-blue-700 hover:underline">Generate Report →</button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">High Priority Gap Matrix</h3>
          <p className="text-xs text-slate-500">List of departments requiring immediate Python and Data Vis training interventions.</p>
          <button onClick={() => handleExport('PDF')} className="text-xs font-bold text-blue-700 hover:underline">Generate Report →</button>
        </div>
      </div>
    </div>
  );
}
