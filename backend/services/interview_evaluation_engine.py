import re
from typing import List


STOP_WORDS = {
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "to",
    "of",
    "and",
    "or",
    "in",
    "on",
    "for",
    "with",
    "this",
    "that",
    "it",
    "as",
    "by",
    "from",
    "be",
    "can",
    "how",
    "what",
    "why",
}


def extract_keywords(text: str) -> List[str]:
    """
    Extract meaningful words from text.
    """

    words = re.findall(
        r"\b[a-zA-Z][a-zA-Z0-9+#.-]{2,}\b",
        text.lower(),
    )

    keywords = []

    for word in words:
        if word not in STOP_WORDS and word not in keywords:
            keywords.append(word)

    return keywords


def calculate_keyword_match(
    question: str,
    answer: str,
) -> float:
    """
    Calculate how much of the question's
    meaningful vocabulary appears in the answer.
    """

    question_keywords = set(
        extract_keywords(question)
    )

    answer_keywords = set(
        extract_keywords(answer)
    )

    if not question_keywords:
        return 0.0

    matched = question_keywords.intersection(
        answer_keywords
    )

    return len(matched) / len(question_keywords)


def calculate_answer_score(
    question: str,
    answer: str,
) -> int:
    """
    Basic deterministic answer scoring.

    This is NOT an LLM evaluation.
    """

    if not answer or not answer.strip():
        return 0

    answer = answer.strip()

    score = 0

    # Length component
    word_count = len(answer.split())

    if word_count >= 80:
        score += 30
    elif word_count >= 50:
        score += 25
    elif word_count >= 25:
        score += 20
    elif word_count >= 10:
        score += 12
    else:
        score += 5

    # Keyword component
    keyword_match = calculate_keyword_match(
        question,
        answer,
    )

    score += int(keyword_match * 40)

    # Structure component
    structure_words = [
        "because",
        "example",
        "experience",
        "project",
        "approach",
        "result",
        "used",
        "implemented",
        "solved",
    ]

    lower_answer = answer.lower()

    structure_matches = sum(
        1
        for word in structure_words
        if word in lower_answer
    )

    score += min(
        structure_matches * 5,
        20,
    )

    return min(score, 100)


def generate_feedback(
    question: str,
    answer: str,
    score: int,
) -> str:

    if not answer.strip():
        return "No answer was provided."

    feedback = []

    word_count = len(answer.split())

    if score >= 80:
        feedback.append(
            "Strong answer with good relevance and detail."
        )
    elif score >= 60:
        feedback.append(
            "Good answer, but it could be more specific."
        )
    elif score >= 40:
        feedback.append(
            "The answer is partially relevant but needs more detail."
        )
    else:
        feedback.append(
            "The answer needs significant improvement."
        )

    if word_count < 20:
        feedback.append(
            "Try to provide a more detailed explanation."
        )

    keyword_match = calculate_keyword_match(
        question,
        answer,
    )

    if keyword_match < 0.3:
        feedback.append(
            "Include more terminology directly related to the question."
        )

    if not any(
        word in answer.lower()
        for word in ["example", "project", "experience"]
    ):
        feedback.append(
            "Use a practical example or project experience where appropriate."
        )

    return " ".join(feedback)


def evaluate_answer(
    question: str,
    answer: str,
) -> dict:

    score = calculate_answer_score(
        question,
        answer,
    )

    feedback = generate_feedback(
        question,
        answer,
        score,
    )

    return {
        "score": score,
        "feedback": feedback,
    }