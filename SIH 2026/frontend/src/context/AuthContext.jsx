import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const initialEmployee = {
  id: 1,
  employee_id: "EMP-10482",
  name: "Vigneshwaran S",
  email: "vigneshwaran@mospi.gov.in",
  role: "Employee",
  designation: "Statistical Officer",
  department: "Official Statistics",
  overall_competency: 72,
  competency_achieved: "12 / 16",
  active_courses: 4,
  latest_quiz_score: 85,
  competencies: [
    { competency: "Statistics", current: 90, required: 90, gap: 0, priority: "Low", status: "Achieved" },
    { competency: "Python", current: 60, required: 85, gap: 25, priority: "High", status: "Needs Improvement" },
    { competency: "Data Visualization", current: 45, required: 80, gap: 35, priority: "High", status: "High Priority" },
    { competency: "Survey Methodology", current: 78, required: 85, gap: 7, priority: "Medium", status: "Needs Improvement" },
    { competency: "Data Management", current: 70, required: 80, gap: 10, priority: "Medium", status: "Needs Improvement" },
    { competency: "Data Analysis", current: 76, required: 85, gap: 9, priority: "Medium", status: "Needs Improvement" }
  ]
};

export const initialAdmin = {
  id: 99,
  employee_id: "ADM-001",
  name: "Dr. R. K. Sharma",
  email: "admin@mospi.gov.in",
  role: "Admin",
  designation: "Director General - Capacity Building",
  department: "Central Statistics Office",
  overall_competency: 94
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(initialEmployee);
  const [language, setLanguage] = useState('English');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ message: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loginAsEmployee = () => {
    setUser(initialEmployee);
    showToast("Logged in as Vigneshwaran S (Employee)");
  };

  const loginAsAdmin = () => {
    setUser(initialAdmin);
    showToast("Logged in as Dr. R. K. Sharma (Administrator)");
  };

  const loginCustomUser = ({ name, email, goalType, targetRole, targetCourse }) => {
    const customUser = {
      id: Date.now(),
      employee_id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name.trim() || "Learner User",
      email: email.trim() || "user@mospi.gov.in",
      role: "Employee",
      designation: goalType === 'role' ? (targetRole || "Statistical Officer") : (targetCourse ? `Learner (${targetCourse.split(' ')[0]})` : "Learner"),
      goalType: goalType || 'role',
      targetRole: targetRole || "Statistical Officer",
      targetCourse: targetCourse || "Python for Statistical Analysis & MoSPI Data",
      department: "Official Statistics",
      overall_competency: 68,
      competency_achieved: "10 / 16",
      active_courses: 4,
      latest_quiz_score: 82,
      competencies: [
        { competency: "Statistics", current: 85, required: 90, gap: 5, priority: "Medium", status: "Needs Improvement" },
        { competency: "Python", current: 60, required: 85, gap: 25, priority: "High", status: "Needs Improvement" },
        { competency: "Data Visualization", current: 50, required: 80, gap: 30, priority: "High", status: "High Priority" },
        { competency: "Survey Methodology", current: 75, required: 85, gap: 10, priority: "Medium", status: "Needs Improvement" },
        { competency: "Data Management", current: 70, required: 80, gap: 10, priority: "Medium", status: "Needs Improvement" },
        { competency: "Data Analysis", current: 72, required: 85, gap: 13, priority: "Medium", status: "Needs Improvement" }
      ]
    };
    setUser(customUser);
    showToast(`Welcome ${customUser.name}! Learning goal initialized.`);
  };

  const logout = () => {
    setUser(null);
    showToast("Logged out successfully", "info");
  };

  const updateEmployeeCompetency = (newScore) => {
    if (user && user.role === 'Employee') {
      const updatedScore = Math.min(100, Math.max(user.overall_competency, newScore));
      setUser(prev => ({
        ...prev,
        overall_competency: updatedScore,
        latest_quiz_score: newScore
      }));
      showToast(`Competency updated! Overall Competency is now ${updatedScore}%`);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      language,
      setLanguage,
      loginAsEmployee,
      loginAsAdmin,
      loginCustomUser,
      logout,
      showToast,
      toastMessage,
      updateEmployeeCompetency
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
