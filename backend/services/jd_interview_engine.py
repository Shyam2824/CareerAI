import re
from typing import List, Dict


# ============================================================
# JD KEYWORDS
# ============================================================

JD_KEYWORDS = {
    "python": "Python",
    "sql": "SQL",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "scikit-learn": "Scikit-learn",
    "sklearn": "Scikit-learn",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "keras": "Keras",
    "opencv": "OpenCV",
    "yolo": "YOLO",
    "flask": "Flask",
    "fastapi": "FastAPI",
    "django": "Django",
    "streamlit": "Streamlit",
    "docker": "Docker",
    "aws": "AWS",
    "azure": "Azure",
    "gcp": "GCP",
    "langchain": "LangChain",
    "llamaindex": "LlamaIndex",
    "rag": "RAG",
    "llm": "LLM",
    "generative ai": "Generative AI",
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "nlp": "NLP",
    "statistics": "Statistics",
    "pyspark": "PySpark",
    "spark": "Spark",
}


# ============================================================
# SKILL QUESTIONS
# ============================================================

SKILL_QUESTION_MAP = {

    "Python": (
        "Python",
        "Python",
        "How would you use Python to solve a data science problem in this role?",
        "technical",
    ),

    "SQL": (
        "SQL",
        "SQL",
        "How would you use SQL to extract and analyze data for this role?",
        "technical",
    ),

    "Pandas": (
        "Data Analysis",
        "Pandas",
        "How would you use Pandas for data cleaning and analysis?",
        "technical",
    ),

    "NumPy": (
        "Data Analysis",
        "NumPy",
        "How would you use NumPy when preparing data for a machine learning model?",
        "technical",
    ),

    "Scikit-learn": (
        "Machine Learning",
        "Scikit-learn",
        "How would you use Scikit-learn to build and evaluate a model?",
        "technical",
    ),

    "TensorFlow": (
        "Deep Learning",
        "TensorFlow",
        "When would you choose TensorFlow for a deep learning problem?",
        "technical",
    ),

    "PyTorch": (
        "Deep Learning",
        "PyTorch",
        "How would you build and train a model using PyTorch?",
        "technical",
    ),

    "Keras": (
        "Deep Learning",
        "Keras",
        "How would you use Keras to build a neural network?",
        "technical",
    ),

    "OpenCV": (
        "Computer Vision",
        "OpenCV",
        "How would you use OpenCV in a computer vision application?",
        "technical",
    ),

    "YOLO": (
        "Computer Vision",
        "YOLO",
        "How would you use YOLO for real-time object detection?",
        "technical",
    ),

    "Flask": (
        "Backend",
        "Flask",
        "How would you deploy a machine learning model using Flask?",
        "technical",
    ),

    "FastAPI": (
        "Backend",
        "FastAPI",
        "Why would you choose FastAPI for serving an ML model?",
        "technical",
    ),

    "Django": (
        "Backend",
        "Django",
        "How would you use Django to build an AI backend?",
        "technical",
    ),

    "Streamlit": (
        "Deployment",
        "Streamlit",
        "How would you use Streamlit to demonstrate a machine learning model?",
        "technical",
    ),

    "Docker": (
        "Deployment",
        "Docker",
        "How would you containerize an AI application using Docker?",
        "technical",
    ),

    "AWS": (
        "Cloud",
        "AWS",
        "Which AWS services would you consider for deploying an ML application?",
        "system_design",
    ),

    "Azure": (
        "Cloud",
        "Azure",
        "Which Azure services would you consider for deploying an ML application?",
        "system_design",
    ),

    "GCP": (
        "Cloud",
        "GCP",
        "Which Google Cloud services would you consider for deploying an ML application?",
        "system_design",
    ),

    "LangChain": (
        "GenAI",
        "LangChain",
        "How would you use LangChain to build a production GenAI application?",
        "technical",
    ),

    "LlamaIndex": (
        "GenAI",
        "LlamaIndex",
        "How would you use LlamaIndex in a document-based AI application?",
        "technical",
    ),

    "RAG": (
        "GenAI",
        "RAG",
        "Explain how you would design a reliable RAG pipeline.",
        "system_design",
    ),

    "LLM": (
        "GenAI",
        "LLM",
        "What factors would you consider when selecting an LLM for production?",
        "technical",
    ),

    "Generative AI": (
        "GenAI",
        "Generative AI",
        "How would you design a Generative AI solution for a business problem?",
        "technical",
    ),

    "Machine Learning": (
        "Machine Learning",
        "ML Fundamentals",
        "Which machine learning approach would you consider for this role and why?",
        "technical",
    ),

    "Deep Learning": (
        "Deep Learning",
        "DL Fundamentals",
        "When would you choose deep learning over traditional machine learning?",
        "technical",
    ),

    "NLP": (
        "NLP",
        "NLP Fundamentals",
        "What NLP techniques would you consider for this role?",
        "technical",
    ),

    "Statistics": (
        "Statistics",
        "Statistics",
        "Which statistical concepts are important for this role?",
        "technical",
    ),

    "PySpark": (
        "Big Data",
        "PySpark",
        "How would you use PySpark to process a large dataset?",
        "technical",
    ),

    "Spark": (
        "Big Data",
        "Spark",
        "How would you optimize a Spark job?",
        "technical",
    ),
}


