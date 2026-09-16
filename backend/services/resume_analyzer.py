import re


# ==========================================
# SKILLS DATABASE
# ==========================================

SKILLS = [
    "Python",
    "Java",
    "JavaScript",
    "TypeScript",
    "C++",
    "C",
    "SQL",
    "HTML",
    "CSS",

    "React",
    "Next.js",
    "Node.js",
    "Express",
    "Django",
    "Flask",
    "FastAPI",
    "Spring Boot",

    "Machine Learning",
    "Deep Learning",
    "Generative AI",
    "NLP",
    "Computer Vision",
    "TensorFlow",
    "PyTorch",
    "Keras",
    "Scikit-learn",
    "Pandas",
    "NumPy",
    "OpenCV",

    "AWS",
    "Azure",
    "GCP",
    "Docker",
    "Kubernetes",
    "Terraform",
    "Jenkins",
    "Git",
    "GitHub",
    "CI/CD",

    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "Redis",
]


# ==========================================
# ACTION VERBS
# ==========================================

ACTION_VERBS = [
    "developed",
    "implemented",
    "designed",
    "built",
    "created",
    "optimized",
    "improved",
    "increased",
    "reduced",
    "led",
    "managed",
    "automated",
    "engineered",
    "deployed",
    "integrated",
    "analyzed",
    "trained",
    "fine-tuned",
    "architected",
    "delivered",
]


# ==========================================
# WEAK WORDS
# ==========================================

WEAK_PHRASES = [
    "responsible for",
    "worked on",
    "helped",
    "participated",
    "involved in",
    "tasked with",
]


# ==========================================
# DETECT SKILLS
# ==========================================

def detect_skills(text: str) -> list[str]:

    text_lower = text.lower()

    detected = []

    for skill in SKILLS:

        if skill.lower() in text_lower:
            detected.append(skill)

    return sorted(set(detected))


# ==========================================
# DETECT SECTIONS
# ==========================================

def detect_sections(text: str) -> dict:

    text_lower = text.lower()

    section_keywords = {

        "summary": [
            "summary",
            "professional summary",
            "profile",
            "objective",
        ],

        "experience": [
            "experience",
            "work experience",
            "professional experience",
            "employment",
        ],

        "education": [
            "education",
            "academic background",
            "qualification",
        ],

        "skills": [
            "skills",
            "technical skills",
            "core competencies",
        ],

        "projects": [
            "projects",
            "personal projects",
            "academic projects",
        ],

        "certifications": [
            "certifications",
            "certificates",
            "licenses",
        ],
    }

    results = {}

    for section, keywords in section_keywords.items():

        results[section] = any(
            keyword in text_lower
            for keyword in keywords
        )

    return results


# ==========================================
# CONTACT INFORMATION
# ==========================================

def analyze_contact_info(text: str) -> dict:

    email = bool(
        re.search(
            r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
            text,
        )
    )

    phone = bool(
        re.search(
            r"(\+91[\s-]?)?[6-9]\d{9}",
            text,
        )
    )

    linkedin = (
        "linkedin.com" in text.lower()
        or "linkedin" in text.lower()
    )

    github = (
        "github.com" in text.lower()
        or "github" in text.lower()
    )

    return {
        "email": email,
        "phone": phone,
        "linkedin": linkedin,
        "github": github,
    }


# ==========================================
# ACTION VERB ANALYSIS
# ==========================================

def analyze_action_verbs(text: str) -> dict:

    text_lower = text.lower()

    found = []

    for verb in ACTION_VERBS:

        if re.search(
            rf"\b{re.escape(verb)}\b",
            text_lower,
        ):
            found.append(verb)

    return {
        "count": len(found),
        "verbs": sorted(set(found)),
    }


# ==========================================
# QUANTIFIED ACHIEVEMENTS
# ==========================================

def analyze_achievements(text: str) -> dict:

    patterns = [

        r"\d+\s*%",
        r"\d+\+",
        r"\$\s?\d+",
        r"\d+\s*(users|customers|clients)",
        r"\d+\s*(fps|ms|seconds|minutes|hours)",
        r"\d+\s*(projects|applications|models)",
    ]

    count = 0

    examples = []

    for pattern in patterns:

        matches = re.findall(
            pattern,
            text,
            flags=re.IGNORECASE,
        )

        count += len(matches)

        examples.extend(matches[:3])

    return {
        "count": count,
        "examples": examples[:10],
    }


# ==========================================
# WEAK PHRASES
# ==========================================

def analyze_weak_phrases(text: str) -> list[str]:

    text_lower = text.lower()

    found = []

    for phrase in WEAK_PHRASES:

        if phrase in text_lower:
            found.append(phrase)

    return found


# ==========================================
# RESUME LENGTH
# ==========================================

def analyze_resume_length(text: str) -> dict:

    words = len(text.split())

    if words < 250:

        status = "too_short"

    elif words <= 1200:

        status = "good"

    else:

        status = "too_long"

    return {
        "word_count": words,
        "status": status,
    }


# ==========================================
# MAIN ANALYZER
# ==========================================

