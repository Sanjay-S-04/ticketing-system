import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, PlayCircle, Clock, Award, FileText, ArrowRight, ExternalLink, Globe, BookMarked, X, Download, Code, Check } from 'lucide-react';

export default function MyCoursesPage({ selectedCourse, onTakeQuiz, onOpenIGOTModal }) {
  const initialCourses = [
    {
      id: 1,
      title: 'Python for Statistical Analysis',
      competency: 'Statistical Programming',
      difficulty: 'Intermediate',
      duration: '4 hours',
      progress: 35,
      provider: 'iGOT Karmayogi',
      igotBadge: true,
      modules: [
        {
          id: 'm1',
          title: 'Module 1: Introduction to Pandas Dataframes & Series',
          duration: '45 mins',
          completed: true,
          lessonText: "Pandas provides tabular data structures (DataFrames & Series) optimized for official statistical manipulation. Learn indexing, column selection, and standard dataset loading routines for NSS survey files.",
          codeSnippet: `import pandas as pd\n# Load official survey dataset\ndf = pd.read_csv('NSS_78th_Round_Survey.csv')\nprint(df.info())\nprint("Sample records:", df.head())`,
          takeaways: ["Understand DataFrames vs Series", "Import CSV & Excel survey data", "Inspect memory usage & column data types"]
        },
        {
          id: 'm2',
          title: 'Module 2: Data Cleaning & Handling Missing Values',
          duration: '60 mins',
          completed: true,
          lessonText: "Statistical survey data frequently contains missing entries or invalid field codes. Learn imputation methods (median/mean replacement) and outlier filtering routines prior to computing state-level indicators.",
          codeSnippet: `# Identify missing values per indicator\nprint(df.isnull().sum())\n# Impute missing consumption values with median\ndf['monthly_exp'] = df['monthly_exp'].fillna(df['monthly_exp'].median())\nclean_df = df.dropna(subset=['state_code'])`,
          takeaways: ["Detect missing value patterns", "Apply median imputation methods", "Filter erroneous survey entries"]
        },
        {
          id: 'm3',
          title: 'Module 3: Aggregation with GroupBy & Pivot Tables',
          duration: '60 mins',
          completed: false,
          lessonText: "Categorical survey aggregation is essential for National Accounts Division reports. Learn how to group survey microdata by State, District, or Sector (Rural/Urban) to compute weighted averages and statistical summary metrics.",
          codeSnippet: `# Group by State and Sector to compute mean expenditure\nstate_summary = df.groupby(['state_name', 'sector']).agg({\n    'monthly_expenditure': ['mean', 'median', 'std'],\n    'sample_size': 'count'\n}).reset_index()\nprint(state_summary.head())`,
          takeaways: ["Master df.groupby() split-apply-combine logic", "Create multi-level pivot tables", "Export aggregated statistical summaries"]
        },
        {
          id: 'm4',
          title: 'Module 4: NumPy Vectorized Array Operations',
          duration: '75 mins',
          completed: false,
          lessonText: "Vectorization replaces slow Python loops with high-performance C-optimized array computations. Learn array slicing, boolean masking, element-wise math operations, and weighted matrix products.",
          codeSnippet: `import numpy as np\nexpenditures = np.array([4500, 3200, 6800, 5100])\nweights = np.array([0.25, 0.30, 0.20, 0.25])\nweighted_avg = np.average(expenditures, weights=weights)\nprint("Weighted Mean Expenditure:", weighted_avg)`,
          takeaways: ["Understand NumPy array memory layouts", "Apply boolean masking for fast filtering", "Perform weighted statistical array math"]
        }
      ]
    },
    {
      id: 2,
      title: 'Data Visualization for Official Statistics',
      competency: 'Data Visualization',
      difficulty: 'Intermediate',
      duration: '5 hours',
      progress: 10,
      provider: 'iGOT Karmayogi',
      igotBadge: true,
      modules: [
        {
          id: 'm2_1',
          title: 'Module 1: Visual Design Principles for Official Reports',
          duration: '60 mins',
          completed: true,
          lessonText: "Official MoSPI publications require clean typography, accessible color palettes, and uncluttered charts. Learn visual hierarchy standards for executive statistical briefings.",
          codeSnippet: `import matplotlib.pyplot as plt\nplt.style.use('seaborn-v0_8-whitegrid')\nplt.title('Consumer Price Index (CPI) Trend 2025-2026', fontsize=14, fontweight='bold')`,
          takeaways: ["Adhere to MoSPI official color standards", "Choose chart types based on statistical data types", "Avoid misleading axis scales"]
        },
        {
          id: 'm2_2',
          title: 'Module 2: Matplotlib & Seaborn Chart Types',
          duration: '90 mins',
          completed: false,
          lessonText: "Master distribution plots (histograms, box plots) and time-series line charts for price index monitoring. Map categorical variables using Seaborn palette parameters.",
          codeSnippet: `import seaborn as sns\nsns.boxplot(x='sector', y='cpi_index', data=df, palette='Blues')\nplt.ylabel('CPI Score')\nplt.show()`,
          takeaways: ["Plot frequency distributions with histograms", "Create group boxplots to highlight variation", "Format multi-panel Seaborn figures"]
        },
        {
          id: 'm2_3',
          title: 'Module 3: Interactive Dashboards & Layout Standards',
          duration: '120 mins',
          completed: false,
          lessonText: "Combine visual charts into interactive dashboard layouts for senior ministry leadership.",
          codeSnippet: `# Interactive Plotly indicator map\nimport plotly.express as px\nfig = px.choropleth(df, locations='state_code', color='gdp_growth')\nfig.show()`,
          takeaways: ["Structure executive dashboard layouts", "Embed interactive Plotly widgets", "Export vector graphics for publication"]
        }
      ]
    },
    {
      id: 3,
      title: 'Survey Methodology & Sampling Techniques',
      competency: 'Survey Methodology',
      difficulty: 'Advanced',
      duration: '6 hours',
      progress: 65,
      provider: 'MoSPI Internal Academy',
      igotBadge: false,
      modules: [
        {
          id: 'm3_1',
          title: 'Module 1: Stratified Random Sampling in NSS Rounds',
          duration: '90 mins',
          completed: true,
          lessonText: "Stratification divides the national population into homogeneous strata (Rural/Urban, Income Slabs) to reduce sampling variance and ensure accurate representation.",
          codeSnippet: `# Stratified sample allocation formula\nn_h = (N_h / N) * total_sample_size\nprint("Allocated stratum sample:", n_h)`,
          takeaways: ["Formulate homogeneous stratification bounds", "Calculate proportional sample allocations", "Lower standard errors across sub-populations"]
        },
        {
          id: 'm3_2',
          title: 'Module 2: Multi-stage Cluster Sampling Frameworks',
          duration: '90 mins',
          completed: true,
          lessonText: "First stage units (FSUs) comprise villages and urban frame blocks. Second stage units (SSUs) comprise households selected for survey enumeration.",
          codeSnippet: `# Primary Sampling Unit (PSU) selection\npsu_sample = np.random.choice(villages, size=50, replace=False, p=village_probabilities)`,
          takeaways: ["Define FSUs and SSUs in field operations", "Apply Probability Proportional to Size (PPS) sampling", "Calculate Design Effects (DEFF)"]
        },
        {
          id: 'm3_3',
          title: 'Module 3: Non-response Bias & Weight Calibration',
          duration: '120 mins',
          completed: true,
          lessonText: "Adjust field survey multiplier weights to account for non-response and align sample estimates with population census benchmarks.",
          codeSnippet: `# Multiplier weight calibration\ncalibrated_weight = base_multiplier * (1 / response_rate)`,
          takeaways: ["Identify non-response bias sources", "Apply inverse probability weighting", "Calibrate survey weights against Census controls"]
        }
      ]
    }
  ];

  const [coursesState, setCoursesState] = useState(initialCourses);

  // Fetch all live iGOT courses and materials from backend catalog
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/igot/courses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((c, idx) => ({
            id: c.igot_id || idx + 1,
            title: c.title,
            competency: c.competency,
            difficulty: c.difficulty || 'Intermediate',
            duration: c.duration || '4 hours',
            progress: idx === 0 ? 35 : (idx === 1 ? 10 : (idx === 2 ? 65 : 0)),
            provider: c.provider || 'iGOT Karmayogi',
            igotBadge: true,
            url: c.url || `https://igotkarmayogi.gov.in/app/search?q=${encodeURIComponent(c.title)}`,
            modules: c.modules || [
              {
                id: `m_${idx}_1`,
                title: `Module 1: Introduction to ${c.title}`,
                duration: '60 mins',
                completed: false,
                lessonText: c.description || `Comprehensive guidelines and training materials for ${c.title} under the iGOT Karmayogi Civil Services Capacity Building Framework.`,
                codeSnippet: `# Python Implementation for ${c.competency}\nimport pandas as pd\nimport numpy as np\nprint("Executing statistical pipeline for ${c.title}")`,
                takeaways: ["Understand key theoretical foundations", "Apply statistical methods to MoSPI microdata", "Comply with official reporting standards"]
              }
            ]
          }));
          setCoursesState(formatted);
        }
      })
      .catch(err => console.log("Using initial fallback course catalog:", err));
  }, []);

  const getCourseIGOTUrl = (course) => {
    if (!course) return "https://igotkarmayogi.gov.in/";
    if (course.url) return course.url;
    if (course.igot_id && String(course.igot_id).startsWith("do_")) {
      return `https://igotkarmayogi.gov.in/app/toc/${course.igot_id}/overview`;
    }
    return `https://igotkarmayogi.gov.in/app/search?q=${encodeURIComponent(course.title || course.competency || 'Statistics')}`;
  };

  // Safely find matching course from catalog
  const findCourse = (target) => {
    if (!target) return coursesState[0];
    const targetTitle = typeof target === 'string' ? target : (target.title || target.competency || '');
    if (!targetTitle) return coursesState[0];
    const match = coursesState.find(c =>
      c.title.toLowerCase().includes(targetTitle.toLowerCase()) ||
      c.competency.toLowerCase().includes(targetTitle.toLowerCase())
    );
    return match || coursesState[0];
  };

  const [activeCourse, setActiveCourse] = useState(() => findCourse(selectedCourse));
  const [readingModule, setReadingModule] = useState(null);

  useEffect(() => {
    if (selectedCourse) {
      const match = findCourse(selectedCourse);
      setActiveCourse(match);
    }
  }, [selectedCourse]);

  const toggleModuleCompletion = (modId) => {
    if (!activeCourse) return;

    const updatedModules = activeCourse.modules.map(m => m.id === modId ? { ...m, completed: !m.completed } : m);
    const completedCount = updatedModules.filter(m => m.completed).length;
    const newProgress = Math.round((completedCount / updatedModules.length) * 100);

    const updatedCourse = { ...activeCourse, modules: updatedModules, progress: newProgress };

    setActiveCourse(updatedCourse);
    setCoursesState(coursesState.map(c => c.id === updatedCourse.id ? updatedCourse : c));

    if (readingModule && readingModule.id === modId) {
      setReadingModule({ ...readingModule, completed: !readingModule.completed });
    }
  };

  const handleDownloadNotes = (mod) => {
    if (!mod) return;
    const content = `
================================================================================
GOVERNMENT OF INDIA • MINISTRY OF STATISTICS & PROGRAMME IMPLEMENTATION (MoSPI)
OFFICIAL CAPACITY BUILDING LESSON NOTES • iGOT KARMAYOGI FRAMEWORK
================================================================================

MODULE TITLE: ${mod.title}
ESTIMATED DURATION: ${mod.duration}
TARGET COMPETENCY: ${activeCourse?.competency || 'Official Statistics'}
PROVIDER: ${activeCourse?.provider || 'iGOT Karmayogi'}

--------------------------------------------------------------------------------
1. MODULE OVERVIEW & OFFICIAL GUIDELINES
--------------------------------------------------------------------------------
${mod.lessonText}

--------------------------------------------------------------------------------
2. CODE IMPLEMENTATION / STATISTICAL FORMULA
--------------------------------------------------------------------------------
${mod.codeSnippet || 'N/A'}

--------------------------------------------------------------------------------
3. KEY TAKEAWAYS
--------------------------------------------------------------------------------
${mod.takeaways ? mod.takeaways.map((t, i) => `${i+1}. ${t}`).join('\n') : 'N/A'}

--------------------------------------------------------------------------------
Official Statistical System Capacity Building Portal
iGOT Karmayogi Live Portal: https://igotkarmayogi.gov.in/
================================================================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = `MoSPI_Lesson_Notes_${mod.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
            Enrolled Learning Catalog
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
            My Courses & Study Workspace
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any module below to open full lesson readings, code examples, and study guides
          </p>
        </div>
      </div>

      {/* Course Reader View Modal / Area if selected */}
      {activeCourse ? (
        <div className="bg-white rounded-2xl p-6 border border-blue-300 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 font-bold text-[10px] uppercase">
                Active Study Workspace
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">{activeCourse.title}</h3>
              <p className="text-xs text-slate-500">{activeCourse.competency} • Provided by {activeCourse.provider}</p>
            </div>
            <button
              onClick={() => setActiveCourse(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-xs text-slate-700 hover:bg-slate-200 cursor-pointer self-start sm:self-auto"
            >
              Back to Catalog
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-5">
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-blue-700" />
                  Study Guide & Lesson Content
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Welcome to <strong>{activeCourse.title}</strong>. Click any module in the checklist below to launch the **Interactive Reader**, view Python code examples, read MoSPI statistical guidelines, and complete training.
                </p>
                <div className="p-3 bg-white rounded-lg border border-blue-100 text-xs space-y-1 text-slate-700 font-medium">
                  <p>🔹 <strong>Interactive Modules:</strong> Click any topic row to open lesson notes & code samples.</p>
                  <p>🔹 <strong>Assessment Target:</strong> Complete pending modules before attempting the AI quiz.</p>
                </div>
              </div>

              {/* Interactive Module Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">Course Modules Checklist (Click to Read Module)</h4>
                  <span className="text-xs font-bold text-blue-700">{activeCourse.progress}% Progress</span>
                </div>

                {activeCourse.modules.map((mod, idx) => (
                  <div
                    key={mod.id || idx}
                    onClick={() => setReadingModule(mod)}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:bg-blue-50/60 hover:border-blue-300 transition cursor-pointer group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleModuleCompletion(mod.id);
                        }}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition cursor-pointer ${
                          mod.completed ? 'bg-emerald-600 text-white' : 'bg-slate-100 border border-slate-300 text-transparent group-hover:text-slate-400'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-blue-900 flex items-center gap-2">
                          {mod.title}
                          <span className="text-[10px] text-blue-700 opacity-0 group-hover:opacity-100 font-normal underline">Read Lesson →</span>
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium">Estimated Time: {mod.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded ${mod.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                        {mod.completed ? 'Completed' : 'Pending'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#0a2540] text-white p-5 rounded-2xl border border-blue-900 space-y-4 shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-blue-900 px-2 py-0.5 rounded">
                  AI Assessment
                </span>
                <h4 className="font-bold text-white text-sm">Module Competency Test</h4>
                <p className="text-xs text-slate-300">Ready to evaluate your competency? Take the AI-generated assessment for this course.</p>
                <button
                  onClick={onTakeQuiz}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Award className="w-4 h-4 text-slate-950" />
                  <span>Take Course Assessment</span>
                </button>
              </div>

              {activeCourse.igotBadge && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                  <span className="font-bold text-emerald-900 flex items-center gap-1">
                    <Globe className="w-4 h-4 text-emerald-600" /> iGOT Karmayogi Portal
                  </span>
                  <p className="text-emerald-800">This module is certified under the iGOT Karmayogi Civil Services Framework.</p>
                  <button
                    onClick={() => onOpenIGOTModal && onOpenIGOTModal(activeCourse)}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View iGOT Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Course Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coursesState.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] uppercase">
                    {course.competency}
                  </span>
                  {course.igotBadge && (
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                      iGOT
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">{course.title}</h3>

                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                    <span>Progress</span>
                    <span className="text-blue-700 font-bold">{course.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${course.progress}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setActiveCourse(course)}
                  className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition cursor-pointer text-center"
                >
                  Open Study Workspace
                </button>
                {course.igotBadge && (
                  <button
                    onClick={() => onOpenIGOTModal && onOpenIGOTModal(course)}
                    className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Module Lesson Reader Modal */}
      {readingModule && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 font-bold text-[10px] uppercase">
                  Lesson Reader • {activeCourse?.competency}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">{readingModule.title}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Estimated Duration: {readingModule.duration}</p>
              </div>
              <button
                onClick={() => setReadingModule(null)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lesson Reading Text */}
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-700" />
                  Module Overview & Official Guidelines
                </h4>
                <p>{readingModule.lessonText}</p>
              </div>

              {/* Code Snippet / Official Formula */}
              {readingModule.codeSnippet && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-purple-700" />
                    Python Code Implementation / Official Formula
                  </h4>
                  <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto leading-normal">
                    <code>{readingModule.codeSnippet}</code>
                  </pre>
                </div>
              )}

              {/* Key Takeaways */}
              {readingModule.takeaways && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs">Key Takeaways:</h4>
                  <ul className="space-y-1.5 list-disc list-inside bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-blue-950 font-medium">
                    {readingModule.takeaways.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleDownloadNotes(readingModule)}
                  className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs border border-blue-200 transition flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-none justify-center"
                >
                  <Download className="w-4 h-4 text-blue-700" />
                  <span>Download Lesson Notes</span>
                </button>
                <a
                  href={getCourseIGOTUrl(activeCourse)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 transition flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-none justify-center"
                >
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>Open Course on Live iGOT Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => toggleModuleCompletion(readingModule.id)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer ${
                    readingModule.completed
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{readingModule.completed ? 'Completed ✓' : 'Mark as Completed'}</span>
                </button>
                <button
                  onClick={() => setReadingModule(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
