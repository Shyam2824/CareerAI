import json
import re
from typing import Any


# ============================================================
# HELPERS
# ============================================================

def normalize_text(value: str | None) -> str:
    if not value:
        return ""

    return re.sub(
        r"\s+",
        " ",
        value.lower().strip(),
    )


def parse_json_list(value: str | None) -> list[str]:
    if not value:
        return []

    try:
        data = json.loads(value)

        if isinstance(data, list):
            return [
                str(item)
                for item in data
            ]

    except (json.JSONDecodeError, TypeError):
        pass

    return []


# ============================================================
# CAREER CONTEXT
# ============================================================

def build_career_context(
    profile: Any,
    skill_gap: Any | None = None,
    career_path: Any | None = None,
    roadmap: Any | None = None,
) -> dict[str, Any]:

    context: dict[str, Any] = {
        "current_role": getattr(
            profile,
            "current_role",
            None,
        ),

        "target_role": getattr(
            profile,
            "target_role",
            None,
        ),

        "experience": getattr(
            profile,
            "years_of_experience",
            None,
        ),

        "education": getattr(
            profile,
            "education",
            None,
        ),

        "technical_skills": getattr(
            profile,
            "technical_skills",
            None,
        ),

        "soft_skills": getattr(
            profile,
            "soft_skills",
            None,
        ),

        "career_goal": getattr(
            profile,
            "career_goal",
            None,
        ),

        "preferred_location": getattr(
            profile,
            "preferred_location",
            None,
        ),

        "work_mode": getattr(
            profile,
            "preferred_work_mode",
            None,
        ),
    }

    if skill_gap:
        context["skill_gap"] = {
            "target_role": getattr(
                skill_gap,
                "target_role",
                None,
            ),
            "missing_skills": parse_json_list(
                getattr(
                    skill_gap,
                    "missing_skills",
                    None,
                )
            ),
            "high_priority_skills": parse_json_list(
                getattr(
                    skill_gap,
                    "high_priority_skills",
                    None,
                )
            ),
            "medium_priority_skills": parse_json_list(
                getattr(
                    skill_gap,
                    "medium_priority_skills",
                    None,
                )
            ),
            "readiness_score": getattr(
                skill_gap,
                "readiness_score",
                0,
            ),
        }

    if career_path:
        context["career_path"] = {
            "target_role": getattr(
                career_path,
                "target_role",
                None,
            ),
            "readiness_score": getattr(
                career_path,
                "readiness_score",
                0,
            ),
            "estimated_months": getattr(
                career_path,
                "estimated_months",
                0,
            ),
            "milestones": parse_json_list(
                getattr(
                    career_path,
                    "milestones",
                    None,
                )
            ),
        }

    if roadmap:
        context["learning_roadmap"] = {
            "target_role": getattr(
                roadmap,
                "target_role",
                None,
            ),
            "current_phase": getattr(
                roadmap,
                "current_phase",
                1,
            ),
            "overall_progress": getattr(
                roadmap,
                "overall_progress",
                0,
            ),
            "estimated_months": getattr(
                roadmap,
                "estimated_months",
                0,
            ),
            "completed_topics": parse_json_list(
                getattr(
                    roadmap,
                    "completed_topics",
                    None,
                )
            ),
        }

    return context


# ============================================================
# ANSWER GENERATION
# ============================================================

