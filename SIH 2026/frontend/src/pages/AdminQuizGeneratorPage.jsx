import React, { useState } from 'react';
import { UploadCloud, Wand2, FileText, CheckCircle2, Loader2, Sparkles, Sliders } from 'lucide-react';

export default function AdminQuizGeneratorPage({ onQuizGenerated }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionType, setQuestionType] = useState('MCQ');
  const [competency, setCompetency] = useState('Statistical Programming');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  const loadingSteps = [
    "Analyzing learning material...",
    "Extracting concepts...",
    "Generating questions...",
    "Validating MCQs...",
    "Quiz ready!"
  ];

  const handleSimulatedDrop = () => {
    setUploadedFile({
      name: "National_Accounts_Compilation_Manual.pdf",
      type: "PDF",
      size: "4.8 MB",
      status: "Ready for processing"
    });
  };

  const handleGenerate = () => {
    if (!uploadedFile) {
      setUploadedFile({
        name: "MoSPI_Statistical_Sampling_Standards.pdf",
        type: "PDF",
        size: "3.2 MB",
        status: "Uploaded"
      });
    }

    setIsGenerating(true);

    let stepIdx = 0;
    setGenerationStep(loadingSteps[0]);

    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < loadingSteps.length) {
        setGenerationStep(loadingSteps[stepIdx]);
      } else {
        clearInterval(interval);
        setIsGenerating(false);

        // Generated mock questions ready for editor review
        const generatedQuestions = [
          {
            id: 1,
            question_text: "Which sampling technique gives every member of a target population an equal probability of selection?",
            option_a: "Convenience Sampling",
            option_b: "Simple Random Sampling",
            option_c: "Quota Sampling",
            option_d: "Judgment Sampling",
            correct_option: "B",
            difficulty: difficulty,
            topic: "Sampling Methods",
            explanation: "Simple Random Sampling guarantees every unit has an equal non-zero selection chance."
          },
          {
            id: 2,
            question_text: "In Python pandas, which function is primarily used to aggregate data by categories before applying statistical summary metrics?",
            option_a: "df.pivot_table()",
            option_b: "df.groupby()",
            option_c: "df.filter()",
            option_d: "df.transform()",
            correct_option: "B",
            difficulty: difficulty,
            topic: "Python Data Handling",
            explanation: "df.groupby() performs split-apply-combine data aggregations."
          },
          {
            id: 3,
            question_text: "What type of chart is most suitable for representing the distribution of a single continuous statistical variable?",
            option_a: "Bar Chart",
            option_b: "Pie Chart",
            option_c: "Histogram",
            option_d: "Scatter Plot",
            correct_option: "C",
            difficulty: difficulty,
            topic: "Data Visualization",
            explanation: "Histograms group continuous numerical data into bins for distribution representation."
          },
          {
            id: 4,
            question_text: "When assessing multicollinearity in linear regression models for national account indicators, which metric is commonly evaluated?",
            option_a: "Variance Inflation Factor (VIF)",
            option_b: "Durbin-Watson Statistic",
            option_c: "Akaike Information Criterion (AIC)",
            option_d: "Root Mean Squared Error (RMSE)",
            correct_option: "A",
            difficulty: difficulty,
            topic: "Statistical Modeling",
            explanation: "VIF measures how much the coefficient variance is inflated due to collinearity."
          },
          {
            id: 5,
            question_text: "Which measure of central tendency is least sensitive to extreme values or outliers in economic survey datasets?",
            option_a: "Arithmetic Mean",
            option_b: "Median",
            option_c: "Geometric Mean",
            option_d: "Weighted Mean",
            correct_option: "B",
            difficulty: difficulty,
            topic: "Descriptive Statistics",
            explanation: "The median is resistant to extreme tail outliers."
          }
        ];

        onQuizGenerated({
          title: `AI Generated Quiz - ${competency}`,
          competency,
          difficulty,
          questions: generatedQuestions
        });
      }
    }, 900);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="bg-[#0a2540] text-white rounded-2xl p-6 shadow-md border border-blue-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-blue-900 px-2.5 py-1 rounded border border-blue-700">
            Intelligent Assessment Generator
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-2">
            AI Quiz Generator
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Upload PDF, DOCX or PPTX learning materials and let AI generate assessment questions
          </p>
        </div>
      </div>

      {/* Upload Drag & Drop Box */}
      <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-slate-300 shadow-xs text-center space-y-4 hover:border-blue-500 transition">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto shadow-sm">
          <UploadCloud className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900">Upload Learning Material</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Drag & drop PDF, DOCX, or PPTX learning materials here or click browse below.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSimulatedDrop}
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition cursor-pointer"
        >
          Browse Files
        </button>

        {/* Display Uploaded File Info */}
        {uploadedFile && (
          <div className="mt-4 max-w-md mx-auto p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-left flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-emerald-700" />
              <div>
                <p className="font-bold text-emerald-950">{uploadedFile.name}</p>
                <span className="text-[10px] text-emerald-700">{uploadedFile.type} • {uploadedFile.size}</span>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded font-bold text-[10px]">
              Ready
            </span>
          </div>
        )}
      </div>

      {/* Configuration Fields */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-700" />
          Quiz Parameters & Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Questions</label>
            <select
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white cursor-pointer"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
              <option value={20}>20 Questions</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white cursor-pointer"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Question Type</label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white cursor-pointer"
            >
              <option value="MCQ">MCQ (Multiple Choice)</option>
              <option value="True or False">True or False</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Competency</label>
            <select
              value={competency}
              onChange={(e) => setCompetency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white cursor-pointer"
            >
              <option value="Python">Python for Statistics</option>
              <option value="Data Visualization">Data Visualization</option>
              <option value="Statistical Programming">Statistical Programming</option>
              <option value="Survey Methodology">Survey Methodology</option>
              <option value="Data Management">Data Management</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-4 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-102"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{generationStep}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>✨ Generate Quiz with AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live AI Progress Loading Modal */}
      {isGenerating && (
        <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl text-center space-y-3 animate-pulse">
          <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-sm">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>{generationStep}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden max-w-md mx-auto">
            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full animate-pulse" style={{ width: '80%' }}></div>
          </div>
        </div>
      )}
    </div>
  );
}
