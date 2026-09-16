import json
from typing import Any, Optional


def parse_json(value: Optional[str], default: Any = None) -> Any:
    if not value:
        return default if default is not None else {}

    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return default if default is not None else {}


def safe_text(value: Any, default: str = "Not available") -> str:
    if value is None:
        return default

    if isinstance(value, str):
        return value.strip() or default

    return str(value)


def calculate_overall_score(
    career_score=None,
    readiness_score: float = 0,
    learning_progress: float = 0,
) -> float:

    if career_score is not None:
        return round(
            max(
                0,
                min(
                    100,
                    float(career_score.overall_score),
                ),
            ),
            2,
        )

    score = (
        float(readiness_score) * 0.7
        + float(learning_progress) * 0.3
    )

    return round(max(0, min(100, score)), 2)


def get_strengths(
    career_score=None,
    resume=None,
    career_profile=None,
) -> list[str]:

    strengths: list[str] = []

    if career_score is not None:
        if career_score.skills_score >= 70:
            strengths.append("Strong technical skill foundation.")

        if career_score.resume_score >= 70:
            strengths.append("Good resume readiness.")

        if career_score.education_score >= 70:
            strengths.append("Education background supports the target career.")

        if career_score.experience_score >= 70:
            strengths.append("Relevant experience provides a good career foundation.")

    if career_profile is not None:
        if career_profile.target_role:
            strengths.append(
                f"Clear target role: {career_profile.target_role}."
            )

        if career_profile.technical_skills:
            strengths.append("Technical skills have been identified.")

    if resume is not None and resume.ats_score is not None:
        if resume.ats_score >= 70:
            strengths.append("Resume has a strong ATS compatibility score.")

    if not strengths:
        strengths.append(
            "Your career profile provides a foundation for further improvement."
        )

    return strengths[:6]


def get_improvements(
    career_score=None,
    skill_gap=None,
    roadmap=None,
) -> list[str]:

    improvements: list[str] = []

    if career_score is not None:

        if career_score.skills_score < 70:
            improvements.append(
                "Improve technical skills relevant to the target role."
            )

        if career_score.resume_score < 70:
            improvements.append(
                "Improve resume structure, keywords and ATS compatibility."
            )

        if career_score.experience_score < 70:
            improvements.append(
                "Build more practical experience through projects or internships."
            )

        if career_score.education_score < 70:
            improvements.append(
                "Strengthen role-relevant educational or certification credentials."
            )

    if skill_gap is not None:
        missing = parse_json(skill_gap.missing_skills, [])

        if missing:
            improvements.append(
                "Focus on the missing skills identified by the Skill Gap analysis."
            )

    if roadmap is not None:
        if roadmap.overall_progress < 50:
            improvements.append(
                "Increase learning roadmap completion and maintain consistent progress."
            )

    if not improvements:
        improvements.append(
            "Continue improving your skills and practical career experience."
        )

    return improvements[:6]


def get_short_term_goals(
    target_role: str,
    skill_gap=None,
    roadmap=None,
) -> list[str]:

    goals = [
        f"Strengthen the core skills required for {target_role}.",
        "Improve your resume for the target role.",
        "Complete practical projects demonstrating your skills.",
        "Practice interview questions related to the target role.",
    ]

    if skill_gap is not None:
        high_priority = parse_json(
            skill_gap.high_priority_skills,
            [],
        )

        for skill in high_priority[:2]:
            goals.insert(
                0,
                f"Learn and practice {skill}.",
            )

    if roadmap is not None:
        goals.append(
            "Continue following your personalized learning roadmap."
        )

    return goals[:6]


def get_long_term_goals(target_role: str) -> list[str]:

    return [
        f"Become job-ready for a {target_role} position.",
        f"Build a strong portfolio aligned with {target_role}.",
        "Gain real-world project or professional experience.",
        "Continuously improve technical and professional skills.",
        "Progress toward higher-responsibility roles in your career path.",
    ]


def generate_executive_summary(
    target_role: str,
    overall_score: float,
    readiness_score: float,
) -> str:

    if overall_score >= 80:
        status = "strongly positioned"
    elif overall_score >= 65:
        status = "reasonably positioned"
    elif overall_score >= 50:
        status = "developing toward being positioned"
    else:
        status = "still developing toward being positioned"

    return (
        f"Your current career assessment indicates that you are "
        f"{status} for a {target_role} role. "
        f"Your overall CareerAI score is {overall_score:.0f}/100, "
        f"with a current readiness level of {readiness_score:.0f}%. "
        f"Focus on the identified skill gaps, practical experience, "
        f"resume improvement and learning roadmap to increase your "
        f"job readiness."
    )


def generate_job_readiness(
    overall_score: float,
    readiness_score: float,
) -> str:

    average = (overall_score + readiness_score) / 2

    if average >= 80:
        return (
            "Highly job-ready. You can actively target relevant positions "
            "while continuing to strengthen your weaker areas."
        )

    if average >= 65:
        return (
            "Almost job-ready. Start applying to suitable positions while "
            "continuing to close your remaining skill gaps."
        )

    if average >= 50:
        return (
            "Developing. Build stronger practical skills, projects and "
            "resume alignment before targeting a large number of applications."
        )

    return (
        "Early development stage. Focus on your core skills, learning roadmap "
        "and practical projects before aggressively applying."
    )


