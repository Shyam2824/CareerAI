from services.resume_interview_engine import (
    generate_resume_questions,
)

from services.jd_interview_engine import (
    generate_jd_questions,
)


def generate_session_questions(
    resume_text: str = "",
    job_description: str = "",
    job_title: str = "",
    difficulty: str = "medium",
    limit: int = 10,
):
    questions = []

    # ========================================================
    # RESUME QUESTIONS
    # ========================================================

    if resume_text:

        resume_questions = generate_resume_questions(
            resume_text=resume_text,
            difficulty=difficulty,
            limit=limit,
        )

        questions.extend(
            resume_questions
        )

    # ========================================================
    # JOB DESCRIPTION QUESTIONS
    # ========================================================

    if job_description:

        remaining = max(
            limit - len(questions),
            0,
        )

        if remaining > 0:

            jd_questions = generate_jd_questions(
                job_description=job_description,
                job_title=job_title,
                difficulty=difficulty,
                limit=remaining,
            )

            questions.extend(
                jd_questions
            )

    # ========================================================
    # REMOVE DUPLICATES
    # ========================================================

    unique_questions = []
    seen = set()

    for item in questions:

        question_text = (
            item["question"]
            .strip()
            .lower()
        )

        if question_text not in seen:

            seen.add(question_text)

            unique_questions.append(
                item
            )

    return unique_questions[:limit]