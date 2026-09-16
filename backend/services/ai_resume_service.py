import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# Technical skills database
SKILLS_DATABASE = [
    "python",
    "java",
    "javascript",
    "typescript",
    "react",
    "next.js",
    "node.js",
    "express",
    "fastapi",
    "django",
    "flask",
    "spring boot",
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
    "github actions",
    "git",
    "machine learning",
    "deep learning",
    "tensorflow",
    "pytorch",
    "scikit-learn",
    "pandas",
    "numpy",
    "data analysis",
    "data science",
    "power bi",
    "tableau",
    "excel",
    "html",
    "css",
    "tailwind",
    "redux",
    "rest api",
    "graphql",
    "microservices",
    "linux",
    "devops",
    "ci/cd",
]


def clean_text(text: str) -> str:
    """Clean resume and job description text."""

    text = text.lower()

    text = re.sub(
        r"[^a-zA-Z0-9+#.\s]",
        " ",
        text
    )

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


def extract_skills(text: str):
    """Extract known skills from text."""

    text = clean_text(text)

    found_skills = []

    for skill in SKILLS_DATABASE:

        pattern = r"\b" + re.escape(skill.lower()) + r"\b"

        if re.search(pattern, text):
            found_skills.append(skill)

    return list(set(found_skills))


def calculate_similarity(
    resume_text: str,
    job_description: str
):
    """Calculate TF-IDF similarity."""

    documents = [
        resume_text,
        job_description
    ]

    vectorizer = TfidfVectorizer(
        stop_words="english"
    )

    tfidf_matrix = vectorizer.fit_transform(
        documents
    )

    similarity = cosine_similarity(
        tfidf_matrix[0:1],
        tfidf_matrix[1:2]
    )[0][0]

    return round(similarity * 100, 2)


def analyze_resume_with_job(
    resume_text: str,
    job_description: str
):

    resume_skills = extract_skills(
        resume_text
    )

    job_skills = extract_skills(
        job_description
    )

    matched_skills = list(
        set(resume_skills) &
        set(job_skills)
    )

    missing_skills = list(
        set(job_skills) -
        set(resume_skills)
    )

    similarity_score = calculate_similarity(
        resume_text,
        job_description
    )

    if len(job_skills) > 0:
        skill_match_score = round(
            (
                len(matched_skills)
                / len(job_skills)
            ) * 100,
            2
        )
    else:
        skill_match_score = 0

    # Final ATS score
    ats_score = round(
        (
            similarity_score * 0.4
            + skill_match_score * 0.6
        ),
        2
    )

    suggestions = []

    if missing_skills:
        suggestions.append(
            "Consider adding relevant missing skills: "
            + ", ".join(missing_skills[:8])
        )

    if similarity_score < 40:
        suggestions.append(
            "Your resume has low similarity with the job description. "
            "Customize your resume for this role."
        )

    if skill_match_score < 50:
        suggestions.append(
            "Improve keyword coverage based on the job requirements."
        )

    if ats_score >= 80:
        suggestions.append(
            "Excellent match. Your resume is strongly aligned with this job."
        )
    elif ats_score >= 60:
        suggestions.append(
            "Good match, but adding more relevant keywords can improve your chances."
        )
    else:
        suggestions.append(
            "Low match. Tailor your resume specifically for this job description."
        )

    return {
        "ats_score": ats_score,
        "similarity_score": similarity_score,
        "skill_match_score": skill_match_score,
        "resume_skills": resume_skills,
        "job_skills": job_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "suggestions": suggestions,
    }