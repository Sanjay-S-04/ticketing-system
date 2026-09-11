import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, HelpCircle, AlertTriangle } from 'lucide-react';

export default function QuizTakingPage({ onQuizComplete, onCancel }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes timer

  const questions = [
    {
      id: 1,
      question_text: "Which sampling technique gives every member of a target population an equal probability of selection?",
      options: [
        { key: "A", text: "Convenience Sampling" },
        { key: "B", text: "Simple Random Sampling" },
        { key: "C", text: "Quota Sampling" },
        { key: "D", text: "Judgment Sampling" }
      ],
      correct_option: "B",
      topic: "Sampling Methods"
    },
    {
      id: 2,
      question_text: "In Python pandas, which function is primarily used to aggregate data by categories before applying statistical summary metrics?",
      options: [
        { key: "A", text: "df.pivot_table()" },
        { key: "B", text: "df.groupby()" },
        { key: "C", text: "df.filter()" },
        { key: "D", text: "df.transform()" }
      ],
      correct_option: "B",
      topic: "Python Basics"
    },
    {
      id: 3,
      question_text: "What type of chart is most suitable for representing the distribution of a single continuous statistical variable?",
      options: [
        { key: "A", text: "Bar Chart" },
        { key: "B", text: "Pie Chart" },
        { key: "C", text: "Histogram" },
        { key: "D", text: "Scatter Plot" }
      ],
      correct_option: "C",
      topic: "Data Visualization"
    },
    {
      id: 4,
      question_text: "When assessing multicollinearity in linear regression models for national account indicators, which metric is commonly evaluated?",
      options: [
        { key: "A", text: "Variance Inflation Factor (VIF)" },
        { key: "B", text: "Durbin-Watson Statistic" },
        { key: "C", text: "Akaike Information Criterion (AIC)" },
        { key: "D", text: "Root Mean Squared Error (RMSE)" }
      ],
      correct_option: "A",
      topic: "Statistical Programming"
    },
    {
      id: 5,
      question_text: "Which measure of central tendency is least sensitive to extreme values or outliers in economic survey datasets?",
      options: [
        { key: "A", text: "Arithmetic Mean" },
        { key: "B", text: "Median" },
        { key: "C", text: "Geometric Mean" },
        { key: "D", text: "Weighted Mean" }
      ],
      correct_option: "B",
      topic: "Data Handling"
    },
    {
      id: 6,
      question_text: "In survey methodology for India's National Sample Survey (NSS), what is the main purpose of Stratification?",
      options: [
        { key: "A", text: "To reduce overall sample size without affecting costs" },
        { key: "B", text: "To ensure representation across heterogeneous sub-populations and improve precision" },
        { key: "C", text: "To replace probability sampling with judgment selection" },
        { key: "D", text: "To eliminate non-response bias completely" }
      ],
      correct_option: "B",
      topic: "Data Handling"
    },
    {
      id: 7,
      question_text: "In Matplotlib/Seaborn, which parameter is used to map a categorical variable to distinct colors in a scatter plot?",
      options: [
        { key: "A", text: "color_by" },
        { key: "B", text: "hue" },
        { key: "C", text: "legend" },
        { key: "D", text: "palette_map" }
      ],
      correct_option: "B",
      topic: "Data Visualization"
    },
    {
      id: 8,
      question_text: "Under the Consumer Price Index (CPI) estimation methodology, which formula is traditionally used for index weighting?",
      options: [
        { key: "A", text: "Laspeyres Index Formula" },
        { key: "B", text: "Paasche Index Formula" },
        { key: "C", text: "Fisher Ideal Index Formula" },
        { key: "D", text: "Marshall-Edgeworth Index" }
      ],
      correct_option: "A",
      topic: "Statistical Programming"
    },
    {
      id: 9,
      question_text: "Which Python library is specifically optimized for high-performance multidimensional array computations in statistical modeling?",
      options: [
        { key: "A", text: "Requests" },
        { key: "B", text: "NumPy" },
        { key: "C", text: "BeautifulSoup" },
        { key: "D", text: "Flask" }
      ],
      correct_option: "B",
      topic: "Python Basics"
    },
    {
      id: 10,
      question_text: "What does a P-value less than 0.05 signify in a standard hypothesis test for statistical significance?",
      options: [
        { key: "A", text: "The null hypothesis is 100% true" },
        { key: "B", text: "Strong evidence against the null hypothesis, rejecting it at the 5% level" },
        { key: "C", text: "The alternative hypothesis is false" },
        { key: "D", text: "The sample size was inadequate" }
      ],
      correct_option: "B",
      topic: "Data Handling"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentQ = questions[currentIdx];

  const handleSelectOption = (key) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: key
    }));
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleFinalSubmit = () => {
    let score = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correct_option) score += 1;
    });

    const scorePct = Math.round((score / questions.length) * 100);

    const topicBreakdown = [
      { topic: "Python Basics", score: 90 },
      { topic: "Data Handling", score: 80 },
      { topic: "Data Visualization", score: 60 },
      { topic: "Statistical Programming", score: 85 }
    ];

    onQuizComplete({
      scorePct,
      correctCount: score,
      totalQuestions: questions.length,
      topicBreakdown,
      aiFeedback: scorePct >= 75
        ? "You performed well in Python fundamentals but need additional practice in Data Visualization. We recommend revisiting the Data Visualization module and attempting the practice quiz."
        : "Additional study is recommended for statistical programming concepts."
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans py-4">
      {/* Top Bar */}
      <div className="bg-[#0a2540] text-white rounded-2xl p-6 shadow-md border border-blue-900 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Competency Assessment</span>
          <h2 className="text-xl font-extrabold text-white mt-0.5">Python for Statistical Analysis</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-amber-400 font-mono text-sm font-bold">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>
          <button
            onClick={onCancel}
            className="text-xs font-semibold text-slate-300 hover:text-white underline cursor-pointer"
          >
            Exit Assessment
          </button>
        </div>
      </div>

      {/* Question Counter & Progress Indicators */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span className="text-blue-700">{Object.keys(selectedAnswers).length} of {questions.length} Answered</span>
        </div>

        {/* Dots Indicator */}
        <div className="flex items-center gap-2 justify-between">
          {questions.map((q, idx) => {
            const isAnswered = selectedAnswers[q.id] !== undefined;
            const isCurrent = idx === currentIdx;
            return (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs transition cursor-pointer
                  ${isCurrent ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-100' : isAnswered ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 border border-slate-300'}
                `}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Box */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
            Topic: {currentQ.topic}
          </span>
          <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
            {currentIdx + 1}. {currentQ.question_text}
          </h3>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {currentQ.options.map((opt) => {
            const isSelected = selectedAnswers[currentQ.id] === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => handleSelectOption(opt.key)}
                className={`
                  w-full text-left p-4 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer
                  ${isSelected ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm ring-1 ring-blue-600' : 'bg-slate-50/50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {opt.key}
                  </span>
                  <span>{opt.text}</span>
                </div>
                {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
              </button>
            );
          })}
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <button
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => prev - 1)}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs disabled:opacity-40 transition flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentIdx === questions.length - 1 ? (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <span>Submit Quiz</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentIdx(prev => prev + 1)}
              className="px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal before Submit */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Submit Assessment?</h4>
            <p className="text-xs text-slate-600">
              You have answered <strong>{Object.keys(selectedAnswers).length}</strong> out of <strong>{questions.length}</strong> questions. Are you sure you want to submit?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 cursor-pointer"
              >
                Continue Quiz
              </button>
              <button
                onClick={() => { setShowConfirmModal(false); handleFinalSubmit(); }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
