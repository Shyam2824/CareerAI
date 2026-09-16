import re


SKILLS = [
    "python",
    "java",
    "javascript",
    "typescript",
    "react",
    "next.js",
    "node.js",
    "fastapi",
    "django",
    "flask",
    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "aws",
    "azure",
    "docker",
    "kubernetes",
    "terraform",
    "jenkins",
    "git",
    "machine learning",
    "deep learning",
    "tensorflow",
    "pytorch",
    "pandas",
    "numpy",
]


def analyze_resume(text: str):

    text_lower = text.lower()

    found_skills = []

    for skill in SKILLS:
        if skill in text_lower:
            found_skills.append(skill)

    # Skills score
    skills_score = min(
        len(found_skills) * 5,
        100
    )

    # Experience score
    experience_keywords = [
        "experience",
        "internship",
        "developer",
        "engineer",
        "worked",
        "project",
    ]

    experience_count = sum(
        1
        for keyword in experience_keywords
        if keyword in text_lower
    )

    experience_score = min(
        experience_count * 15,
        100
    )

    # Education score
    education_keywords = [
        "b.tech",
        "bachelor",
        "master",
        "university",
        "college",
        "education",
    ]

    education_count = sum(
        1
        for keyword in education_keywords
        if keyword in text_lower
    )

    education_score = min(
        education_count * 20,
        100
    )

    # ATS Score
    ats_score = round(
        (
            skills_score * 0.5
            + experience_score * 0.3
            + education_score * 0.2
        ),
        2
    )

    feedback = []

    if skills_score < 50:
        feedback.append(
            "Add more relevant technical skills."
        )

    if experience_score < 50:
        feedback.append(
            "Clearly highlight your work experience and projects."
        )

    if education_score < 50:
        feedback.append(
            "Add clear education details."
        )

    if ats_score >= 75:
        feedback.append(
            "Good resume structure for ATS screening."
        )
    else:
        feedback.append(
            "Improve keyword optimization for better ATS score."
        )

    return {
        "ats_score": ats_score,
        "skills_score": skills_score,
        "experience_score": experience_score,
        "education_score": education_score,
        "feedback": " ".join(feedback),
    }