import re


STOP_WORDS = {
    "the", "a", "an", "and", "or", "but",
    "is", "are", "was", "were", "to",
    "of", "in", "on", "for", "with",
    "this", "that", "it", "as", "by"
}


def extract_keywords(text: str) -> set[str]:
    words = re.findall(r"[a-zA-Z][a-zA-Z0-9+#.-]{2,}", text.lower())

    return {
        word
        for word in words
        if word not in STOP_WORDS
    }


def evaluate_ai_answer(
    question: str,
    candidate_answer: str,
    expected_answer: str = "",
) -> dict:

    if not candidate_answer.strip():
        return {
            "score": 0,
            "feedback": "No answer was provided.",
            "strengths": [],
            "improvements": [
                "Provide a complete answer.",
                "Include a practical example where possible.",
            ],
            "follow_up_question": None,
        }

    answer_words = candidate_answer.split()

    # 1. Answer length
    length_score = min(len(answer_words) * 2, 25)

    # 2. Keyword relevance
    question_keywords = extract_keywords(question)
    answer_keywords = extract_keywords(candidate_answer)

    if question_keywords:
        matched = question_keywords.intersection(answer_keywords)
        relevance_score = min(
            int((len(matched) / len(question_keywords)) * 40),
            40,
        )
    else:
        relevance_score = 20

    # 3. Structure
    structure_terms = [
        "because",
        "therefore",
        "approach",
        "example",
        "result",
        "used",
        "implemented",
        "improved",
        "problem",
        "solution",
    ]

    structure_matches = sum(
        1
        for term in structure_terms
        if term in candidate_answer.lower()
    )

    structure_score = min(structure_matches * 4, 20)

    # 4. Practical example
    example_score = 15 if (
        "example" in candidate_answer.lower()
        or "project" in candidate_answer.lower()
    ) else 0

    score = min(
        length_score
        + relevance_score
        + structure_score
        + example_score,
        100,
    )

    strengths = []
    improvements = []

    if len(answer_words) >= 30:
        strengths.append("Answer provides reasonable detail.")
    else:
        improvements.append(
            "Give a more detailed explanation."
        )

    if relevance_score >= 25:
        strengths.append(
            "Answer is relevant to the question."
        )
    else:
        improvements.append(
            "Focus more directly on the question."
        )

    if structure_score >= 8:
        strengths.append(
            "Answer has a reasonably structured explanation."
        )
    else:
        improvements.append(
            "Use a clear problem → approach → result structure."
        )

    if example_score:
        strengths.append(
            "Answer includes practical context."
        )
    else:
        improvements.append(
            "Add a real project or practical example."
        )

    if score >= 75:
        feedback = (
            "Strong answer. Your response is relevant, "
            "detailed, and reasonably structured."
        )
    elif score >= 50:
        feedback = (
            "Good attempt, but the answer could be more "
            "detailed and supported with practical examples."
        )
    else:
        feedback = (
            "The answer needs improvement. Focus on the "
            "core concept and explain your reasoning clearly."
        )

    return {
        "score": score,
        "feedback": feedback,
        "strengths": strengths,
        "improvements": improvements,
        "follow_up_question": None,
    }