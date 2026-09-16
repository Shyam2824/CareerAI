import re


# ==========================================
# SKILLS DATABASE
# ==========================================

SKILLS_DATABASE = [

    # Programming
    "python",
    "java",
    "javascript",
    "typescript",
    "c++",
    "c#",
    "sql",

    # Data Science / ML
    "machine learning",
    "deep learning",
    "data science",
    "artificial intelligence",
    "generative ai",
    "nlp",
    "computer vision",
    "tensorflow",
    "pytorch",
    "scikit-learn",
    "pandas",
    "numpy",

    # AI Tools
    "langchain",
    "llm",
    "openai",
    "hugging face",
    "transformers",

    # Backend
    "fastapi",
    "django",
    "flask",
    "spring boot",
    "node.js",
    "express",

    # Frontend
    "react",
    "react.js",
    "next.js",
    "html",
    "css",
    "tailwind",

    # Database
    "mysql",
    "postgresql",
    "mongodb",
    "redis",

    # Cloud / DevOps
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "jenkins",
    "terraform",
    "ansible",
    "github actions",
    "ci/cd",

    # Data Engineering
    "spark",
    "hadoop",
    "airflow",
    "kafka",

    # Tools
    "git",
    "github",
    "linux",
]


# ==========================================
# NORMALIZE TEXT
# ==========================================

def normalize_text(text: str) -> str:

    if not text:
        return ""

    text = text.lower()

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


# ==========================================
# FIND SKILLS
# ==========================================

def find_skills(text: str) -> list[str]:

    normalized_text = normalize_text(text)

    found_skills = []

    for skill in SKILLS_DATABASE:

        if skill.lower() in normalized_text:

            found_skills.append(skill)

    return sorted(
        list(set(found_skills))
    )


# ==========================================
# EXTRACT EXPERIENCE YEARS
# ==========================================

def extract_experience_years(text: str) -> float:

    text = normalize_text(text)

    patterns = [

        r"(\d+(?:\.\d+)?)\+?\s*years",

        r"(\d+(?:\.\d+)?)\+?\s*yrs",

        r"experience.{0,20}?(\d+(?:\.\d+)?)",

    ]

    years_found = []

    for pattern in patterns:

        matches = re.findall(
            pattern,
            text,
        )

        for match in matches:

            try:

                years_found.append(
                    float(match)
                )

            except ValueError:

                pass

    if not years_found:

        return 0.0

    return max(years_found)


# ==========================================
# SKILLS MATCH SCORE
# ==========================================

def calculate_skills_score(
    resume_skills: list[str],
    job_skills: list[str],
) -> float:

    if not job_skills:

        return 50.0

    matched_skills = set(
        resume_skills
    ).intersection(
        set(job_skills)
    )

    score = (
        len(matched_skills)
        / len(job_skills)
    ) * 100

    return round(
        min(score, 100),
        2,
    )


# ==========================================
# KEYWORD MATCH SCORE
# ==========================================

def calculate_keyword_score(
    resume_text: str,
    job_description: str,
) -> float:

    resume_words = set(
        re.findall(
            r"\b[a-zA-Z]+\b",
            normalize_text(resume_text),
        )
    )

    job_words = re.findall(
        r"\b[a-zA-Z]+\b",
        normalize_text(job_description),
    )

    # Important keywords
    important_words = [

        word
        for word in job_words
        if len(word) > 3
    ]

    if not important_words:

        return 50.0

    unique_keywords = set(
        important_words
    )

    matched_keywords = (
        resume_words.intersection(
            unique_keywords
        )
    )

    score = (
        len(matched_keywords)
        / len(unique_keywords)
    ) * 100

    return round(
        min(score, 100),
        2,
    )


# ==========================================
# EXPERIENCE MATCH SCORE
# ==========================================

def calculate_experience_score(
    resume_text: str,
    job_description: str,
) -> float:

    resume_years = extract_experience_years(
        resume_text
    )

    job_years = extract_experience_years(
        job_description
    )

    # If JD doesn't specify experience
    if job_years == 0:

        return 70.0

    # Resume meets requirement
    if resume_years >= job_years:

        return 100.0

    # Partial score
    score = (
        resume_years / job_years
    ) * 100

    return round(
        min(score, 100),
        2,
    )


# ==========================================
# MATCHED KEYWORDS
# ==========================================

def get_matched_keywords(
    resume_text: str,
    job_description: str,
) -> list[str]:

    resume_words = set(
        re.findall(
            r"\b[a-zA-Z]+\b",
            normalize_text(resume_text),
        )
    )

    job_words = set(
        re.findall(
            r"\b[a-zA-Z]+\b",
            normalize_text(job_description),
        )
    )

    matched = (
        resume_words.intersection(
            job_words
        )
    )

    # Remove small/common words
    matched = [

        word
        for word in matched
        if len(word) > 3
    ]

    return sorted(
        matched
    )[:30]