def build_report_data(
    profile=None,
    resume=None,
    skill_gap=None,
    career_path=None,
    roadmap=None,
    career_score=None,
) -> dict[str, Any]:

    target_role = (
        profile.target_role
        if profile is not None and profile.target_role
        else "Target Role"
    )

    readiness_score = (
        skill_gap.readiness_score
        if skill_gap is not None
        else 0
    )

    learning_progress = (
        roadmap.overall_progress
        if roadmap is not None
        else 0
    )

    overall_score = calculate_overall_score(
        career_score,
        readiness_score,
        learning_progress,
    )

    strengths = get_strengths(
        career_score,
        resume,
        profile,
    )

    improvements = get_improvements(
        career_score,
        skill_gap,
        roadmap,
    )

    short_term = get_short_term_goals(
        target_role,
        skill_gap,
        roadmap,
    )

    long_term = get_long_term_goals(target_role)

    report = {
        "target_role": target_role,
        "overall_score": overall_score,
        "readiness_score": readiness_score,
        "learning_progress": learning_progress,

        "career_profile": {
            "current_role": (
                profile.current_role
                if profile is not None
                else None
            ),
            "target_role": target_role,
            "years_of_experience": (
                profile.years_of_experience
                if profile is not None
                else None
            ),
            "education": (
                profile.education
                if profile is not None
                else None
            ),
            "location": (
                profile.location
                if profile is not None
                else None
            ),
        },

        "resume": {
            "file_name": (
                resume.file_name
                if resume is not None
                else None
            ),
            "ats_score": (
                resume.ats_score
                if resume is not None
                else None
            ),
            "skills_score": (
                resume.skills_score
                if resume is not None
                else None
            ),
            "experience_score": (
                resume.experience_score
                if resume is not None
                else None
            ),
            "education_score": (
                resume.education_score
                if resume is not None
                else None
            ),
        },

        "skill_gap": {
            "missing_skills": (
                parse_json(skill_gap.missing_skills, [])
                if skill_gap is not None
                else []
            ),
            "high_priority_skills": (
                parse_json(skill_gap.high_priority_skills, [])
                if skill_gap is not None
                else []
            ),
            "medium_priority_skills": (
                parse_json(skill_gap.medium_priority_skills, [])
                if skill_gap is not None
                else []
            ),
            "low_priority_skills": (
                parse_json(skill_gap.low_priority_skills, [])
                if skill_gap is not None
                else []
            ),
        },

        "career_path": (
            parse_json(
                career_path.recommended_path,
                [],
            )
            if career_path is not None
            else []
        ),

        "learning_roadmap": (
            parse_json(
                roadmap.roadmap,
                [],
            )
            if roadmap is not None
            else []
        ),

        "strengths": strengths,
        "areas_to_improve": improvements,
        "short_term_goals": short_term,
        "long_term_goals": long_term,

        "recommendations": [
            "Follow your personalized learning roadmap consistently.",
            "Close high-priority skill gaps first.",
            "Keep your resume aligned with your target role.",
            "Build practical projects that demonstrate required skills.",
            "Track your Career Score regularly.",
        ],
    }

    return report


def generate_report_sections(
    profile=None,
    resume=None,
    skill_gap=None,
    career_path=None,
    roadmap=None,
    career_score=None,
) -> dict[str, Any]:

    data = build_report_data(
        profile=profile,
        resume=resume,
        skill_gap=skill_gap,
        career_path=career_path,
        roadmap=roadmap,
        career_score=career_score,
    )

    target_role = data["target_role"]
    overall_score = data["overall_score"]
    readiness_score = data["readiness_score"]

    return {
        "executive_summary": generate_executive_summary(
            target_role,
            overall_score,
            readiness_score,
        ),

        "career_profile": json.dumps(
            data["career_profile"]
        ),

        "resume_analysis": json.dumps(
            data["resume"]
        ),

        "skills_analysis": json.dumps({
            "technical_skills": (
                profile.technical_skills
                if profile is not None
                else None
            ),
        }),

        "skill_gap_analysis": json.dumps(
            data["skill_gap"]
        ),

        "career_path": json.dumps(
            data["career_path"]
        ),

        "learning_roadmap": json.dumps(
            data["learning_roadmap"]
        ),

        "job_readiness": generate_job_readiness(
            overall_score,
            readiness_score,
        ),

        "strengths": json.dumps(
            data["strengths"]
        ),

        "areas_to_improve": json.dumps(
            data["areas_to_improve"]
        ),

        "short_term_goals": json.dumps(
            data["short_term_goals"]
        ),

        "long_term_goals": json.dumps(
            data["long_term_goals"]
        ),

        "recommendations": json.dumps(
            data["recommendations"]
        ),

        "report_data": json.dumps(
            data
        ),

        "overall_score": overall_score,
        "target_role": target_role,
    }