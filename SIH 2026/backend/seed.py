from database import Base, engine, SessionLocal
from models import User, Competency, EmployeeCompetency, Course, LearningResource, Quiz, Question, QuizAttempt
from datetime import datetime

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing data
    db.query(QuizAttempt).delete()
    db.query(Question).delete()
    db.query(Quiz).delete()
    db.query(LearningResource).delete()
    db.query(Course).delete()
    db.query(EmployeeCompetency).delete()
    db.query(Competency).delete()
    db.query(User).delete()
    db.commit()

    # 1. Users
    vignesh = User(
        employee_id="EMP-10482",
        name="Vigneshwaran S",
        email="vigneshwaran@mospi.gov.in",
        role="Employee",
        designation="Statistical Officer",
        department="Official Statistics",
        overall_competency=72.0
    )
    admin = User(
        employee_id="ADM-001",
        name="Dr. R. K. Sharma",
        email="admin@mospi.gov.in",
        role="Admin",
        designation="Director General - Capacity Building",
        department="Central Statistics Office",
        overall_competency=94.0
    )
    db.add(vignesh)
    db.add(admin)
    db.commit()

    # 2. Competencies & Vigneshwaran's Competencies
    comp_data = [
        ("Statistics", 90.0, 90.0, 0.0, "Low", "Achieved"),
        ("Python", 60.0, 85.0, 25.0, "High", "Needs Improvement"),
        ("Data Visualization", 45.0, 80.0, 35.0, "High", "High Priority"),
        ("Survey Methodology", 78.0, 85.0, 7.0, "Medium", "Needs Improvement"),
        ("Data Management", 70.0, 80.0, 10.0, "Medium", "Needs Improvement"),
        ("Data Analysis", 76.0, 85.0, 9.0, "Medium", "Needs Improvement"),
    ]

    for name, curr, req, gap, prio, status in comp_data:
        comp = Competency(name=name, category="Technical", description=f"{name} standards for MoSPI", required_level=req)
        db.add(comp)
        db.commit()
        
        emp_comp = EmployeeCompetency(
            user_id=vignesh.id,
            competency_name=name,
            current_level=curr,
            required_level=req,
            gap=gap,
            priority=prio,
            status=status
        )
        db.add(emp_comp)

    # 3. Courses
    courses = [
        Course(
            title="Python for Statistical Analysis",
            competency="Python",
            difficulty="Intermediate",
            duration="4 hours",
            progress=35.0,
            provider="iGOT Karmayogi",
            igot_badge=True,
            reason="High competency gap detected",
            url="https://igotkarmayogi.gov.in/app/toc/course_python_stats"
        ),
        Course(
            title="Data Visualization for Official Statistics",
            competency="Data Visualization",
            difficulty="Intermediate",
            duration="5 hours",
            progress=10.0,
            provider="iGOT Karmayogi",
            igot_badge=True,
            reason="Largest competency gap (35%)",
            url="https://igotkarmayogi.gov.in/app/toc/course_datavis_gov"
        ),
        Course(
            title="Survey Methodology & Sampling Techniques",
            competency="Survey Methodology",
            difficulty="Advanced",
            duration="6 hours",
            progress=65.0,
            provider="MoSPI Internal Academy",
            igot_badge=False,
            reason="Role core requirement",
            url="#"
        ),
        Course(
            title="Statistical Data Management & Governance",
            competency="Data Management",
            difficulty="Intermediate",
            duration="3.5 hours",
            progress=0.0,
            provider="iGOT Karmayogi",
            igot_badge=True,
            reason="Governance & Security compliance",
            url="https://igotkarmayogi.gov.in/app/toc/course_datagov_mospi"
        )
    ]
    for c in courses:
        db.add(c)

    # 4. Learning Resources
    resources = [
        LearningResource(
            title="NSS 78th Round Survey Guidelines.pdf",
            file_type="PDF",
            file_size="4.2 MB",
            uploaded_by="Admin User",
            upload_date="2026-08-15",
            competency="Survey Methodology",
            difficulty="Intermediate",
            quiz_status="Generated",
            content_text="National Sample Survey guidelines detailing multi-stage stratified sampling methods..."
        ),
        LearningResource(
            title="Python Data Wrangling Manual for MoSPI.docx",
            file_type="DOCX",
            file_size="2.8 MB",
            uploaded_by="Admin User",
            upload_date="2026-08-20",
            competency="Python",
            difficulty="Intermediate",
            quiz_status="Generated",
            content_text="Data transformation using Pandas, NumPy, and aggregation functions for official statistical reports..."
        ),
        LearningResource(
            title="Data Visualization Standards for Government Reports.pptx",
            file_type="PPTX",
            file_size="6.5 MB",
            uploaded_by="Admin User",
            upload_date="2026-08-25",
            competency="Data Visualization",
            difficulty="Hard",
            quiz_status="Pending",
            content_text="Principles of visual design, color palettes, Seaborn dashboards, and official MoSPI layout standards..."
        )
    ]
    for r in resources:
        db.add(r)

    # 5. Default Quiz & Questions
    quiz = Quiz(
        title="Python for Statistical Analysis Assessment",
        competency="Python",
        difficulty="Medium",
        total_questions=10,
        is_published=True
    )
    db.add(quiz)
    db.commit()

    questions = [
        Question(
            quiz_id=quiz.id,
            question_text="Which sampling technique gives every member of a population an equal probability of selection?",
            option_a="Convenience Sampling",
            option_b="Simple Random Sampling",
            option_c="Quota Sampling",
            option_d="Judgment Sampling",
            correct_option="B",
            difficulty="Medium",
            topic="Sampling Methods",
            explanation="Simple Random Sampling guarantees equal selection probability for all units."
        ),
        Question(
            quiz_id=quiz.id,
            question_text="In Python pandas, which function is primarily used to aggregate data by categories before applying statistical summary metrics?",
            option_a="df.pivot_table()",
            option_b="df.groupby()",
            option_c="df.filter()",
            option_d="df.transform()",
            correct_option="B",
            difficulty="Easy",
            topic="Python Basics",
            explanation="df.groupby() performs split-apply-combine data aggregations."
        ),
        Question(
            quiz_id=quiz.id,
            question_text="What type of chart is most suitable for representing the distribution of a single continuous statistical variable?",
            option_a="Bar Chart",
            option_b="Pie Chart",
            option_c="Histogram",
            option_d="Scatter Plot",
            correct_option="C",
            difficulty="Easy",
            topic="Data Visualization",
            explanation="Histograms depict frequency distributions of continuous data variables."
        ),
        Question(
            quiz_id=quiz.id,
            question_text="When assessing multicollinearity in linear regression models for national account indicators, which metric is commonly evaluated?",
            option_a="Variance Inflation Factor (VIF)",
            option_b="Durbin-Watson Statistic",
            option_c="Akaike Information Criterion (AIC)",
            option_d="Root Mean Squared Error (RMSE)",
            correct_option="A",
            difficulty="Hard",
            topic="Statistical Programming",
            explanation="VIF measures the severity of multicollinearity in ordinary least squares regression analysis."
        ),
        Question(
            quiz_id=quiz.id,
            question_text="Which measure of central tendency is least sensitive to extreme values or outliers in economic survey datasets?",
            option_a="Arithmetic Mean",
            option_b="Median",
            option_c="Geometric Mean",
            option_d="Weighted Mean",
            correct_option="B",
            difficulty="Easy",
            topic="Data Handling",
            explanation="Median is non-parametric and resistant to skewness caused by extreme outliers."
        ),
        Question(
            quiz_id=quiz.id,
            question_text="In survey methodology for India's National Sample Survey (NSS), what is the main purpose of Stratification?",
            option_a="To reduce overall sample size without affecting costs",
            option_b="To ensure representation across heterogeneous sub-populations and improve precision",
            option_c="To replace probability sampling with judgment selection",
            option_d="To eliminate non-response bias completely",
            correct_option="B",
            difficulty="Medium",
            topic="Data Handling",
            explanation="Stratification increases precision across distinct sub-populations."
        ),
        Question(
            quiz_id=quiz.id,
            question_text="In Matplotlib/Seaborn, which parameter is used to map a categorical variable to distinct colors in a scatter plot?",
            option_a="color_by",
            option_b="hue",
            option_c="legend",
            option_d="palette_map",
            correct_option="B",
            difficulty="Medium",
            topic="Data Visualization",
            explanation="The hue parameter assigns distinct color palettes to categories."
        ),
        Question(
            quiz_id=quiz.id,
            question_text="Under the Consumer Price Index (CPI) estimation methodology, which formula is traditionally used for index weighting?",
            option_a="Laspeyres Index Formula",
            option_b="Paasche Index Formula",
            option_c="Fisher Ideal Index Formula",
            option_d="Marshall-Edgeworth Index",
            correct_option="A",
            difficulty="Hard",
            topic="Statistical Programming",
            explanation="Laspeyres Index uses base-year basket weighting."
        ),
        Question(
            quiz_id=quiz.id,
            question_text="Which Python library is specifically optimized for high-performance multidimensional array computations in statistical modeling?",
            option_a="Requests",
            option_b="NumPy",
            option_c="BeautifulSoup",
            option_d="Flask",
            correct_option="B",
            difficulty="Easy",
            topic="Python Basics",
            explanation="NumPy provides fast C-based vectorised array computations."
        ),
        Question(
            quiz_id=quiz.id,
            question_text="What does a P-value less than 0.05 signify in a standard hypothesis test for statistical significance?",
            option_a="The null hypothesis is 100% true",
            option_b="Strong evidence against the null hypothesis, rejecting it at the 5% level",
            option_c="The alternative hypothesis is false",
            option_d="The sample size was inadequate",
            correct_option="B",
            difficulty="Medium",
            topic="Data Handling",
            explanation="P-value < 0.05 indicates sample evidence is strong enough to reject H0."
        )
    ]
    for q in questions:
        db.add(q)

    db.commit()
    db.close()
    print("Database successfully seeded!")

if __name__ == "__main__":
    seed_database()
