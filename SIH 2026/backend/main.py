from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import sys
import os
import random

# Add parent directory to python path for ai imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, get_db, Base
from models import User, Competency, EmployeeCompetency, Course, LearningResource, Quiz, Question, QuizAttempt
from seed import seed_database
from ai.document_processor import DocumentProcessor
from ai.question_generator import AIQuestionGenerator
from ai.recommendation_engine import AIRecommendationEngine
from igot_service import IGOTKarmayogiService

app = FastAPI(title="AI-Enabled Learning Platform API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_db_check():
    seed_database()

@app.get("/api/health")
def health_check():
    return {"status": "online", "system": "India's Official Statistical System - Competency Platform"}

# ---------------- USER & AUTH ---------------- #
@app.post("/api/auth/login")
def login(data: dict = Body(...), db: Session = Depends(get_db)):
    email = data.get("email", "").lower()
    role = data.get("role", "Employee")
    
    if "admin" in email or role == "Admin":
        user = db.query(User).filter(User.role == "Admin").first()
    else:
        user = db.query(User).filter(User.role == "Employee").first()
        
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {
        "user_id": user.id,
        "employee_id": user.employee_id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "designation": user.designation,
        "department": user.department,
        "overall_competency": user.overall_competency
    }

# ---------------- COMPETENCY ---------------- #
@app.get("/api/employee/{user_id}/competencies")
def get_employee_competencies(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(User).filter(User.role == "Employee").first()
        
    comps = db.query(EmployeeCompetency).filter(EmployeeCompetency.user_id == user.id).all()
    comp_list = []
    for c in comps:
        comp_list.append({
            "competency": c.competency_name,
            "current": c.current_level,
            "required": c.required_level,
            "gap": c.gap,
            "priority": c.priority,
            "status": c.status
        })
        
    return {
        "employee_name": user.name,
        "designation": user.designation,
        "department": user.department,
        "overall_competency": user.overall_competency,
        "competencies": comp_list
    }

# ---------------- RECOMMENDATIONS & iGOT LIVE API ---------------- #
@app.get("/api/employee/{user_id}/recommendations")
def get_recommendations(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(User).filter(User.role == "Employee").first()
        
    comps = db.query(EmployeeCompetency).filter(EmployeeCompetency.user_id == user.id).all()
    comp_dict = {c.competency_name: c.current_level for c in comps}
    
    gaps = AIRecommendationEngine.calculate_gaps(user.designation, comp_dict)
    recs = AIRecommendationEngine.generate_recommendations(user.designation, gaps, [])
    
    ai_insight = (
        f"Your largest competency gap is {gaps[0]['competency']} ({gaps[0]['gap']:.0f}% gap). Based on your role as "
        f"{user.designation}, previous learning activity, and assessment performance, we recommend completing the "
        f"'{recs[0]['title']}' learning path before your next competency assessment."
    )
    
    return {
        "ai_insight": ai_insight,
        "top_gaps": gaps,
        "recommendations": recs
    }

@app.get("/api/igot/courses")
def get_igot_courses(db: Session = Depends(get_db)):
    """Returns official iGOT Karmayogi catalog dataset."""
    return IGOTKarmayogiService.search_live_courses()

@app.get("/api/igot/roles")
def get_igot_roles():
    """Returns official iGOT Karmayogi civil service roles."""
    return IGOTKarmayogiService.get_all_karmayogi_roles()

@app.get("/api/igot/search")
def search_igot_api(q: str = Query("", description="Query string for iGOT course search"), competency: str = Query("")):
    """Live Search API against Sunbird / iGOT Karmayogi content endpoints."""
    return IGOTKarmayogiService.search_live_courses(query=q, competency=competency)

@app.get("/api/igot/metrics")
def get_igot_metrics():
    """Live API connectivity & telemetry status metrics."""
    return IGOTKarmayogiService.get_igot_framework_metrics()

@app.post("/api/igot/telemetry/sync")
def sync_igot_telemetry(data: dict = Body(...)):
    """Simulates live MDO telemetry sync callback for civil services capacity building."""
    return {
        "status": "success",
        "message": "Telemetry event successfully dispatched to iGOT Karmayogi MDO server.",
        "synced_event": data
    }

# ---------------- QUIZZES & ASSESSMENT ---------------- #
@app.get("/api/quizzes")
def list_quizzes(db: Session = Depends(get_db)):
    quizzes = db.query(Quiz).all()
    result = []
    for q in quizzes:
        q_count = db.query(Question).filter(Question.quiz_id == q.id).count()
        result.append({
            "id": q.id,
            "title": q.title,
            "competency": q.competency,
            "difficulty": q.difficulty,
            "total_questions": q_count or q.total_questions,
            "is_published": q.is_published
        })
    return result

@app.get("/api/quizzes/{quiz_id}")
def get_quiz_details(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        quiz = db.query(Quiz).first()
        
    questions = db.query(Question).filter(Question.quiz_id == quiz.id).all()
    q_list = []
    for idx, q in enumerate(questions, start=1):
        q_list.append({
            "id": q.id,
            "question_number": idx,
            "question_text": q.question_text,
            "options": [
                {"key": "A", "text": q.option_a},
                {"key": "B", "text": q.option_b},
                {"key": "C", "text": q.option_c},
                {"key": "D", "text": q.option_d}
            ],
            "correct_option": q.correct_option,
            "difficulty": q.difficulty,
            "topic": q.topic,
            "explanation": q.explanation
        })
        
    return {
        "quiz_id": quiz.id,
        "title": quiz.title,
        "competency": quiz.competency,
        "difficulty": quiz.difficulty,
        "total_questions": len(q_list),
        "questions": q_list
    }

@app.post("/api/quizzes/{quiz_id}/submit")
def submit_quiz(quiz_id: int, data: dict = Body(...), db: Session = Depends(get_db)):
    user_answers = data.get("answers", {})  # e.g., {question_id: "B"}
    user_id = data.get("user_id", 1)
    
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    questions = db.query(Question).filter(Question.quiz_id == quiz.id).all()
    
    correct_count = 0
    total = len(questions)
    topic_scores = {}
    
    for q in questions:
        user_ans = user_answers.get(str(q.id)) or user_answers.get(q.id)
        topic = q.topic or "General"
        if topic not in topic_scores:
            topic_scores[topic] = {"correct": 0, "total": 0}
            
        topic_scores[topic]["total"] += 1
        
        if user_ans and user_ans.upper() == q.correct_option.upper():
            correct_count += 1
            topic_scores[topic]["correct"] += 1

    score_pct = round((correct_count / total * 100)) if total > 0 else 80.0
    
    # Topic breakdown formatted
    breakdown = []
    for top, stats in topic_scores.items():
        pct = round(stats["correct"] / stats["total"] * 100) if stats["total"] > 0 else 0
        breakdown.append({"topic": top, "score": pct})
        
    # AI Feedback text
    if score_pct >= 80:
        feedback = f"Outstanding performance! You scored {score_pct}% overall. You demonstrated strong mastery of statistical principles and key concepts."
    elif score_pct >= 60:
        feedback = f"Good effort! You scored {score_pct}%. You performed well in fundamentals but need additional practice in weak topics. We recommend reviewing recommended courses."
    else:
        feedback = f"Your score is {score_pct}%. Additional focus is required in statistical methodologies. We recommend retaking the module training before the next evaluation."

    # Save Attempt
    attempt = QuizAttempt(
        user_id=user_id,
        quiz_id=quiz.id,
        score_percentage=score_pct,
        correct_count=correct_count,
        total_questions=total,
        ai_feedback=feedback
    )
    db.add(attempt)
    
    # Dynamic update of employee competency score!
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        # Boost overall competency slightly upon quiz completion
        user.overall_competency = min(100.0, user.overall_competency + 2.0)
        # Update target competency if applicable
        target_comp = db.query(EmployeeCompetency).filter(
            EmployeeCompetency.user_id == user.id,
            EmployeeCompetency.competency_name == quiz.competency
        ).first()
        if target_comp:
            target_comp.current_level = min(100.0, target_comp.current_level + 5.0)
            target_comp.gap = max(0.0, target_comp.required_level - target_comp.current_level)
            if target_comp.gap <= 0:
                target_comp.priority = "Low"
                target_comp.status = "Achieved"
            elif target_comp.gap < 15:
                target_comp.priority = "Medium"
                target_comp.status = "Needs Improvement"
                
    db.commit()

    return {
        "score_percentage": score_pct,
        "correct_count": correct_count,
        "total_questions": total,
        "topic_breakdown": breakdown,
        "ai_feedback": feedback,
        "new_overall_competency": user.overall_competency if user else 74.0
    }

# ---------------- ADMIN & GENERATOR ---------------- #
@app.get("/api/admin/stats")
def get_admin_stats():
    return {
        "total_employees": 1250,
        "average_competency": 74.0,
        "active_learners": 890,
        "courses_available": 85,
        "quizzes_generated": 320,
        "department_competencies": [
            {"department": "Statistics", "score": 85},
            {"department": "Data Analysis", "score": 76},
            {"department": "Python", "score": 58},
            {"department": "Visualization", "score": 48},
            {"department": "Survey Methodology", "score": 71}
        ],
        "top_gaps": [
            {"name": "Data Visualization", "priority": "High", "gap_score": 35},
            {"name": "Python for Statistics", "priority": "High", "gap_score": 25},
            {"name": "Statistical Programming", "priority": "Medium", "gap_score": 15},
            {"name": "Survey Methodology", "priority": "Medium", "gap_score": 7}
        ]
    }

@app.get("/api/admin/employees")
def get_employees(search: str = "", dept: str = "", db: Session = Depends(get_db)):
    users = db.query(User).all()
    employees = [
        {
            "id": 1,
            "employee_id": "EMP-10482",
            "name": "Vigneshwaran S",
            "department": "Official Statistics",
            "role": "Statistical Officer",
            "overall_competency": 72,
            "learning_progress": "68%",
            "status": "Active"
        },
        {
            "id": 2,
            "employee_id": "EMP-10483",
            "name": "Ananya Roy",
            "department": "National Accounts Division",
            "role": "Senior Statistical Officer",
            "overall_competency": 84,
            "learning_progress": "85%",
            "status": "Active"
        },
        {
            "id": 3,
            "employee_id": "EMP-10484",
            "name": "Rajesh Kumar",
            "department": "Survey Design & Research",
            "role": "Assistant Director",
            "overall_competency": 65,
            "learning_progress": "40%",
            "status": "Needs Review"
        },
        {
            "id": 4,
            "employee_id": "EMP-10485",
            "name": "Priya Nair",
            "department": "Field Operations Division",
            "role": "Statistical Inspector",
            "overall_competency": 79,
            "learning_progress": "92%",
            "status": "Active"
        },
        {
            "id": 5,
            "employee_id": "EMP-10486",
            "name": "Siddharth Verma",
            "department": "Price Statistics Division",
            "role": "Data Analyst",
            "overall_competency": 58,
            "learning_progress": "25%",
            "status": "High Priority Gap"
        }
    ]
    return employees

@app.get("/api/admin/resources")
def get_learning_resources(db: Session = Depends(get_db)):
    resources = db.query(LearningResource).all()
    return [{
        "id": r.id,
        "title": r.title,
        "file_type": r.file_type,
        "file_size": r.file_size,
        "uploaded_by": r.uploaded_by,
        "upload_date": r.upload_date,
        "competency": r.competency,
        "difficulty": r.difficulty,
        "quiz_status": r.quiz_status
    } for r in resources]

@app.post("/api/admin/resources/upload")
async def upload_resource(
    file: UploadFile = File(...),
    competency: str = Form("Statistical Programming"),
    difficulty: str = Form("Medium"),
    db: Session = Depends(get_db)
):
    content_bytes = await file.read()
    extracted_text = DocumentProcessor.extract_text(file.filename, content_bytes)
    
    file_size_str = f"{len(content_bytes) / 1024 / 1024:.1f} MB" if len(content_bytes) > 1024*1024 else f"{len(content_bytes) / 1024:.0f} KB"
    ext_upper = file.filename.split(".")[-1].upper() if "." in file.filename else "PDF"
    
    resource = LearningResource(
        title=file.filename,
        file_type=ext_upper,
        file_size=file_size_str,
        uploaded_by="Admin User",
        upload_date="2026-08-29",
        competency=competency,
        difficulty=difficulty,
        quiz_status="Pending",
        content_text=extracted_text
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    
    return {
        "id": resource.id,
        "filename": resource.title,
        "file_type": resource.file_type,
        "file_size": resource.file_size,
        "competency": resource.competency,
        "quiz_status": resource.quiz_status,
        "message": "File uploaded and processed successfully!"
    }

@app.post("/api/admin/generate-quiz")
def generate_quiz_endpoint(data: dict = Body(...), db: Session = Depends(get_db)):
    num_questions = int(data.get("num_questions", 5))
    difficulty = data.get("difficulty", "Medium")
    competency = data.get("competency", "Statistical Programming")
    resource_id = data.get("resource_id")
    text_content = data.get("text_content", "")
    
    if resource_id:
        res = db.query(LearningResource).filter(LearningResource.id == resource_id).first()
        if res and res.content_text:
            text_content = res.content_text
            res.quiz_status = "Generated"
            db.commit()

    if not text_content:
        text_content = f"Material for {competency} statistical capacity building."

    questions = AIQuestionGenerator.generate_quiz(
        text_content=text_content,
        num_questions=num_questions,
        difficulty=difficulty,
        competency=competency
    )
    
    return {
        "status": "success",
        "quiz_title": f"AI Generated Quiz - {competency}",
        "competency": competency,
        "difficulty": difficulty,
        "questions_count": len(questions),
        "questions": questions
    }

@app.post("/api/admin/quizzes/save")
def save_published_quiz(data: dict = Body(...), db: Session = Depends(get_db)):
    title = data.get("quiz_title", "New AI Generated Quiz")
    competency = data.get("competency", "Python")
    difficulty = data.get("difficulty", "Medium")
    questions = data.get("questions", [])
    
    quiz = Quiz(
        title=title,
        competency=competency,
        difficulty=difficulty,
        total_questions=len(questions),
        is_published=True
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    
    for q in questions:
        q_obj = Question(
            quiz_id=quiz.id,
            question_text=q.get("question_text"),
            option_a=q.get("option_a"),
            option_b=q.get("option_b"),
            option_c=q.get("option_c"),
            option_d=q.get("option_d"),
            correct_option=q.get("correct_option", "B"),
            difficulty=q.get("difficulty", difficulty),
            topic=q.get("topic", competency),
            explanation=q.get("explanation", "")
        )
        db.add(q_obj)
        
    db.commit()
    return {"message": "Quiz saved and published successfully!", "quiz_id": quiz.id}
