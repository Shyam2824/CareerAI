import re
from typing import List, Dict


# ============================================================
# RESUME SKILLS
# ============================================================

RESUME_SKILLS = {
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

SKILL_QUESTIONS = {
    "Python": (
        "Python",
        "Python",
        "How would you use Python to solve a real-world data science problem?",
    ),
    "SQL": (
        "SQL",
        "SQL",
        "How would you use SQL to extract, transform, and analyze data?",
    ),
    "Pandas": (
        "Data Analysis",
        "Pandas",
        "How have you used Pandas for data cleaning and analysis?",
    ),
    "NumPy": (
        "Data Analysis",
        "NumPy",
        "How would you use NumPy when preparing data for a machine learning model?",
    ),
    "Scikit-learn": (
        "Machine Learning",
        "Scikit-learn",
        "How would you select and train a Scikit-learn model for a classification problem?",
    ),
    "TensorFlow": (
        "Deep Learning",
        "TensorFlow",
        "When would you choose TensorFlow for a machine learning or deep learning project?",
    ),
    "PyTorch": (
        "Deep Learning",
        "PyTorch",
        "How would you build and train a model using PyTorch?",
    ),
    "Keras": (
        "Deep Learning",
        "Keras",
        "How would you use Keras to build a neural network?",
    ),
    "OpenCV": (
        "Computer Vision",
        "OpenCV",
        "How have you used OpenCV in a computer vision project?",
    ),
    "YOLO": (
        "Computer Vision",
        "YOLO",
        "Explain how YOLO can be used for real-time object detection.",
    ),
    "Flask": (
        "Backend",
        "Flask",
        "How would you deploy a machine learning model through a Flask API?",
    ),
    "FastAPI": (
        "Backend",
        "FastAPI",
        "Why would you choose FastAPI for serving a machine learning API?",
    ),
    "Django": (
        "Backend",
        "Django",
        "How have you used Django to build a backend application?",
    ),
    "Streamlit": (
        "Deployment",
        "Streamlit",
        "How would you use Streamlit to build a machine learning demo?",
    ),
    "Docker": (
        "Deployment",
        "Docker",
        "How would you containerize a machine learning application using Docker?",
    ),
    "AWS": (
        "Cloud",
        "AWS",
        "How would you deploy and monitor a machine learning application on AWS?",
    ),
    "Azure": (
        "Cloud",
        "Azure",
        "How would you use Azure services to support a production ML application?",
    ),
    "GCP": (
        "Cloud",
        "GCP",
        "How would you deploy a machine learning service on Google Cloud?",
    ),
    "LangChain": (
        "GenAI",
        "LangChain",
        "How would you use LangChain to build a production GenAI application?",
    ),
    "LlamaIndex": (
        "GenAI",
        "LlamaIndex",
        "How would you use LlamaIndex in a document-based GenAI application?",
    ),
    "RAG": (
        "GenAI",
        "RAG",
        "Explain how you would design a reliable RAG pipeline.",
    ),
    "LLM": (
        "GenAI",
        "LLM",
        "What factors would you consider when selecting an LLM for production?",
    ),
    "Generative AI": (
        "GenAI",
        "Generative AI",
        "How would you design a Generative AI solution for a business problem?",
    ),
    "Machine Learning": (
        "Machine Learning",
        "ML Fundamentals",
        "How would you choose a machine learning algorithm for a new problem?",
    ),
    "Deep Learning": (
        "Deep Learning",
        "DL Fundamentals",
        "When would you choose deep learning instead of traditional machine learning?",
    ),
    "NLP": (
        "NLP",
        "NLP Fundamentals",
        "Which NLP techniques would you consider for a text classification problem?",
    ),
    "Statistics": (
        "Statistics",
        "Statistics",
        "Which statistical concepts are important when analyzing a dataset?",
    ),
    "PySpark": (
        "Big Data",
        "PySpark",
        "How would you use PySpark to process a large dataset?",
    ),
    "Spark": (
        "Big Data",
        "Spark",
        "How would you optimize a Spark job processing a large dataset?",
    ),
}


# ============================================================
# GENERAL QUESTIONS
# ============================================================

GENERAL_QUESTIONS = [
    {
        "question": "Explain the difference between supervised and unsupervised learning.",
        "category": "Machine Learning",
        "topic": "ML Fundamentals",
        "question_type": "technical",
    },
    {
        "question": "How do you handle missing values in a dataset?",
        "category": "Data Science",
        "topic": "Data Preprocessing",
        "question_type": "technical",
    },
    {
        "question": "Explain precision, recall, and F1-score and when you would use them.",
        "category": "Machine Learning",
        "topic": "Model Evaluation",
        "question_type": "technical",
    },
    {
        "question": "How would you detect and prevent overfitting?",
        "category": "Machine Learning",
        "topic": "Model Generalization",
        "question_type": "technical",
    },
    {
        "question": "Explain cross-validation and why it is useful.",
        "category": "Machine Learning",
        "topic": "Validation",
        "question_type": "technical",
    },
    {
        "question": "What is feature engineering and why is it important?",
        "category": "Data Science",
        "topic": "Feature Engineering",
        "question_type": "technical",
    },
    {
        "question": "Describe a machine learning project you worked on and the result you achieved.",
        "category": "Experience",
        "topic": "Projects",
        "question_type": "behavioral",
    },
    {
        "question": "How would you monitor a machine learning model after deployment?",
        "category": "MLOps",
        "topic": "Model Monitoring",
        "question_type": "system_design",
    },
    {
        "question": "How would you improve an ML model that is not meeting its target?",
        "category": "Machine Learning",
        "topic": "Model Optimization",
        "question_type": "scenario",
    },
    {
        "question": "How would you explain an ML model to a non-technical stakeholder?",
        "category": "Communication",
        "topic": "Stakeholders",
        "question_type": "behavioral",
    },
]


# ============================================================
# EXTRACT SKILLS
# ============================================================

def extract_resume_skills(resume_text: str) -> List[str]:
    if not resume_text:
        return []

    text = resume_text.lower()

    found = []

    for keyword, display_name in RESUME_SKILLS.items():

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
# GENERATE RESUME QUESTIONS
# ============================================================

def generate_resume_questions(
    resume_text: str,
    job_title: str = "",
    difficulty: str = "medium",
    limit: int = 10,
) -> List[dict]:

    limit = max(
        1,
        min(int(limit or 10), 50),
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

    # --------------------------------------------------------
    # Resume skill questions
    # --------------------------------------------------------

    skills = extract_resume_skills(
        resume_text
    )

    for skill in skills:

        template = SKILL_QUESTIONS.get(
            skill
        )

        if template:

            category, topic, question = (
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

        questions.append(
            {
                "question": question,
                "category": category,
                "topic": topic,
                "difficulty": difficulty,
                "question_type": "technical",
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
                    f"Describe how your previous "
                    f"experience prepares you for a "
                    f"{job_title.strip()} role."
                ),
                "category": "Role",
                "topic": job_title.strip(),
                "difficulty": difficulty,
                "question_type": "scenario",
            }
        )

    # --------------------------------------------------------
    # General questions
    # --------------------------------------------------------

    for item in GENERAL_QUESTIONS:

        questions.append(
            {
                **item,
                "difficulty": difficulty,
            }
        )

        if len(
            _unique_questions(questions)
        ) >= limit:

            break

    return _unique_questions(
        questions
    )[:limit]