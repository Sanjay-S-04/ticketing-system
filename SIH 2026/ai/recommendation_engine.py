class AIRecommendationEngine:
    """AI Recommendation algorithm mapping employee profile to learning paths and iGOT resources."""

    ROLE_COMPETENCY_REQUIREMENTS = {
        "Statistical Officer": {
            "Statistics": 90,
            "Data Analysis": 85,
            "Python": 85,
            "Data Visualization": 80,
            "Survey Methodology": 85,
            "Data Management": 80
        },
        "Senior Statistical Inspector": {
            "Statistics": 85,
            "Data Analysis": 80,
            "Python": 75,
            "Data Visualization": 75,
            "Survey Methodology": 90,
            "Data Management": 85
        },
        "Director - National Accounts": {
            "Statistics": 95,
            "Data Analysis": 90,
            "Python": 80,
            "Data Visualization": 85,
            "Survey Methodology": 80,
            "Data Management": 90
        }
    }

    @classmethod
    def calculate_gaps(cls, role: str, current_competencies: dict) -> list[dict]:
        reqs = cls.ROLE_COMPETENCY_REQUIREMENTS.get(role, cls.ROLE_COMPETENCY_REQUIREMENTS["Statistical Officer"])
        gaps = []
        
        for comp_name, req_level in reqs.items():
            curr_level = current_competencies.get(comp_name, 50)
            gap = max(0, req_level - curr_level)
            
            if gap >= 25:
                priority = "High"
                status = "High Priority"
            elif gap > 0:
                priority = "Medium"
                status = "Needs Improvement"
            else:
                priority = "Low"
                status = "Achieved"
                
            gaps.append({
                "competency": comp_name,
                "current": curr_level,
                "required": req_level,
                "gap": gap,
                "priority": priority,
                "status": status
            })
            
        gaps.sort(key=lambda x: x["gap"], reverse=True)
        return gaps

    @classmethod
    def generate_recommendations(cls, role: str, gaps: list[dict], completed_courses: list[str]) -> list[dict]:
        recommendations = [
            {
                "id": 1,
                "title": "Python for Statistical Analysis",
                "competency": "Python",
                "gap_matched": "35% Gap in Python",
                "difficulty": "Intermediate",
                "duration": "4 hours",
                "progress": 35,
                "provider": "iGOT Karmayogi",
                "igot_badge": True,
                "reason": "High competency gap detected (25% below required role level). Essential for statistical automation.",
                "url": "https://igotkarmayogi.gov.in/app/toc/course_python_stats"
            },
            {
                "id": 2,
                "title": "Data Visualization for Official Statistics",
                "competency": "Data Visualization",
                "gap_matched": "35% Gap in Data Vis",
                "difficulty": "Intermediate",
                "duration": "5 hours",
                "progress": 10,
                "provider": "iGOT Karmayogi",
                "igot_badge": True,
                "reason": "Largest competency gap (35%). Critical for presenting national economic indicators.",
                "url": "https://igotkarmayogi.gov.in/app/toc/course_datavis_gov"
            },
            {
                "id": 3,
                "title": "Survey Methodology & Sampling Techniques",
                "competency": "Survey Methodology",
                "gap_matched": "7% Gap in Methodology",
                "difficulty": "Advanced",
                "duration": "6 hours",
                "progress": 65,
                "provider": "MoSPI Internal Academy",
                "igot_badge": False,
                "reason": "Core requirement for Statistical Officer role. Align with NSS survey standards.",
                "url": "#"
            },
            {
                "id": 4,
                "title": "Statistical Data Management & Governance",
                "competency": "Data Management",
                "gap_matched": "10% Gap in Management",
                "difficulty": "Intermediate",
                "duration": "3.5 hours",
                "progress": 0,
                "provider": "iGOT Karmayogi",
                "igot_badge": True,
                "reason": "Recommended to ensure data integrity and security compliance in official statistics.",
                "url": "https://igotkarmayogi.gov.in/app/toc/course_datagov_mospi"
            }
        ]
        
        return recommendations