# ==========================================
# MISSING KEYWORDS
# ==========================================

def get_missing_keywords(
    resume_text: str,
    job_description: str,
) -> list[str]:

    resume_words = set(
        re.findall(
            r"\b[a-zA-Z]+\b",
            normalize_text(resume_text),
        )
    )

    job_words = set(
        re.findall(
            r"\b[a-zA-Z]+\b",
            normalize_text(job_description),
        )
    )

    missing = (
        job_words
        - resume_words
    )

    missing = [

        word
        for word in missing
        if len(word) > 4
    ]

    return sorted(
        missing
    )[:30]


# ==========================================
# GENERATE RECOMMENDATIONS
# ==========================================

def generate_recommendations(
    matched_skills: list[str],
    missing_skills: list[str],
    skills_score: float,
    keyword_score: float,
    experience_score: float,
) -> list[dict]:

    recommendations = []

    # ------------------------------------------
    # SKILLS
    # ------------------------------------------

    if skills_score < 70:

        recommendations.append({

            "type": "skills",

            "priority": "high",

            "suggestion": (
                "Add relevant technical skills "
                "from the job description."
            ),

        })

    # ------------------------------------------
    # MISSING SKILLS
    # ------------------------------------------

    if missing_skills:

        recommendations.append({

            "type": "keywords",

            "priority": "high",

            "suggestion": (
                "Highlight relevant missing skills "
                "if you have practical experience "
                "with them."
            ),

        })

    # ------------------------------------------
    # KEYWORDS
    # ------------------------------------------

    if keyword_score < 60:

        recommendations.append({

            "type": "keywords",

            "priority": "medium",

            "suggestion": (
                "Use more relevant keywords from "
                "the job description naturally "
                "throughout your resume."
            ),

        })

    # ------------------------------------------
    # EXPERIENCE
    # ------------------------------------------

    if experience_score < 70:

        recommendations.append({

            "type": "experience",

            "priority": "medium",

            "suggestion": (
                "Clearly highlight relevant work "
                "experience, projects, internships, "
                "and measurable achievements."
            ),

        })

    # ------------------------------------------
    # GOOD MATCH
    # ------------------------------------------

    if not recommendations:

        recommendations.append({

            "type": "general",

            "priority": "low",

            "suggestion": (
                "Your resume aligns well with this "
                "job description. Customize your "
                "professional summary for this role."
            ),

        })

    return recommendations


# ==========================================
# MAIN JOB MATCH FUNCTION
# ==========================================

def calculate_job_match(
    resume_text: str,
    job_description: str,
) -> dict:

    # ------------------------------------------
    # NORMALIZE
    # ------------------------------------------

    resume_text = normalize_text(
        resume_text
    )

    job_description = normalize_text(
        job_description
    )

    # ------------------------------------------
    # EXTRACT SKILLS
    # ------------------------------------------

    resume_skills = find_skills(
        resume_text
    )

    job_skills = find_skills(
        job_description
    )

    # ------------------------------------------
    # MATCHED SKILLS
    # ------------------------------------------

    matched_skills = sorted(
        list(
            set(resume_skills).intersection(
                set(job_skills)
            )
        )
    )

    # ------------------------------------------
    # MISSING SKILLS
    # ------------------------------------------

    missing_skills = sorted(
        list(
            set(job_skills) - set(resume_skills)
        )
    )

    # ------------------------------------------
    # CALCULATE SCORES
    # ------------------------------------------

    skills_score = calculate_skills_score(
        resume_skills,
        job_skills,
    )

    keyword_score = calculate_keyword_score(
        resume_text,
        job_description,
    )

    experience_score = calculate_experience_score(
        resume_text,
        job_description,
    )

    # ------------------------------------------
    # OVERALL MATCH SCORE
    # ------------------------------------------

    match_score = (

        skills_score * 0.50
        + keyword_score * 0.30
        + experience_score * 0.20

    )

    match_score = round(
        min(match_score, 100),
        2,
    )

    # ------------------------------------------
    # KEYWORDS
    # ------------------------------------------

    matched_keywords = get_matched_keywords(
        resume_text,
        job_description,
    )

    missing_keywords = get_missing_keywords(
        resume_text,
        job_description,
    )

    # ------------------------------------------
    # RECOMMENDATIONS
    # ------------------------------------------

    suggestions = generate_recommendations(
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        skills_score=skills_score,
        keyword_score=keyword_score,
        experience_score=experience_score,
    )

    # ------------------------------------------
    # RETURN RESULT
    # ------------------------------------------

    return {

        "match_score": match_score,

        "skills_score": skills_score,

        "keyword_score": keyword_score,

        "experience_score": experience_score,

        "resume_skills": resume_skills,

        "job_skills": job_skills,

        "matched_skills": matched_skills,

        "missing_skills": missing_skills,

        "matched_keywords": matched_keywords,

        "missing_keywords": missing_keywords,

        "suggestions": suggestions,

    }