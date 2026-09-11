import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, FileText, Wand2, Trash2, CheckCircle2, AlertCircle, Plus } from 'lucide-react';

export default function AdminResourcesPage({ onGenerateQuizFromResource }) {
  const { showToast } = useAuth();
  const [resources, setResources] = useState([
    {
      id: 1,
      title: "NSS 78th Round Survey Guidelines.pdf",
      file_type: "PDF",
      file_size: "4.2 MB",
      uploaded_by: "Admin User",
      upload_date: "2026-08-15",
      competency: "Survey Methodology",
      difficulty: "Intermediate",
      quiz_status: "Generated"
    },
    {
      id: 2,
      title: "Python Data Wrangling Manual for MoSPI.docx",
      file_type: "DOCX",
      file_size: "2.8 MB",
      uploaded_by: "Admin User",
      upload_date: "2026-08-20",
      competency: "Python",
      difficulty: "Intermediate",
      quiz_status: "Generated"
    },
    {
      id: 3,
      title: "Data Visualization Standards for Government Reports.pptx",
      file_type: "PPTX",
      file_size: "6.5 MB",
      uploaded_by: "Admin User",
      upload_date: "2026-08-25",
      competency: "Data Visualization",
      difficulty: "Hard",
      quiz_status: "Pending"
    }
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [competency, setCompetency] = useState('Statistical Programming');
  const [difficulty, setDifficulty] = useState('Medium');

  const handleSimulateUpload = (e) => {
    e.preventDefault();
    if (!newTitle) return;

    setIsUploading(true);

    setTimeout(() => {
      const ext = newTitle.includes('.') ? newTitle.split('.').pop().toUpperCase() : 'PDF';
      const newRes = {
        id: Date.now(),
        title: newTitle,
        file_type: ext,
        file_size: "3.5 MB",
        uploaded_by: "Dr. R. K. Sharma",
        upload_date: new Date().toISOString().split('T')[0],
        competency: competency,
        difficulty: difficulty,
        quiz_status: "Pending"
      };

      setResources([newRes, ...resources]);
      setIsUploading(false);
      setNewTitle('');
      showToast(`Uploaded material "${newRes.title}" successfully!`);
    }, 1200);
  };

  const handleDelete = (id) => {
    setResources(resources.filter(r => r.id !== id));
    showToast("Resource deleted successfully", "info");
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
            Repository Management
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
            Learning Resources
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload PDF, DOCX or PPTX statistical materials to train officers and auto-generate AI quizzes
          </p>
        </div>
      </div>

      {/* Upload Form Box */}
      <form onSubmit={handleSimulateUpload} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-blue-700" />
          Upload New Learning Document
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Document File Name</label>
            <input
              type="text"
              placeholder="e.g. National_Accounts_Guide_2026.pdf"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Competency</label>
            <select
              value={competency}
              onChange={(e) => setCompetency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
            >
              <option value="Python">Python</option>
              <option value="Data Visualization">Data Visualization</option>
              <option value="Statistical Programming">Statistical Programming</option>
              <option value="Survey Methodology">Survey Methodology</option>
              <option value="Data Management">Data Management</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty Level</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isUploading}
            className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <span>Uploading Material...</span>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Upload & Index Resource</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Resources Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Uploaded Repository Materials</h3>
          <span className="text-xs text-slate-500 font-medium">{resources.length} Materials Total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-6">Document Title</th>
                <th className="py-3.5 px-6">Competency</th>
                <th className="py-3.5 px-6">Uploaded By</th>
                <th className="py-3.5 px-6">Upload Date</th>
                <th className="py-3.5 px-6">Quiz Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {resources.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-700 shrink-0" />
                    <div>
                      <p>{item.title}</p>
                      <span className="text-[10px] text-slate-400 font-normal">{item.file_type} • {item.file_size}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-700">{item.competency}</td>
                  <td className="py-4 px-6 text-slate-600">{item.uploaded_by}</td>
                  <td className="py-4 px-6 font-mono text-slate-600">{item.upload_date}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                      item.quiz_status === 'Generated' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {item.quiz_status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => onGenerateQuizFromResource(item)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer inline-flex items-center gap-1"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Generate Quiz</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition cursor-pointer inline-flex items-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
