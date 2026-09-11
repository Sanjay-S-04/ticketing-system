import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Edit3, Trash2, RotateCw, Save, CheckCircle2, ArrowLeft, Plus } from 'lucide-react';

export default function AdminQuizEditorPage({ quizData, onPublishQuiz, onBack }) {
  const { showToast } = useAuth();
  const [questions, setQuestions] = useState(quizData?.questions || []);
  const [editingId, setEditingId] = useState(null);

  const handleEditChange = (id, field, val) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: val } : q));
  };

  const handleDelete = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
    showToast("Question deleted", "info");
  };

  const handleSaveQuestion = (id) => {
    setEditingId(null);
    showToast("Question edits saved successfully!");
  };

  const handlePublishAll = () => {
    showToast("Quiz saved and published to official catalog!");
    if (onPublishQuiz) onPublishQuiz();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button onClick={onBack} className="text-xs font-bold text-blue-700 flex items-center gap-1 mb-2 hover:underline cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Generator
          </button>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded">
            AI Generated Quiz Review
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
            {quizData?.title || 'AI Generated Quiz Editor'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and edit generated questions before publishing to the employee portal
          </p>
        </div>

        <button
          onClick={handlePublishAll}
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save & Publish Quiz</span>
        </button>
      </div>

      {/* Questions List Editor */}
      <div className="space-y-6">
        {questions.map((q, idx) => {
          const isEditing = editingId === q.id;

          return (
            <div key={q.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-500 uppercase">Question {idx + 1} of {questions.length}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded">Difficulty: {q.difficulty}</span>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded">Topic: {q.topic}</span>
                </div>
              </div>

              {isEditing ? (
                /* Editable Form Mode */
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Question Text</label>
                    <textarea
                      value={q.question_text}
                      onChange={(e) => handleEditChange(q.id, 'question_text', e.target.value)}
                      rows={2}
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">Option A</label>
                      <input
                        type="text"
                        value={q.option_a}
                        onChange={(e) => handleEditChange(q.id, 'option_a', e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">Option B</label>
                      <input
                        type="text"
                        value={q.option_b}
                        onChange={(e) => handleEditChange(q.id, 'option_b', e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">Option C</label>
                      <input
                        type="text"
                        value={q.option_c}
                        onChange={(e) => handleEditChange(q.id, 'option_c', e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">Option D</label>
                      <input
                        type="text"
                        value={q.option_d}
                        onChange={(e) => handleEditChange(q.id, 'option_d', e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Correct Answer Key</label>
                      <select
                        value={q.correct_option}
                        onChange={(e) => handleEditChange(q.id, 'correct_option', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                      >
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleSaveQuestion(q.id)}
                      className="mt-4 px-4 py-2 rounded-xl bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                /* Readonly View Mode */
                <div className="space-y-3">
                  <p className="text-sm font-extrabold text-slate-900">"{q.question_text}"</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
                    <div className={`p-2.5 rounded-lg border ${q.correct_option === 'A' ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' : 'bg-slate-50 border-slate-200'}`}>
                      A. {q.option_a}
                    </div>
                    <div className={`p-2.5 rounded-lg border ${q.correct_option === 'B' ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' : 'bg-slate-50 border-slate-200'}`}>
                      B. {q.option_b}
                    </div>
                    <div className={`p-2.5 rounded-lg border ${q.correct_option === 'C' ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' : 'bg-slate-50 border-slate-200'}`}>
                      C. {q.option_c}
                    </div>
                    <div className={`p-2.5 rounded-lg border ${q.correct_option === 'D' ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' : 'bg-slate-50 border-slate-200'}`}>
                      D. {q.option_d}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <span className="font-bold text-emerald-700">Correct Answer: Option {q.correct_option}</span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingId(q.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition cursor-pointer flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