# ============================================================
# GENERAL JD QUESTIONS
# ============================================================

GENERAL_JD_QUESTIONS = [

    (
        "HR",
        "Job Requirements",
        "Which requirement in this job description do you consider your strongest area?",
        "behavioral",
    ),

    (
        "HR",
        "Skill Gap",
        "Which requirement in this job description would you need to improve, and how would you approach that?",
        "behavioral",
    ),

    (
        "Role",
        "Problem Solving",
        "What would be your approach to solving the main technical problems associated with this role?",
        "scenario",
    ),

    (
        "Communication",
        "Stakeholders",
        "How would you explain a technical solution to a non-technical stakeholder?",
        "behavioral",
    ),
]


# ============================================================
# EXTRACT JD SKILLS
# ============================================================

def extract_jd_skills(
    job_description: str,
) -> List[str]:

    if not job_description:
        return []

    text = job_description.lower()

    found = []

    for keyword, display_name in JD_KEYWORDS.items():

        if re.search(
            rf"(?<!\w){re.escape(keyword)}(?!\w)",
            text,
        ):

            if display_name not in found:
                found.append(display_name)

    return found


# ============================================================
# UNIQUE QUESTIONS
# ============================================================

def _unique_questions(
    questions: List[Dict],
) -> List[Dict]:

    result = []

    seen = set()

    for item in questions:

        question = str(
            item.get("question", "")
        ).strip()

        if not question:
            continue

        key = question.lower()

        if key in seen:
            continue

        seen.add(key)

        result.append(item)

    return result


# ============================================================
# GENERATE JD QUESTIONS
# ============================================================

def generate_jd_questions(
    job_description: str,
    job_title: str = "",
    difficulty: str = "medium",
    limit: int = 15,
) -> List[dict]:

    if not job_description or not job_description.strip():
        return []

    limit = max(
        1,
        min(int(limit or 15), 50),
    )

    difficulty = (
        difficulty
        if difficulty in {
            "easy",
            "medium",
            "hard",
        }
        else "medium"
    )

    questions = []

    skills = extract_jd_skills(
        job_description
    )

    # --------------------------------------------------------
    # Skill questions
    # --------------------------------------------------------

    for skill in skills:

        template = SKILL_QUESTION_MAP.get(
            skill
        )

        if template:

            category, topic, question, question_type = (
                template
            )

        else:

            category = "Technical"
            topic = skill
            question = (
                f"How have you used {skill} "
                "in a project, and what challenges "
                "did you face?"
            )
            question_type = "technical"

        questions.append(
            {
                "question": question,
                "category": category,
                "topic": topic,
                "difficulty": difficulty,
                "question_type": question_type,
            }
        )

        if len(
            _unique_questions(questions)
        ) >= limit:

            return _unique_questions(
                questions
            )[:limit]

    # --------------------------------------------------------
    # Role question
    # --------------------------------------------------------

    if job_title.strip():

        questions.append(
            {
                "question": (
                    f"What would be your approach to solving "
                    f"the main technical problems associated "
                    f"with a {job_title.strip()} role?"
                ),
                "category": "Role",
                "topic": job_title.strip(),
                "difficulty": difficulty,
                "question_type": "scenario",
            }
        )

    # --------------------------------------------------------
    # General JD questions
    # --------------------------------------------------------

    for (
        category,
        topic,
        question,
        question_type,
    ) in GENERAL_JD_QUESTIONS:

        questions.append(
            {
                "question": question,
                "category": category,
                "topic": topic,
                "difficulty": difficulty,
                "question_type": question_type,
            }
        )

        if len(
            _unique_questions(questions)
        ) >= limit:

            break

    return _unique_questions(
        questions
    )[:limit]


# ============================================================
# BACKWARD COMPATIBILITY
# ============================================================

generate_questions_from_jd = generate_jd_questions