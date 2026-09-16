import re


# =====================================
# Technical Skills Database
# =====================================

SKILLS = [
    "python",
    "java",
    "javascript",
    "typescript",
    "c++",
    "c#",

    "react",
    "react.js",
    "next.js",
    "angular",
    "vue",

    "node.js",
    "node",
    "express",

    "fastapi",
    "django",
    "flask",

    "sql",
    "mysql",
    "postgresql",
    "mongodb",

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

    "machine learning",
    "deep learning",
    "artificial intelligence",

    "tensorflow",
    "pytorch",
    "scikit-learn",

    "pandas",
    "numpy",

    "html",
    "css",

    "spring",
    "spring boot",

    "hibernate",
    "maven",

    "rest api",
    "microservices",

    "linux",
    "devops",

    "ci/cd",
    "ansible",
]


# =====================================
# Extract Skills
# =====================================

def extract_skills(text: str):

    if not text:
        return []

    text = text.lower()

    found_skills = []

    for skill in SKILLS:

        pattern = r"\b" + re.escape(skill) + r"\b"

        if re.search(pattern, text):
            found_skills.append(skill)

    return sorted(list(set(found_skills)))


# =====================================
# Resume vs Job Description Matching
# =====================================

def match_resume_with_job(
    resume_text: str,
    job_description: str,
):

    # Extract skills
    resume_skills = extract_skills(resume_text)

    job_skills = extract_skills(job_description)

    # Convert to sets
    resume_skills_set = set(resume_skills)

    job_skills_set = set(job_skills)

    # Matched skills
    matched_skills = sorted(
        list(
            resume_skills_set
            &
            job_skills_set
        )
    )

    # Missing skills
    missing_skills = sorted(
        list(
            job_skills_set
            -
            resume_skills_set
        )
    )

    # =====================================
    # Calculate Match Score
    # =====================================

    if len(job_skills) == 0:

        match_score = 0.0

    else:

        match_score = round(
            (
                len(matched_skills)
                /
                len(job_skills)
            )
            *
            100,
            2,
        )

    # =====================================
    # Generate Suggestions
    # =====================================

    suggestions = []

    if missing_skills:

        suggestions.append(
            "Consider adding relevant missing skills to your resume if you have practical experience with them."
        )

    if match_score < 40:

        suggestions.append(
            "Low job match. Customize your resume specifically for this job description."
        )

    elif match_score < 70:

        suggestions.append(
            "Moderate job match. Add relevant keywords, projects, and achievements."
        )

    else:

        suggestions.append(
            "Strong job match. Highlight relevant experience and achievements."
        )

    if not matched_skills:

        suggestions.append(
            "No major technical skill match was detected. Review the job requirements carefully."
        )

    return {
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "suggestions": suggestions,
    }