def generate_career_response(
    question: str,
    context: dict[str, Any],
) -> str:

    question_lower = normalize_text(question)

    target_role = (
        context.get("target_role")
        or "your target role"
    )

    current_role = (
        context.get("current_role")
        or "your current role"
    )

    skills = (
        context.get("technical_skills")
        or "No technical skills added yet."
    )

    experience = context.get("experience")

    # --------------------------------------------------------
    # SKILL GAP QUESTIONS
    # --------------------------------------------------------

    if any(
        keyword in question_lower
        for keyword in [
            "skill gap",
            "missing skill",
            "skills should i learn",
            "what should i learn",
            "learn next",
        ]
    ):

        gap = context.get(
            "skill_gap",
            {},
        )

        missing = gap.get(
            "missing_skills",
            [],
        )

        high_priority = gap.get(
            "high_priority_skills",
            [],
        )

        readiness = gap.get(
            "readiness_score",
            0,
        )

        if high_priority:
            priority_text = ", ".join(
                high_priority[:5]
            )
        elif missing:
            priority_text = ", ".join(
                missing[:5]
            )
        else:
            priority_text = (
                "No major skill gaps have been detected yet."
            )

        return (
            f"Based on your Career Profile, your target role is "
            f"{target_role}. Your current readiness score is "
            f"{readiness:.0f}%.\n\n"
            f"The most important skills to focus on next are: "
            f"{priority_text}.\n\n"
            f"I recommend learning the highest-priority skills "
            f"first and then building a practical project using "
            f"those skills."
        )

    # --------------------------------------------------------
    # RESUME QUESTIONS
    # --------------------------------------------------------

    if any(
        keyword in question_lower
        for keyword in [
            "resume",
            "cv",
            "ats",
        ]
    ):

        return (
            f"Your resume should be aligned with your target "
            f"role of {target_role}.\n\n"
            f"Your current technical skills include: {skills}.\n\n"
            f"Focus your resume on measurable achievements, "
            f"role-specific keywords, relevant projects, and "
            f"skills that appear in your target job descriptions.\n\n"
            f"If your ATS score is low, use Resume Improvement "
            f"to identify specific sections that need improvement."
        )

    # --------------------------------------------------------
    # EXPERIENCE QUESTIONS
    # --------------------------------------------------------

    if any(
        keyword in question_lower
        for keyword in [
            "experience",
            "eligible",
            "ready",
            "job ready",
            "job-ready",
        ]
    ):

        experience_text = (
            f"{experience} years"
            if experience is not None
            else "your current experience level"
        )

        readiness = context.get(
            "skill_gap",
            {},
        ).get(
            "readiness_score",
            0,
        )

        return (
            f"You currently have {experience_text} of experience "
            f"and are targeting {target_role}.\n\n"
            f"Your current skill-gap readiness is "
            f"{readiness:.0f}%.\n\n"
            f"I recommend applying for roles whose experience "
            f"requirements match your current level while "
            f"continuing to close the remaining skill gaps."
        )

    # --------------------------------------------------------
    # CAREER PATH QUESTIONS
    # --------------------------------------------------------

    if any(
        keyword in question_lower
        for keyword in [
            "career path",
            "career growth",
            "career move",
            "switch career",
            "transition",
            "roadmap",
        ]
    ):

        path = context.get(
            "career_path",
            {},
        )

        months = path.get(
            "estimated_months",
            0,
        )

        milestones = path.get(
            "milestones",
            [],
        )

        milestone_text = (
            ", ".join(milestones[:4])
            if milestones
            else "Build skills, complete projects, and gain practical experience."
        )

        return (
            f"Your current role is {current_role} and your "
            f"target role is {target_role}.\n\n"
            f"Your Career Path analysis estimates approximately "
            f"{months} months for the recommended transition.\n\n"
            f"Key milestones include: {milestone_text}.\n\n"
            f"Follow your Personalized Learning Roadmap and "
            f"review your skill gaps regularly."
        )

    # --------------------------------------------------------
    # LEARNING QUESTIONS
    # --------------------------------------------------------

    if any(
        keyword in question_lower
        for keyword in [
            "course",
            "study",
            "learning",
            "roadmap",
            "practice",
            "project",
        ]
    ):

        roadmap = context.get(
            "learning_roadmap",
            {},
        )

        phase = roadmap.get(
            "current_phase",
            1,
        )

        progress = roadmap.get(
            "overall_progress",
            0,
        )

        completed = roadmap.get(
            "completed_topics",
            [],
        )

        completed_text = (
            ", ".join(completed[:5])
            if completed
            else "No topics completed yet."
        )

        return (
            f"Your Personalized Learning Roadmap is currently "
            f"at Phase {phase}, with {progress:.0f}% overall progress.\n\n"
            f"Completed topics: {completed_text}\n\n"
            f"For {target_role}, focus on one skill at a time, "
            f"then reinforce it with a practical project. "
            f"Track your progress in the Learning Roadmap."
        )

    # --------------------------------------------------------
    # JOB QUESTIONS
    # --------------------------------------------------------

    if any(
        keyword in question_lower
        for keyword in [
            "job",
            "apply",
            "application",
            "applying",
            "role",
        ]
    ):

        return (
            f"Based on your Career Profile, your selected target "
            f"role is {target_role}.\n\n"
            f"I recommend selecting the specific job type you "
            f"want to pursue and then using Job Match to compare "
            f"your resume against individual job descriptions.\n\n"
            f"CareerAI can then show your matching skills, missing "
            f"skills, and areas you should improve before applying."
        )

    # --------------------------------------------------------
    # GENERAL CAREER QUESTION
    # --------------------------------------------------------

    return (
        f"Based on your Career Profile, you are currently "
        f"{current_role} and targeting {target_role}.\n\n"
        f"Your technical skills include: {skills}.\n\n"
        f"I recommend focusing on three areas:\n\n"
        f"1. Strengthen the skills required for {target_role}.\n"
        f"2. Build practical projects that demonstrate those skills.\n"
        f"3. Improve your resume and interview performance while "
        f"applying to relevant positions.\n\n"
        f"You can also use Skill Gap, Career Path, and Learning "
        f"Roadmap to create a more specific plan."
    )