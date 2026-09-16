from typing import Any


def clamp_score(value: float) -> float:
    return round(
        max(0, min(100, value)),
        2,
    )


def get_status(score: float) -> str:

    if score >= 90:
        return "Highly Competitive"

    if score >= 75:
        return "Career Ready"

    if score >= 60:
        return "Almost Ready"

    if score >= 40:
        return "Developing"

    return "Needs Improvement"


def calculate_experience_score(
    years_of_experience: float | None,
) -> float:

    if years_of_experience is None:
        return 20

    if years_of_experience >= 5:
        return 100

    if years_of_experience >= 3:
        return 90

    if years_of_experience >= 2:
        return 80

    if years_of_experience >= 1:
        return 70

    if years_of_experience > 0:
        return 60

    return 40


def calculate_education_score(
    education: str | None,
) -> float:

    if not education:
        return 40

    education_lower = education.lower()

    if "phd" in education_lower:
        return 100

    if "master" in education_lower or "m.tech" in education_lower:
        return 95

    if "b.tech" in education_lower:
        return 90

    if "b.e" in education_lower:
        return 90

    if "bachelor" in education_lower:
        return 85

    if "degree" in education_lower:
        return 75

    return 65


def calculate_resume_score(
    resume: Any | None,
) -> float:

    if not resume:
        return 0

    ats_score = float(
        getattr(
            resume,
            "ats_score",
            0,
        ) or 0
    )

    if ats_score > 0:
        return clamp_score(ats_score)

    experience_score = float(
        getattr(
            resume,
            "experience_score",
            0,
        ) or 0
    )

    education_score = float(
        getattr(
            resume,
            "education_score",
            0,
        ) or 0
    )

    skills_score = float(
        getattr(
            resume,
            "skills_score",
            0,
        ) or 0
    )

    return clamp_score(
        (
            experience_score
            + education_score
            + skills_score
        )
        / 3
    )


def calculate_skills_score(
    profile: Any,
    resume: Any | None,
) -> float:

    profile_skills = getattr(
        profile,
        "technical_skills",
        "",
    ) or ""

    detected_skills = getattr(
        resume,
        "detected_skills",
        None,
    ) if resume else None

    detected_count = (
        len(detected_skills)
        if isinstance(
            detected_skills,
            list,
        )
        else 0
    )

    profile_skill_count = len(
        [
            skill
            for skill in profile_skills.split(",")
            if skill.strip()
        ]
    )

    total_skills = max(
        detected_count,
        profile_skill_count,
    )

    if total_skills >= 15:
        return 100

    if total_skills >= 10:
        return 90

    if total_skills >= 7:
        return 80

    if total_skills >= 5:
        return 70

    if total_skills >= 3:
        return 60

    if total_skills >= 1:
        return 45

    return 20


def calculate_skill_gap_score(
    skill_gap: Any | None,
) -> float:

    if not skill_gap:
        return 50

    readiness = float(
        getattr(
            skill_gap,
            "readiness_score",
            0,
        ) or 0
    )

    return clamp_score(readiness)


def calculate_learning_score(
    roadmap: Any | None,
) -> float:

    if not roadmap:
        return 0

    progress = float(
        getattr(
            roadmap,
            "overall_progress",
            0,
        ) or 0
    )

    return clamp_score(progress)


def generate_recommendations(
    resume_score: float,
    skills_score: float,
    experience_score: float,
    education_score: float,
    skill_gap_score: float,
    learning_progress_score: float,
) -> list[str]:

    recommendations: list[str] = []

    if resume_score < 70:
        recommendations.append(
            "Improve your resume structure, ATS compatibility, "
            "keywords and measurable achievements."
        )

    if skills_score < 70:
        recommendations.append(
            "Strengthen your technical skill set and add "
            "practical projects demonstrating those skills."
        )

    if experience_score < 70:
        recommendations.append(
            "Build more practical experience through projects, "
            "internships, freelance work or relevant job roles."
        )

    if education_score < 70:
        recommendations.append(
            "Make your education and relevant certifications "
            "clear and visible on your profile."
        )

    if skill_gap_score < 70:
        recommendations.append(
            "Focus on the highest-priority missing skills "
            "identified by Skill Gap Intelligence."
        )

    if learning_progress_score < 50:
        recommendations.append(
            "Continue your Personalized Learning Roadmap "
            "and complete the next learning phase."
        )

    if not recommendations:
        recommendations.append(
            "Your career profile is strong. Continue improving "
            "your skills, projects, resume and interview preparation."
        )

    return recommendations


def calculate_career_score(
    profile: Any,
    resume: Any | None,
    skill_gap: Any | None,
    roadmap: Any | None,
) -> dict[str, Any]:

    resume_score = calculate_resume_score(
        resume
    )

    skills_score = calculate_skills_score(
        profile,
        resume,
    )

    experience_score = calculate_experience_score(
        getattr(
            profile,
            "years_of_experience",
            None,
        )
    )

    education_score = calculate_education_score(
        getattr(
            profile,
            "education",
            None,
        )
    )

    skill_gap_score = calculate_skill_gap_score(
        skill_gap
    )

    learning_progress_score = calculate_learning_score(
        roadmap
    )

    # ---------------------------------------------------------
    # OVERALL SCORE
    # ---------------------------------------------------------
    #
    # Resume             20%
    # Skills             25%
    # Experience         15%
    # Education          10%
    # Skill Gap           20%
    # Learning Progress  10%
    #
    # ---------------------------------------------------------

    overall_score = (
        resume_score * 0.20
        + skills_score * 0.25
        + experience_score * 0.15
        + education_score * 0.10
        + skill_gap_score * 0.20
        + learning_progress_score * 0.10
    )

    overall_score = clamp_score(
        overall_score
    )

    status = get_status(
        overall_score
    )

    recommendations = generate_recommendations(
        resume_score=resume_score,
        skills_score=skills_score,
        experience_score=experience_score,
        education_score=education_score,
        skill_gap_score=skill_gap_score,
        learning_progress_score=learning_progress_score,
    )

    return {
        "overall_score": overall_score,
        "resume_score": resume_score,
        "skills_score": skills_score,
        "experience_score": experience_score,
        "education_score": education_score,
        "skill_gap_score": skill_gap_score,
        "learning_progress_score": learning_progress_score,
        "status": status,
        "recommendations": recommendations,
    }