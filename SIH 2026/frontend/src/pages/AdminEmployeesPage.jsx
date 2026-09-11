import React, { useState } from 'react';
import { Search, Filter, Eye, Award, CheckCircle2, UserCheck, Shield } from 'lucide-react';

export default function AdminEmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const employees = [
    {
      id: 1,
      employee_id: "EMP-10482",
      name: "Vigneshwaran S",
      department: "Official Statistics",
      role: "Statistical Officer",
      overall_competency: 72,
      learning_progress: "68%",
      status: "Active",
      competencies: [
        { name: "Statistics", score: 90 },
        { name: "Python", score: 60 },
        { name: "Data Visualization", score: 45 },
        { name: "Survey Methodology", score: 78 }
      ]
    },
    {
      id: 2,
      employee_id: "EMP-10483",
      name: "Ananya Roy",
      department: "National Accounts Division",
      role: "Senior Statistical Officer",
      overall_competency: 84,
      learning_progress: "85%",
      status: "Active",
      competencies: [
        { name: "Statistics", score: 95 },
        { name: "Python", score: 80 },
        { name: "Data Visualization", score: 78 }
      ]
    },
    {
      id: 3,
      employee_id: "EMP-10484",
      name: "Rajesh Kumar",
      department: "Survey Design & Research",
      role: "Assistant Director",
      overall_competency: 65,
      learning_progress: "40%",
      status: "Needs Review",
      competencies: [
        { name: "Statistics", score: 80 },
        { name: "Python", score: 50 },
        { name: "Data Visualization", score: 40 }
      ]
    },
    {
      id: 4,
      employee_id: "EMP-10485",
      name: "Priya Nair",
      department: "Field Operations Division",
      role: "Statistical Inspector",
      overall_competency: 79,
      learning_progress: "92%",
      status: "Active",
      competencies: [
        { name: "Statistics", score: 88 },
        { name: "Python", score: 70 },
        { name: "Survey Methodology", score: 85 }
      ]
    },
    {
      id: 5,
      employee_id: "EMP-10486",
      name: "Siddharth Verma",
      department: "Price Statistics Division",
      role: "Data Analyst",
      overall_competency: 58,
      learning_progress: "25%",
      status: "High Priority Gap",
      competencies: [
        { name: "Statistics", score: 70 },
        { name: "Python", score: 45 },
        { name: "Data Visualization", score: 35 }
      ]
    }
  ];

  const filtered = employees.filter(emp => {
    const matchSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = deptFilter === 'All' || emp.department === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
            Workforce Capacity Management
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
            Employees Management (1,250 Officers)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor individual competency benchmarks across MoSPI divisions
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 w-48 sm:w-64"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white cursor-pointer"
          >
            <option value="All">All Departments</option>
            <option value="Official Statistics">Official Statistics</option>
            <option value="National Accounts Division">National Accounts</option>
            <option value="Survey Design & Research">Survey Design</option>
            <option value="Price Statistics Division">Price Statistics</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-6">Employee ID</th>
                <th className="py-3.5 px-6">Name</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Overall Competency</th>
                <th className="py-3.5 px-6">Learning Progress</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-6 font-mono font-bold text-slate-700">{emp.employee_id}</td>
                  <td className="py-4 px-6 font-bold text-slate-900">{emp.name}</td>
                  <td className="py-4 px-6 text-slate-600">{emp.department}</td>
                  <td className="py-4 px-6 text-slate-600">{emp.role}</td>
                  <td className="py-4 px-6 font-extrabold text-blue-700">{emp.overall_competency}%</td>
                  <td className="py-4 px-6 font-semibold text-slate-700">{emp.learning_progress}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                      emp.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      emp.status === 'High Priority Gap' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                      'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setSelectedEmployee(emp)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs border border-blue-200 transition cursor-pointer flex items-center gap-1 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Profile</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Profile Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">{selectedEmployee.employee_id}</span>
                <h4 className="font-bold text-slate-900 text-base">{selectedEmployee.name}</h4>
              </div>
              <button onClick={() => setSelectedEmployee(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">×</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div><span className="text-slate-500">Department:</span> <p className="font-bold text-slate-800">{selectedEmployee.department}</p></div>
              <div><span className="text-slate-500">Designation:</span> <p className="font-bold text-slate-800">{selectedEmployee.role}</p></div>
              <div><span className="text-slate-500">Overall Score:</span> <p className="font-bold text-blue-700">{selectedEmployee.overall_competency}%</p></div>
              <div><span className="text-slate-500">Course Progress:</span> <p className="font-bold text-emerald-700">{selectedEmployee.learning_progress}</p></div>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-xs text-slate-800 uppercase">Skill Domain Breakdown</h5>
              {selectedEmployee.competencies?.map((c, i) => (
                <div key={i} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-100">
                  <span className="font-medium">{c.name}</span>
                  <span className="font-bold text-blue-700">{c.score}%</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setSelectedEmployee(null)} className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
