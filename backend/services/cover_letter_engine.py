import re
from typing import List, Dict


# ============================================================
# TECHNICAL KEYWORDS
# ============================================================

TECHNICAL_KEYWORDS = {
    "python",
    "sql",
    "pandas",
    "numpy",
    "scikit-learn",
    "sklearn",
    "tensorflow",
    "pytorch",
    "keras",
    "opencv",
    "fastapi",
    "flask",
    "django",
    "machine learning",
    "deep learning",
    "data science",
    "data analysis",
    "artificial intelligence",
    "ai",
    "generative ai",
    "genai",
    "llm",
    "large language model",
    "rag",
    "retrieval augmented generation",
    "langchain",
    "llamaindex",
    "nlp",
    "natural language processing",
    "computer vision",
    "docker",
    "aws",
    "azure",
    "gcp",
    "git",
    "github",
    "rest api",
    "api",
    "postgresql",
    "mysql",
    "mongodb",
    "spark",
    "pyspark",
    "statistics",
    "data visualization",
    "power bi",
    "tableau",
}


# ============================================================
# EXTRACT KEYWORDS
# ============================================================

def extract_keywords(text: str) -> List[str]:
    """
    Extract known technical keywords from text.
    """

    if not text:
        return []

    text_lower = text.lower()

    found = []

    for keyword in TECHNICAL_KEYWORDS:
        pattern = r"\b" + re.escape(keyword) + r"\b"

        if re.search(pattern, text_lower):
            found.append(keyword)

    return sorted(set(found))


# ============================================================
# FIND MATCHED SKILLS
# ============================================================

def find_matched_skills(
    resume_text: str,
    job_description: str,
) -> List[str]:

    resume_keywords = set(
        extract_keywords(resume_text)
    )

    jd_keywords = set(
        extract_keywords(job_description)
    )

    return sorted(
        resume_keywords.intersection(jd_keywords)
    )


# ============================================================
# FIND MISSING SKILLS
# ============================================================

def find_missing_skills(
    resume_text: str,
    job_description: str,
) -> List[str]:

    resume_keywords = set(
        extract_keywords(resume_text)
    )

    jd_keywords = set(
        extract_keywords(job_description)
    )

    return sorted(
        jd_keywords - resume_keywords
    )


# ============================================================
# FIND RELEVANT RESUME SENTENCES
# ============================================================

def find_relevant_sentences(
    resume_text: str,
    matched_skills: List[str],
) -> List[str]:

    if not resume_text:
        return []

    sentences = re.split(
        r"(?<=[.!?])\s+|\n+",
        resume_text,
    )

    relevant = []

    for sentence in sentences:

        clean_sentence = sentence.strip()

        if not clean_sentence:
            continue

        sentence_lower = clean_sentence.lower()

        for skill in matched_skills:

            if skill.lower() in sentence_lower:
                relevant.append(clean_sentence)
                break

    return relevant[:6]


# ============================================================
# GET TONE INTRO
# ============================================================

def get_intro(
    tone: str,
    job_title: str,
    company_name: str,
) -> str:

    job = job_title.strip() or "this position"
    company = company_name.strip()

    if company:
        company_text = f" at {company}"
    else:
        company_text = ""

    if tone == "friendly":
        return (
            f"I am excited to apply for the {job} position"
            f"{company_text}. "
        )

    if tone == "confident":
        return (
            f"I am writing to express my strong interest "
            f"in the {job} position{company_text}. "
        )

    return (
        f"I am writing to express my interest in the "
        f"{job} position{company_text}. "
    )


# ============================================================
# GET CLOSING
# ============================================================

def get_closing(tone: str) -> str:

    if tone == "friendly":
        return (
            "Thank you for considering my application. "
            "I would be happy to discuss how my background "
            "can contribute to your team."
        )

    if tone == "confident":
        return (
            "Thank you for considering my application. "
            "I look forward to the opportunity to discuss "
            "how my skills and experience can contribute "
            "to your organization."
        )

    return (
        "Thank you for considering my application. "
        "I look forward to the opportunity to discuss "
        "how my skills and experience align with this role."
    )


# ============================================================
# GENERATE COVER LETTER
# ============================================================

def generate_cover_letter(
    resume_text: str,
    job_description: str,
    job_title: str = "",
    company_name: str = "",
    tone: str = "professional",
) -> str:

    resume_text = resume_text or ""
    job_description = job_description or ""

    matched_skills = find_matched_skills(
        resume_text,
        job_description,
    )

    relevant_sentences = find_relevant_sentences(
        resume_text,
        matched_skills,
    )

    paragraphs = []

    # --------------------------------------------------------
    # INTRODUCTION
    # --------------------------------------------------------

    paragraphs.append(
        get_intro(
            tone,
            job_title,
            company_name,
        )
    )

    # --------------------------------------------------------
    # SKILLS
    # --------------------------------------------------------

    if matched_skills:

        skill_text = ", ".join(
            skill.title()
            for skill in matched_skills
        )

        paragraphs.append(
            "My background includes experience with "
            f"{skill_text}. These skills closely align "
            "with the technical requirements of the role."
        )

    # --------------------------------------------------------
    # EXPERIENCE
    # --------------------------------------------------------

    if relevant_sentences:

        experience_text = " ".join(
            relevant_sentences[:3]
        )

        paragraphs.append(
            "My relevant background includes "
            f"{experience_text}"
        )

    # --------------------------------------------------------
    # JD ALIGNMENT
    # --------------------------------------------------------

    if matched_skills:

        paragraphs.append(
            "The alignment between my existing experience "
            "and the requirements of this position would "
            "allow me to contribute effectively while "
            "continuing to develop my technical skills."
        )

    # --------------------------------------------------------
    # CLOSING
    # --------------------------------------------------------

    paragraphs.append(
        get_closing(tone)
    )

    return "\n\n".join(paragraphs)


# ============================================================
# JOB MATCH ANALYSIS
# ============================================================

def analyze_resume_against_job(
    resume_text: str,
    job_description: str,
) -> Dict:

    matched_skills = find_matched_skills(
        resume_text,
        job_description,
    )

    missing_skills = find_missing_skills(
        resume_text,
        job_description,
    )

    jd_keywords = extract_keywords(
        job_description
    )

    resume_keywords = extract_keywords(
        resume_text
    )

    if jd_keywords:
        match_percentage = round(
            (
                len(matched_skills)
                / len(jd_keywords)
            )
            * 100,
            2,
        )
    else:
        match_percentage = 0.0

    return {
        "resume_keywords": resume_keywords,
        "job_keywords": jd_keywords,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "match_percentage": match_percentage,
    }