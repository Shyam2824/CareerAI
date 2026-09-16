import re
from typing import Any


ACTION_VERBS = [
    "developed",
    "designed",
    "implemented",
    "built",
    "created",
    "optimized",
    "automated",
    "improved",
    "managed",
    "led",
    "integrated",
    "deployed",
    "engineered",
    "configured",
    "analyzed",
    "reduced",
    "increased",
    "delivered",
    "tested",
    "maintained",
    "configured",
    "migrated",
    "refactored",
]

WEAK_REPLACEMENTS = {
    "worked on": "Developed",
    "helped": "Supported",
    "responsible for": "Managed",
    "did": "Executed",
    "made": "Created",
    "used": "Utilized",
    "handled": "Managed",
    "involved in": "Contributed to",
}

METRIC_PATTERNS = [
    r"\b\d+%",
    r"\b\d+\+",
    r"\b\d+\s*(users|clients|customers|projects|employees|records|requests)",
    r"\$\s*\d+",
    r"\b\d+\s*(ms|seconds|minutes|hours|days)",
]


def _clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def _find_bullets(text: str) -> list[str]:
    lines = text.splitlines()
    bullets: list[str] = []

    for line in lines:
        line = line.strip()

        if not line:
            continue

        if line.startswith(("-", "•", "*")):
            cleaned = line.lstrip("-•* ").strip()

            if len(cleaned.split()) >= 4:
                bullets.append(cleaned)

        elif len(line.split()) >= 8:
            bullets.append(line)

    return bullets[:30]


def _has_metric(text: str) -> bool:
    return any(
        re.search(pattern, text, re.IGNORECASE)
        for pattern in METRIC_PATTERNS
    )


def _contains_action_verb(text: str) -> bool:
    text_lower = text.lower()

    return any(
        re.search(
            rf"\b{re.escape(verb)}\b",
            text_lower,
        )
        for verb in ACTION_VERBS
    )


def _weak_phrases(text: str) -> list[str]:
    text_lower = text.lower()

    return [
        phrase
        for phrase in WEAK_REPLACEMENTS
        if phrase in text_lower
    ]


def _replace_weak_phrase(
    text: str,
    phrase: str,
    replacement: str,
) -> str:
    pattern = re.compile(
        re.escape(phrase),
        re.IGNORECASE,
    )

    return pattern.sub(
        replacement,
        text,
        count=1,
    )


def _capitalize_first(text: str) -> str:
    if not text:
        return text

    return text[0].upper() + text[1:]


def _remove_redundant_words(text: str) -> str:
    replacements = {
        "in order to": "to",
        "a lot of": "multiple",
        "very": "",
        "really": "",
    }

    result = text

    for old, new in replacements.items():
        result = re.sub(
            rf"\b{re.escape(old)}\b",
            new,
            result,
            flags=re.IGNORECASE,
        )

    return _clean_text(result)


def _rewrite_bullet(
    original: str,
) -> tuple[str, str, str, str]:
    """
    Returns:

    improved_text
    issue
    impact
    ats_impact
    """

    original = _clean_text(original)

    if not original:
        return (
            original,
            "No content available.",
            "low",
            "No ATS impact.",
        )

    improved = original
    weak = _weak_phrases(original)

    # -------------------------------------------------
    # CASE 1: Weak wording
    # -------------------------------------------------

    if weak:
        phrase = weak[0]
        replacement = WEAK_REPLACEMENTS[phrase]

        improved = _replace_weak_phrase(
            improved,
            phrase,
            replacement,
        )

        improved = _capitalize_first(improved)

        improved = _remove_redundant_words(improved)

        return (
            improved,
            f"Replace weak wording '{phrase}' with a stronger action verb.",
            "high",
            "Improves action-verb strength and ATS readability.",
        )

    # -------------------------------------------------
    # CASE 2: Missing action verb
    # -------------------------------------------------

    if not _contains_action_verb(original):

        words = original.split()

        if words:
            first_word = words[0]

            if first_word.lower() in {
                "a",
                "an",
                "the",
                "worked",
                "experience",
                "responsible",
            }:
                improved = "Developed " + original.lower()

            else:
                improved = "Implemented " + original

        return (
            _capitalize_first(improved),
            "The bullet does not begin with a strong action-oriented statement.",
            "high",
            "Improves keyword scanning and action-oriented resume writing.",
        )

    # -------------------------------------------------
    # CASE 3: Action verb exists but metric missing
    # -------------------------------------------------

    if not _has_metric(original):
        return (
            original,
            "Add a measurable result if one is available.",
            "medium",
            "Adding measurable impact can strengthen ATS and recruiter evaluation.",
        )

    # -------------------------------------------------
    # CASE 4: Already strong
    # -------------------------------------------------

    return (
        original,
        "Bullet already contains an action verb and measurable information.",
        "low",
        "No major ATS improvement required.",
    )


