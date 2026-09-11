from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    role = Column(String)  # Employee or Admin
    designation = Column(String)
    department = Column(String)
    overall_competency = Column(Float, default=72.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Competency(Base):
    __tablename__ = "competencies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    category = Column(String)
    description = Column(Text)
    required_level = Column(Float, default=85.0)

class EmployeeCompetency(Base):
    __tablename__ = "employee_competencies"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    competency_name = Column(String)
    current_level = Column(Float)
    required_level = Column(Float)
    gap = Column(Float)
    priority = Column(String)  # High, Medium, Low
    status = Column(String)    # Achieved, Needs Improvement, High Priority

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    competency = Column(String)
    difficulty = Column(String)
    duration = Column(String)
    progress = Column(Float, default=0.0)
    provider = Column(String)
    igot_badge = Column(Boolean, default=False)
    reason = Column(Text)
    url = Column(String)

class LearningResource(Base):
    __tablename__ = "learning_resources"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    file_type = Column(String)
    file_size = Column(String)
    uploaded_by = Column(String)
    upload_date = Column(String)
    competency = Column(String)
    difficulty = Column(String)
    quiz_status = Column(String)  # Generated, Pending
    content_text = Column(Text)

class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    competency = Column(String)
    difficulty = Column(String)
    total_questions = Column(Integer)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    question_text = Column(Text)
    option_a = Column(String)
    option_b = Column(String)
    option_c = Column(String)
    option_d = Column(String)
    correct_option = Column(String)
    difficulty = Column(String)
    topic = Column(String)
    explanation = Column(Text)

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    score_percentage = Column(Float)
    correct_count = Column(Integer)
    total_questions = Column(Integer)
    ai_feedback = Column(Text)
    completed_at = Column(DateTime, default=datetime.utcnow)
