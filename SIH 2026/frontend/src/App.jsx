import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

// Employee Pages
import EmployeeDashboard from './pages/EmployeeDashboard';
import MyCompetencyPage from './pages/MyCompetencyPage';
import LearningPathPage from './pages/LearningPathPage';
import AIRecommendationsPage from './pages/AIRecommendationsPage';
import MyCoursesPage from './pages/MyCoursesPage';
import MyQuizzesPage from './pages/MyQuizzesPage';
import QuizTakingPage from './pages/QuizTakingPage';
import QuizResultsPage from './pages/QuizResultsPage';
import MyProgressPage from './pages/MyProgressPage';
import IGOTKarmayogiPage from './pages/iGOTKarmayogiPage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminEmployeesPage from './pages/AdminEmployeesPage';
import AdminResourcesPage from './pages/AdminResourcesPage';
import AdminQuizGeneratorPage from './pages/AdminQuizGeneratorPage';
import AdminQuizEditorPage from './pages/AdminQuizEditorPage';
import AdminQuizManagementPage from './pages/AdminQuizManagementPage';
import AdminiGOTIntegrationPage from './pages/AdminiGOTIntegrationPage';
import AdminReportsPage from './pages/AdminReportsPage';
import SettingsPage from './pages/SettingsPage';

function MainApp() {
  const { user } = useAuth();
  const [viewState, setViewState] = useState('landing'); // 'landing', 'login', 'portal'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Active quiz state
  const [quizResults, setQuizResults] = useState(null);
  const [generatedQuizData, setGeneratedQuizData] = useState(null);

  // Active course state for in-app workspace
  const [selectedCourse, setSelectedCourse] = useState(null);

  // iGOT Modal simulation
  const [selectedIGOTCourse, setSelectedIGOTCourse] = useState(null);

  const handleStartCourse = (course) => {
    if (course) setSelectedCourse(course);
    setActiveTab('my-courses');
  };

  const handleOpenIGOTModal = (course) => {
    setSelectedIGOTCourse(course);
  };

  const handleStartQuiz = () => {
    setActiveTab('quiz-taking');
  };

  const handleQuizComplete = (results) => {
    setQuizResults(results);
    setActiveTab('quiz-results');
  };

  const handleQuizGenerated = (quizData) => {
    setGeneratedQuizData(quizData);
    setActiveTab('admin-quiz-editor');
  };

  // Render view based on state
  if (viewState === 'landing') {
    return (
      <LandingPage
        onLoginClick={() => setViewState('login')}
        onExploreClick={() => {
          setViewState('portal');
          setActiveTab('dashboard');
        }}
      />
    );
  }

  if (viewState === 'login') {
    return (
      <LoginPage
        onLoginSuccess={() => setViewState('portal')}
      />
    );
  }

  const isAdmin = user?.role === 'Admin';

  const renderContent = () => {
    if (isAdmin) {
      switch (activeTab) {
        case 'admin-dashboard':
          return <AdminDashboard setActiveTab={setActiveTab} />;
        case 'admin-employees':
        case 'admin-competency-analytics':
          return <AdminEmployeesPage />;
        case 'admin-learning-resources':
          return <AdminResourcesPage onGenerateQuizFromResource={(res) => {
            setGeneratedQuizData({
              title: `AI Generated Quiz - ${res.competency}`,
              competency: res.competency,
              difficulty: res.difficulty,
              questions: []
            });
            setActiveTab('admin-quiz-generator');
          }} />;
        case 'admin-quiz-generator':
          return <AdminQuizGeneratorPage onQuizGenerated={handleQuizGenerated} />;
        case 'admin-quiz-editor':
          return <AdminQuizEditorPage quizData={generatedQuizData} onPublishQuiz={() => setActiveTab('admin-quiz-management')} onBack={() => setActiveTab('admin-quiz-generator')} />;
        case 'admin-quiz-management':
          return <AdminQuizManagementPage onGenerateNew={() => setActiveTab('admin-quiz-generator')} />;
        case 'admin-igot-integration':
          return <AdminiGOTIntegrationPage />;
        case 'admin-reports':
          return <AdminReportsPage />;
        case 'settings':
          return <SettingsPage />;
        default:
          return <AdminDashboard setActiveTab={setActiveTab} />;
      }
    } else {
      switch (activeTab) {
        case 'dashboard':
          return (
            <EmployeeDashboard
              setActiveTab={setActiveTab}
              onStartCourse={handleStartCourse}
              onOpenIGOTModal={handleOpenIGOTModal}
            />
          );
        case 'my-competency':
          return <MyCompetencyPage setActiveTab={setActiveTab} />;
        case 'learning-path':
          return (
            <LearningPathPage
              setActiveTab={setActiveTab}
              onStartCourse={handleStartCourse}
              onOpenIGOTModal={handleOpenIGOTModal}
            />
          );
        case 'ai-recommendations':
          return (
            <AIRecommendationsPage
              onStartCourse={handleStartCourse}
              onOpenIGOTModal={handleOpenIGOTModal}
            />
          );
        case 'my-courses':
          return (
            <MyCoursesPage
              selectedCourse={selectedCourse}
              onTakeQuiz={handleStartQuiz}
              onOpenIGOTModal={handleOpenIGOTModal}
            />
          );
        case 'my-quizzes':
          return <MyQuizzesPage onStartQuiz={handleStartQuiz} />;
        case 'quiz-taking':
          return (
            <QuizTakingPage
              onQuizComplete={handleQuizComplete}
              onCancel={() => setActiveTab('my-quizzes')}
            />
          );
        case 'quiz-results':
          return (
            <QuizResultsPage
              results={quizResults}
              onContinueLearning={() => setActiveTab('learning-path')}
              onRetakeQuiz={handleStartQuiz}
              onViewCompetency={() => setActiveTab('my-competency')}
            />
          );
        case 'my-progress':
          return <MyProgressPage />;
        case 'igot-karmayogi':
          return <IGOTKarmayogiPage onOpenIGOTModal={handleOpenIGOTModal} />;
        case 'settings':
          return <SettingsPage />;
        default:
          return <EmployeeDashboard setActiveTab={setActiveTab} onStartCourse={handleStartCourse} onOpenIGOTModal={handleOpenIGOTModal} />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Header
        toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onSwitchLogin={() => setViewState('login')}
      />

      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
          }}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
          onSwitchLogin={() => setViewState('login')}
        />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      <Toast />

      {/* Global iGOT Integration Modal */}
      {selectedIGOTCourse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto font-bold text-xl">
              🌐
            </div>
            <h4 className="text-base font-bold text-slate-900">iGOT Karmayogi Portal Integration</h4>
            <p className="text-xs text-slate-600">
              Module: <strong>{selectedIGOTCourse.title}</strong>
            </p>
            <div className="p-3.5 bg-slate-50 rounded-xl border text-xs text-slate-700 text-left space-y-1 font-medium">
              <p>🔹 <strong>Integration Mode:</strong> NPCSCB MDO Civil Services Framework</p>
              <p>🔹 <strong>Auto Sync:</strong> Progress syncs back to MoSPI Competency Engine</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedIGOTCourse(null);
                  handleStartCourse(selectedIGOTCourse);
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs cursor-pointer shadow-sm"
              >
                🎓 Study In-App Workspace
              </button>
              <a
                href={selectedIGOTCourse?.url || `https://igotkarmayogi.gov.in/app/search?q=${encodeURIComponent(selectedIGOTCourse?.title || 'Statistics')}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => setSelectedIGOTCourse(null)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer shadow-sm"
              >
                🌐 Visit Specific Course on iGOT Portal
              </a>
            </div>
            <button
              onClick={() => setSelectedIGOTCourse(null)}
              className="text-xs text-slate-400 font-semibold hover:text-slate-600 cursor-pointer pt-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
