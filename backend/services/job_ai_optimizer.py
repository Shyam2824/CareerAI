import json
import re
from typing import Any


# ============================================================
# COMMON TECHNICAL SKILLS / KEYWORDS
# ============================================================

TECHNICAL_TERMS = {
    "python",
    "java",
    "javascript",
    "typescript",
    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "redis",

    "fastapi",
    "flask",
    "django",
    "spring",
    "spring boot",

    "react",
    "next.js",
    "node.js",

    "machine learning",
    "deep learning",
    "artificial intelligence",
    "data science",
    "data analysis",

    "tensorflow",
    "pytorch",
    "scikit-learn",
    "pandas",
    "numpy",

    "aws",
    "azure",
    "gcp",

    "docker",
    "kubernetes",
    "terraform",
    "jenkins",

    "git",
    "github",
    "gitlab",

    "rest api",
    "rest",
    "api",

    "microservices",
    "ci/cd",
    "cicd",

    "langchain",
    "llamaindex",
    "rag",
    "generative ai",
    "llm",
    "transformers",

    "opencv",
    "yolo",
}


# ============================================================
# TEXT HELPERS
# ============================================================

def normalize_text(text: str | None) -> str:
    if not text:
        return ""

    text = text.lower()
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def extract_terms(text: str) -> list[str]:
    normalized = normalize_text(text)

    found = []

    for term in TECHNICAL_TERMS:
        if term in normalized:
            found.append(term)

    return sorted(set(found))


def extract_keywords(job_description: str) -> list[str]:
    """
    Extract useful words from the JD.

    This intentionally uses simple deterministic extraction.
    Later this can be replaced by an LLM/NLP pipeline.
    """

    text = normalize_text(job_description)

    words = re.findall(r"\b[a-zA-Z][a-zA-Z+#./-]{2,}\b", text)

    stop_words = {
        "the",
        "and",
        "for",
        "with",
        "that",
        "this",
        "from",
        "your",
        "our",
        "are",
        "will",
        "have",
        "has",
        "you",
        "who",
        "their",
        "they",
        "into",
        "about",
        "years",
        "year",
        "job",
        "role",
        "work",
        "working",
        "candidate",
        "experience",
        "required",
        "preferred",
    }

    keywords = []

    for word in words:
        word = word.lower()

        if word not in stop_words and len(word) >= 4:
            keywords.append(word)

    return sorted(set(keywords))


# ============================================================
# SKILL COMPARISON
# ============================================================

def compare_skills(
    resume_text: str,
    job_description: str,
) -> dict[str, Any]:

    resume_terms = set(extract_terms(resume_text))
    job_terms = set(extract_terms(job_description))

    matched = sorted(resume_terms.intersection(job_terms))
    missing = sorted(job_terms - resume_terms)

    if job_terms:
        percentage = round(
            len(matched) / len(job_terms) * 100,
            2,
        )
    else:
        percentage = 0

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "skill_match_percentage": percentage,
    }


# ============================================================
# KEYWORD COMPARISON
# ============================================================

def compare_keywords(
    resume_text: str,
    job_description: str,
) -> dict[str, Any]:

    resume_text = normalize_text(resume_text)
    job_text = normalize_text(job_description)

    job_keywords = extract_keywords(job_text)

    matched = []
    missing = []

    for keyword in job_keywords:

        if keyword in resume_text:
            matched.append(keyword)
        else:
            missing.append(keyword)

    if job_keywords:
        percentage = round(
            len(matched) / len(job_keywords) * 100,
            2,
        )
    else:
        percentage = 0

    return {
        "matched_keywords": matched,
        "missing_keywords": missing,
        "keyword_match_percentage": percentage,
    }


# ============================================================
# EXPERIENCE ANALYSIS
# ============================================================

def calculate_experience_score(
    resume_text: str,
    job_description: str,
) -> float:

    resume = normalize_text(resume_text)
    job = normalize_text(job_description)

    experience_words = [
        "experience",
        "developer",
        "engineer",
        "scientist",
        "analyst",
        "manager",
        "intern",
        "project",
        "developed",
        "implemented",
        "designed",
        "built",
        "deployed",
    ]

    job_experience_terms = [
        word
        for word in experience_words
        if word in job
    ]

    if not job_experience_terms:
        return 80.0

    matched = [
        word
        for word in job_experience_terms
        if word in resume
    ]

    return round(
        len(matched) /
        len(job_experience_terms) *
        100,
        2,
    )


# ============================================================
# EDUCATION ANALYSIS
# ============================================================

def calculate_education_score(
    resume_text: str,
    job_description: str,
) -> float:

    resume = normalize_text(resume_text)
    job = normalize_text(job_description)

    education_terms = [
        "bachelor",
        "b.tech",
        "btech",
        "master",
        "m.tech",
        "mtech",
        "degree",
        "computer science",
        "engineering",
        "statistics",
        "mathematics",
    ]

    required = [
        term
        for term in education_terms
        if term in job
    ]

    if not required:
        return 100.0

    matched = [
        term
        for term in required
        if term in resume
    ]

    return round(
        len(matched) /
        len(required) *
        100,
        2,
    )


# ============================================================
# SECTION ANALYSIS
# ============================================================

def calculate_sections_score(
    resume_text: str,
) -> float:

    text = normalize_text(resume_text)

    sections = [
        "summary",
        "skills",
        "experience",
        "education",
        "projects",
        "certifications",
        "achievements",
    ]

    found = [
        section
        for section in sections
        if section in text
    ]

    return round(
        len(found) /
        len(sections) *
        100,
        2,
    )