def analyze_resume_improvement(
    resume_text: str,
    ats_score: float = 0,
    skills_score: float = 0,
    experience_score: float = 0,
    education_score: float = 0,
    detected_skills: list[str] | None = None,
) -> dict[str, Any]:

    resume_text = _clean_text(resume_text)

    detected_skills = detected_skills or []

    bullets = _find_bullets(resume_text)

    improvements: list[dict[str, Any]] = []

    for bullet in bullets:

        (
            improved,
            issue,
            impact,
            ats_impact,
        ) = _rewrite_bullet(bullet)

        # Only create an improvement record
        # when there is something useful to show.

        if improved != bullet or "Add a measurable" in issue:

            improvements.append(
                {
                    "section": "Experience",
                    "original": bullet,
                    "improved": improved,
                    "issue": issue,
                    "impact": impact,
                    "ats_impact": ats_impact,
                    "status": "pending",
                }
            )

    # -------------------------------------------------
    # Keyword suggestions
    # -------------------------------------------------

    keyword_suggestions = detected_skills[:20]

    # -------------------------------------------------
    # Formatting recommendations
    # -------------------------------------------------

    formatting_recommendations = [
        "Use standard section headings such as Summary, Experience, Education, Skills, and Projects.",
        "Avoid tables, graphics, text boxes, icons, and complex multi-column layouts.",
        "Keep date formatting consistent throughout the resume.",
        "Use consistent bullet formatting.",
        "Keep the resume concise and focused on relevant experience.",
    ]

    # -------------------------------------------------
    # ATS recommendations
    # -------------------------------------------------

    ats_recommendations: list[str] = []

    if ats_score < 70:
        ats_recommendations.append(
            "Improve ATS compatibility by using standard section headings and simple formatting."
        )

    if skills_score < 70:
        ats_recommendations.append(
            "Add relevant technical skills that genuinely match your experience."
        )

    if experience_score < 70:
        ats_recommendations.append(
            "Rewrite experience bullets around actions, outcomes, and measurable results."
        )

    if education_score < 70:
        ats_recommendations.append(
            "Ensure education details are complete and consistently formatted."
        )

    if not ats_recommendations:
        ats_recommendations.append(
            "ATS-related scores are currently strong. Focus on job-specific keywords and measurable achievements."
        )

    # -------------------------------------------------
    # Summary recommendations
    # -------------------------------------------------

    summary_recommendations = [
        "Keep the professional summary focused on role, experience, technical strengths, and measurable impact.",
        "Avoid generic statements such as 'hardworking' or 'quick learner' unless supported by evidence.",
        "Customize the summary for each target job.",
    ]

    # -------------------------------------------------
    # Overall score
    # -------------------------------------------------

    overall_score = round(
        (
            float(ats_score)
            + float(skills_score)
            + float(experience_score)
            + float(education_score)
        ) / 4,
        1,
    )

    return {
        "overall_score": overall_score,

        "current_scores": {
            "ats_score": float(ats_score),
            "skills_score": float(skills_score),
            "experience_score": float(experience_score),
            "education_score": float(education_score),
        },

        "summary": {
            "recommendations": summary_recommendations,
        },

        "improvements": improvements,

        "keyword_suggestions": keyword_suggestions,

        "formatting_recommendations": formatting_recommendations,

        "ats_recommendations": ats_recommendations,

        "total_improvements": len(improvements),
    }
