import re
from typing import Optional


def extract_keywords(text: str) -> list[str]:
    if not text:
        return []

    words = re.findall(r"[a-zA-Z][a-zA-Z0-9+#.-]{2,}", text.lower())

    stop_words = {
        "the", "and", "for", "with", "from",
        "this", "that", "have", "has", "using",
        "your", "you", "are", "was", "were",
        "into", "about", "which", "will", "their",
        "they", "then", "than", "also"
    }

    unique = []

    for word in words:
        if word not in stop_words and word not in unique:
            unique.append(word)

    return unique


def generate_ai_question(
    resume_text: str = "",
    job_description: str = "",
    previous_question: str = "",
    candidate_answer: str = "",
    difficulty: str = "medium",
) -> dict:

    resume_keywords = extract_keywords(resume_text)
    jd_keywords = extract_keywords(job_description)

    # Prefer skills appearing in the JD
    priority_keywords = []

    for keyword in jd_keywords:
        if keyword in resume_keywords and keyword not in priority_keywords:
            priority_keywords.append(keyword)

    # Otherwise use resume keywords
    if not priority_keywords:
        priority_keywords = resume_keywords

    topic = priority_keywords[0] if priority_keywords else "technical concepts"

    if candidate_answer:
        question = (
            f"Can you explain your approach to {topic} "
            f"in more detail and describe a practical example?"
        )
    elif previous_question:
        question = (
            f"Based on your previous answer, what challenges "
            f"could you face when working with {topic}?"
        )
    else:
        question = (
            f"Can you explain your experience with {topic} "
            f"and how you have used it in a practical project?"
        )

    return {
        "question": question,
        "category": "Technical",
        "topic": topic,
        "difficulty": difficulty,
        "question_type": "ai_generated",
    }