# ============================================================
# TITLE ALIGNMENT
# ============================================================

def calculate_title_score(
    resume_text: str,
    job_description: str,
) -> float:

    resume = normalize_text(resume_text)
    job = normalize_text(job_description)

    job_titles = [
        "data scientist",
        "data analyst",
        "machine learning engineer",
        "ml engineer",
        "software engineer",
        "python developer",
        "backend developer",
        "full stack developer",
        "ai engineer",
        "generative ai engineer",
        "devops engineer",
    ]

    matched_titles = [
        title
        for title in job_titles
        if title in job and title in resume
    ]

    required_titles = [
        title
        for title in job_titles
        if title in job
    ]

    if not required_titles:
        return 80.0

    if matched_titles:
        return 100.0

    return 40.0


# ============================================================
# FORMATTING SCORE
# ============================================================

def calculate_formatting_score(
    resume_text: str,
) -> float:

    if not resume_text:
        return 0.0

    score = 100.0

    if len(resume_text) < 300:
        score -= 20

    if len(resume_text) > 30000:
        score -= 10

    return max(0.0, min(score, 100.0))


# ============================================================
# JOB ATS SCORE
# ============================================================

def calculate_job_ats_score(
    resume_text: str,
    job_description: str,
) -> dict[str, Any]:

    skill_data = compare_skills(
        resume_text,
        job_description,
    )

    keyword_data = compare_keywords(
        resume_text,
        job_description,
    )

    skills_score = skill_data["skill_match_percentage"]

    keywords_score = keyword_data[
        "keyword_match_percentage"
    ]

    experience_score = calculate_experience_score(
        resume_text,
        job_description,
    )

    education_score = calculate_education_score(
        resume_text,
        job_description,
    )

    sections_score = calculate_sections_score(
        resume_text,
    )

    title_score = calculate_title_score(
        resume_text,
        job_description,
    )

    formatting_score = calculate_formatting_score(
        resume_text,
    )

    ats_score = round(
        (
            skills_score * 0.30
            + keywords_score * 0.25
            + experience_score * 0.20
            + title_score * 0.10
            + education_score * 0.05
            + sections_score * 0.05
            + formatting_score * 0.05
        ),
        2,
    )

    strengths = []
    improvements = []

    if skills_score >= 70:
        strengths.append(
            "Strong technical skill alignment with the job."
        )
    else:
        improvements.append(
            "Improve alignment with the technical skills required by the job."
        )

    if keywords_score >= 70:
        strengths.append(
            "Good keyword alignment with the job description."
        )
    else:
        improvements.append(
            "Review missing job-specific keywords."
        )

    if experience_score >= 70:
        strengths.append(
            "Resume experience appears relevant to the role."
        )
    else:
        improvements.append(
            "Highlight relevant responsibilities and achievements."
        )

    if sections_score < 80:
        improvements.append(
            "Add or improve standard resume sections."
        )

    return {
        "ats_score": ats_score,
        "skills_score": skills_score,
        "keywords_score": keywords_score,
        "experience_score": experience_score,
        "title_score": title_score,
        "education_score": education_score,
        "sections_score": sections_score,
        "formatting_score": formatting_score,
        "matched_skills": skill_data["matched_skills"],
        "missing_skills": skill_data["missing_skills"],
        "matched_keywords": keyword_data["matched_keywords"],
        "missing_keywords": keyword_data["missing_keywords"],
        "strengths": strengths,
        "improvements": improvements,
    }


# ============================================================
# AI-STYLE OPTIMIZATION
# ============================================================

def optimize_resume_for_job(
    resume_text: str,
    job_description: str,
) -> dict[str, Any]:

    ats = calculate_job_ats_score(
        resume_text,
        job_description,
    )

    missing_skills = ats["missing_skills"]
    missing_keywords = ats["missing_keywords"]

    recommendations = []

    for skill in missing_skills[:10]:
        recommendations.append(
            f"Consider highlighting {skill} if you genuinely have "
            f"experience with it."
        )

    for keyword in missing_keywords[:10]:
        recommendations.append(
            f"Consider using the keyword '{keyword}' where it "
            f"accurately describes your existing experience."
        )

    experience_changes = []

    # Safe optimization:
    # We do not invent new experience.
    if resume_text:
        experience_changes.append(
            {
                "section": "experience",
                "original": "",
                "optimized": "",
                "reason": (
                    "Review experience bullets and rewrite them "
                    "to emphasize measurable, job-relevant results."
                ),
                "impact": "Potentially improves ATS relevance",
                "status": "pending",
            }
        )

    project_changes = []

    if "projects" in normalize_text(resume_text):
        project_changes.append(
            {
                "section": "projects",
                "original": "",
                "optimized": "",
                "reason": (
                    "Highlight projects that directly demonstrate "
                    "requirements from the target job."
                ),
                "impact": "Potentially improves relevance",
                "status": "pending",
            }
        )

    # Current implementation does not fabricate an improved score.
    before_score = ats["ats_score"]

    # Suggestions are pending, therefore score stays unchanged
    # until the user actually applies valid changes.
    after_score = before_score

    return {
        "before_ats_score": before_score,
        "after_ats_score": after_score,

        "summary": {
            "original": "",
            "optimized": "",
            "reason": (
                "Review the summary against the target job and "
                "emphasize skills and experience already present "
                "in the resume."
            ),
        },

        "experience_improvements": experience_changes,

        "skill_recommendations": missing_skills,

        "keyword_recommendations": missing_keywords,

        "project_improvements": project_changes,

        "recommendations": recommendations,
    }