def analyze_resume_text(text: str) -> dict:

    if not text or not text.strip():

        return {
            "ats_score": 0,
            "skills_score": 0,
            "experience_score": 0,
            "education_score": 0,
            "feedback": "Unable to extract text from resume.",
            "skills": [],
            "sections": {},
            "strengths": [],
            "improvements": [
                "Upload a readable PDF or DOCX resume."
            ],
            "contact_info": {},
            "action_verbs": {},
            "achievements": {},
            "weak_phrases": [],
            "resume_length": {},
        }

    # ------------------------------------------
    # ANALYSIS
    # ------------------------------------------

    skills = detect_skills(text)

    sections = detect_sections(text)

    contact_info = analyze_contact_info(text)

    action_verbs = analyze_action_verbs(text)

    achievements = analyze_achievements(text)

    weak_phrases = analyze_weak_phrases(text)

    resume_length = analyze_resume_length(text)


    # ==========================================
    # SCORES
    # ==========================================

    # Skills Score

    skills_score = min(
        len(skills) * 5,
        100,
    )


    # Experience Score

    experience_score = 40

    if sections.get("experience"):
        experience_score += 25

    experience_score += min(
        achievements["count"] * 5,
        20,
    )

    experience_score += min(
        action_verbs["count"] * 3,
        15,
    )

    experience_score = min(
        experience_score,
        100,
    )


    # Education Score

    education_score = (
        100
        if sections.get("education")
        else 30
    )


    # ==========================================
    # ATS SCORE
    # ==========================================

    score = 0


    # Skills

    score += skills_score * 0.30


    # Experience

    score += experience_score * 0.25


    # Education

    score += education_score * 0.10


    # Resume Sections

    section_score = (
        sum(
            sections.values()
        )
        / len(sections)
        * 100
    )

    score += section_score * 0.15


    # Contact Information

    contact_score = (
        sum(
            contact_info.values()
        )
        / len(contact_info)
        * 100
    )

    score += contact_score * 0.10


    # Resume Length

    if resume_length["status"] == "good":
        score += 10

    elif resume_length["status"] == "too_short":
        score += 4

    else:
        score += 5


    # Weak phrase penalty

    score -= min(
        len(weak_phrases) * 2,
        8,
    )


    ats_score = round(
        max(min(score, 100), 0),
        1,
    )


    # ==========================================
    # STRENGTHS
    # ==========================================

    strengths = []

    if len(skills) >= 8:
        strengths.append(
            "Strong technical skills coverage"
        )

    if sections.get("experience"):
        strengths.append(
            "Work experience section detected"
        )

    if sections.get("projects"):
        strengths.append(
            "Projects section included"
        )

    if sections.get("education"):
        strengths.append(
            "Education information included"
        )

    if achievements["count"] >= 3:
        strengths.append(
            "Good use of measurable achievements"
        )

    if action_verbs["count"] >= 5:
        strengths.append(
            "Strong action-oriented language"
        )

    if resume_length["status"] == "good":
        strengths.append(
            "Resume has a good content length"
        )


    # ==========================================
    # IMPROVEMENTS
    # ==========================================

    improvements = []


    if not sections.get("summary"):
        improvements.append(
            "Add a professional summary at the top."
        )

    if len(skills) < 8:
        improvements.append(
            "Add more relevant technical skills."
        )

    if not sections.get("projects"):
        improvements.append(
            "Add relevant projects with technologies and outcomes."
        )

    if not contact_info.get("linkedin"):
        improvements.append(
            "Add your LinkedIn profile."
        )

    if not contact_info.get("github"):
        improvements.append(
            "Add your GitHub profile or portfolio."
        )

    if achievements["count"] < 3:
        improvements.append(
            "Add more quantified achievements such as percentages, user counts, or performance improvements."
        )

    if action_verbs["count"] < 5:
        improvements.append(
            "Use stronger action verbs such as Developed, Implemented, Optimized, or Led."
        )

    if weak_phrases:
        improvements.append(
            "Replace weak phrases like "
            + ", ".join(weak_phrases)
            + " with stronger action-oriented statements."
        )

    if resume_length["status"] == "too_short":
        improvements.append(
            "Your resume appears too short. Add relevant projects, achievements, or experience."
        )

    if resume_length["status"] == "too_long":
        improvements.append(
            "Your resume may be too long. Remove repetitive or less relevant content."
        )


    # ==========================================
    # FEEDBACK
    # ==========================================

    feedback_parts = []

    if strengths:
        feedback_parts.append(
            "Strengths: "
            + "; ".join(strengths[:3])
            + "."
        )

    if improvements:
        feedback_parts.append(
            "Improvements: "
            + "; ".join(improvements[:3])
            + "."
        )

    feedback = " ".join(feedback_parts)


    # ==========================================
    # RETURN ANALYSIS
    # ==========================================

    return {

        # SCORES

        "ats_score": ats_score,

        "skills_score": round(
            skills_score,
            1,
        ),

        "experience_score": round(
            experience_score,
            1,
        ),

        "education_score": round(
            education_score,
            1,
        ),


        # BASIC ANALYSIS

        "skills": skills,

        "sections": sections,

        "strengths": strengths,

        "improvements": improvements,

        "feedback": feedback,


        # ADVANCED ANALYSIS

        "contact_info": contact_info,

        "action_verbs": action_verbs,

        "achievements": achievements,

        "weak_phrases": weak_phrases,

        "resume_length": resume_length,
    }