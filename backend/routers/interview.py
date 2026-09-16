from typing import Any

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from database.database import get_db

from models.user import User
from models.resume import Resume
from models.interview import Interview
from models.interview_session_question import (
    InterviewSessionQuestion,
)

from schemas.interview import (
    InterviewCreate,
    InterviewResponse,
    InterviewQuestionResponse,
    InterviewAnswerRequest,
)

from schemas.ai_interview import (
    AIQuestionRequest,
    AIFollowUpRequest,
    AIEvaluateRequest,
)

from services.resume_interview_engine import (
    generate_resume_questions,
)

from services.jd_interview_engine import (
    generate_jd_questions,
)

from services.ai_question_generator import (
    generate_ai_question,
)

from services.ai_answer_evaluator import (
    evaluate_ai_answer,
)

from services.interview_evaluation_engine import (
    evaluate_answer,
)

from utils.dependencies import (
    get_current_user,
)


router = APIRouter(
    prefix="/interviews",
    tags=["Interviews"],
)


# ============================================================
# GENERAL INTERVIEW QUESTION BANK
# ============================================================

GENERAL_INTERVIEW_QUESTIONS = [

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
        "question": "Explain precision, recall, and F1-score.",
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

    {
        "question": "How would you deploy a machine learning model as a production API?",
        "category": "Deployment",
        "topic": "Model Deployment",
        "question_type": "system_design",
    },

    {
        "question": "What steps would you follow before training a machine learning model?",
        "category": "Data Science",
        "topic": "ML Pipeline",
        "question_type": "technical",
    },
]


# ============================================================
# HELPERS
# ============================================================

def safe_difficulty(
    value: str | None,
) -> str:

    value = (
        value or "medium"
    ).strip().lower()

    if value not in {
        "easy",
        "medium",
        "hard",
    }:
        return "medium"

    return value


def safe_limit(
    value: Any,
    default: int = 10,
) -> int:

    try:
        value = int(value)
    except (
        TypeError,
        ValueError,
    ):
        value = default

    return max(
        1,
        min(value, 50),
    )


def unique_questions(
    questions: list[dict],
) -> list[dict]:

    result = []

    seen = set()

    for item in questions:

        question = str(
            item.get(
                "question",
                "",
            )
        ).strip()

        if not question:
            continue

        key = question.lower()

        if key in seen:
            continue

        seen.add(key)

        result.append(item)

    return result


def get_resume_text(
    interview: Interview,
    current_user: User,
    db: Session,
) -> str:

    if not interview.resume_id:
        return ""

    resume = (
        db.query(Resume)
        .filter(
            Resume.id == interview.resume_id,
            Resume.user_id == current_user.id,
        )
        .first()
    )

    if not resume:

        raise HTTPException(
            status_code=404,
            detail="Selected resume was not found.",
        )

    return (
        resume.extracted_text or ""
    ).strip()


def get_job_description(
    interview: Interview,
) -> str:

    # Supports job_description if the model
    # gets this field in a future migration.
    value = getattr(
        interview,
        "job_description",
        "",
    )

    return str(
        value or ""
    ).strip()


def build_general_questions(
    job_title: str,
    difficulty: str,
    limit: int,
) -> list[dict]:

    questions = []

    # Role question first.
    if job_title.strip():

        questions.append(
            {
                "question": (
                    f"What would be your approach "
                    f"to solving the main technical "
                    f"problems associated with a "
                    f"{job_title.strip()} role?"
                ),
                "category": "Role",
                "topic": job_title.strip(),
                "difficulty": difficulty,
                "question_type": "scenario",
            }
        )

    for item in GENERAL_INTERVIEW_QUESTIONS:

        questions.append(
            {
                **item,
                "difficulty": difficulty,
            }
        )

    return unique_questions(
        questions
    )[:limit]


def save_questions(
    interview: Interview,
    questions: list[dict],
    db: Session,
):

    questions = unique_questions(
        questions
    )

    if not questions:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unable to generate interview questions."
            ),
        )

    saved_questions = []

    for index, item in enumerate(
        questions,
        start=1,
    ):

        question = InterviewSessionQuestion(

            interview_id=interview.id,

            question=str(
                item["question"]
            ).strip(),

            category=item.get(
                "category"
            ),

            topic=item.get(
                "topic"
            ),

            difficulty=item.get(
                "difficulty",
                interview.difficulty,
            ),

            question_type=item.get(
                "question_type",
                interview.interview_type,
            ),

            expected_answer=item.get(
                "expected_answer",
                item.get("answer"),
            ),

            candidate_answer=None,

            score=None,

            feedback=None,

            answer_duration_seconds=0,

            answer_source="text",

            question_order=index,

            status="pending",
        )

        db.add(question)

        saved_questions.append(
            question
        )

    interview.total_questions = (
        len(saved_questions)
    )

    interview.completed_questions = 0

    interview.overall_score = 0

    interview.status = "in_progress"

    db.commit()

    for question in saved_questions:

        db.refresh(question)

    return saved_questions


# ============================================================
# 1. CREATE INTERVIEW
# ============================================================

@router.post(
    "/",
    response_model=InterviewResponse,
)
def create_interview(

    data: InterviewCreate,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    # --------------------------------------------------------
    # Resume is optional.
    # --------------------------------------------------------

    if data.resume_id is not None:

        resume = (
            db.query(Resume)
            .filter(
                Resume.id == data.resume_id,
                Resume.user_id == current_user.id,
            )
            .first()
        )

        if not resume:

            raise HTTPException(
                status_code=404,
                detail="Resume not found.",
            )

        if not (
            resume.extracted_text or ""
        ).strip():

            raise HTTPException(
                status_code=400,
                detail="Resume text is not available.",
            )

    total_questions = safe_limit(
        getattr(
            data,
            "total_questions",
            10,
        ),
        10,
    )

    interview = Interview(

        user_id=current_user.id,

        resume_id=data.resume_id,

        job_title=data.job_title,

        company_name=data.company_name,

        interview_type=data.interview_type,

        difficulty=safe_difficulty(
            data.difficulty
        ),

        total_questions=total_questions,

        completed_questions=0,

        overall_score=0,

        status="created",
    )

    db.add(interview)

    db.commit()

    db.refresh(interview)

    return interview


# ============================================================
# 2. LIST INTERVIEWS
# ============================================================

@router.get(
    "/",
    response_model=list[InterviewResponse],
)
def get_interviews(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    return (
        db.query(Interview)
        .filter(
            Interview.user_id
            == current_user.id
        )
        .order_by(
            Interview.created_at.desc()
        )
        .all()
    )


# ============================================================
# 3. GENERATE QUESTIONS
# ============================================================

@router.post(
    "/{interview_id}/generate-questions",
    response_model=list[
        InterviewQuestionResponse
    ],
)
def generate_questions_for_interview(

    interview_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    # --------------------------------------------------------
    # Get interview
    # --------------------------------------------------------

    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.user_id
            == current_user.id,
        )
        .first()
    )

    if not interview:

        raise HTTPException(
            status_code=404,
            detail="Interview not found.",
        )

    # --------------------------------------------------------
    # Do not regenerate existing questions.
    # --------------------------------------------------------

    existing_questions = (
        db.query(
            InterviewSessionQuestion
        )
        .filter(
            InterviewSessionQuestion.interview_id
            == interview_id
        )
        .order_by(
            InterviewSessionQuestion.question_order.asc()
        )
        .all()
    )

    if existing_questions:
        return existing_questions

    difficulty = safe_difficulty(
        interview.difficulty
    )

    limit = safe_limit(
        interview.total_questions,
        10,
    )

    # --------------------------------------------------------
    # Get resume
    # --------------------------------------------------------

    resume_text = get_resume_text(
        interview,
        current_user,
        db,
    )

    # --------------------------------------------------------
    # Get JD if available
    # --------------------------------------------------------

    job_description = (
        get_job_description(
            interview
        )
    )

    generated_questions = []

    # ========================================================
    # PRIORITY 1
    # JOB DESCRIPTION
    # ========================================================

    if job_description:

        generated_questions = (
            generate_jd_questions(
                job_description=job_description,
                job_title=interview.job_title or "",
                difficulty=difficulty,
                limit=limit,
            )
        )

    # ========================================================
    # PRIORITY 2
    # RESUME
    # ========================================================

    if (
        len(generated_questions)
        < limit
        and resume_text
    ):

        resume_questions = (
            generate_resume_questions(
                resume_text=resume_text,
                job_title=interview.job_title or "",
                difficulty=difficulty,
                limit=limit,
            )
        )

        generated_questions = (
            unique_questions(
                generated_questions
                + resume_questions
            )
        )

    # ========================================================
    # PRIORITY 3
    # GENERAL ROLE QUESTIONS
    # ========================================================

    if (
        len(generated_questions)
        < limit
    ):

        general_questions = (
            build_general_questions(
                job_title=interview.job_title or "",
                difficulty=difficulty,
                limit=limit,
            )
        )

        generated_questions = (
            unique_questions(
                generated_questions
                + general_questions
            )
        )

    generated_questions = (
        generated_questions[:limit]
    )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    return save_questions(
        interview=interview,
        questions=generated_questions,
        db=db,
    )


# ============================================================
# 4. GET QUESTIONS
# ============================================================

@router.get(
    "/{interview_id}/questions",
    response_model=list[
        InterviewQuestionResponse
    ],
)
def get_interview_questions(

    interview_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.user_id
            == current_user.id,
        )
        .first()
    )

    if not interview:

        raise HTTPException(
            status_code=404,
            detail="Interview not found.",
        )

    return (
        db.query(
            InterviewSessionQuestion
        )
        .filter(
            InterviewSessionQuestion.interview_id
            == interview_id
        )
        .order_by(
            InterviewSessionQuestion.question_order.asc()
        )
        .all()
    )


# ============================================================
# 5. SUBMIT ANSWER
# ============================================================

@router.post(
    "/{interview_id}/questions/{question_id}/answer",
    response_model=InterviewQuestionResponse,
)
def submit_answer(

    interview_id: int,

    question_id: int,

    data: InterviewAnswerRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.user_id
            == current_user.id,
        )
        .first()
    )

    if not interview:

        raise HTTPException(
            status_code=404,
            detail="Interview not found.",
        )

    question = (
        db.query(
            InterviewSessionQuestion
        )
        .filter(
            InterviewSessionQuestion.id
            == question_id,

            InterviewSessionQuestion.interview_id
            == interview_id,
        )
        .first()
    )

    if not question:

        raise HTTPException(
            status_code=404,
            detail="Interview question not found.",
        )

    if question.status == "answered":

        raise HTTPException(
            status_code=400,
            detail="This question has already been answered.",
        )

    candidate_answer = (
        data.candidate_answer or ""
    ).strip()

    if not candidate_answer:

        raise HTTPException(
            status_code=422,
            detail="Answer cannot be empty.",
        )

    # --------------------------------------------------------
    # Evaluate
    # --------------------------------------------------------

    try:

        evaluation = evaluate_answer(
            question=question.question,
            answer=candidate_answer,
        )

    except Exception:

        evaluation = {
            "score": 0,
            "feedback": (
                "Unable to evaluate this answer. "
                "Please provide a more detailed answer."
            ),
        }

    score = int(
        evaluation.get(
            "score",
            0,
        )
    )

    score = max(
        0,
        min(score, 100),
    )

    # --------------------------------------------------------
    # Save answer
    # --------------------------------------------------------

    question.candidate_answer = (
        candidate_answer
    )

    question.score = score

    question.feedback = str(
        evaluation.get(
            "feedback",
            "No feedback available.",
        )
    )

    answer_source = getattr(
        data,
        "answer_source",
        "text",
    )

    if answer_source not in {
        "text",
        "voice",
    }:

        answer_source = "text"

    question.answer_source = (
        answer_source
    )

    duration = getattr(
        data,
        "answer_duration_seconds",
        0,
    )

    try:

        duration = max(
            0,
            int(duration),
        )

    except (
        TypeError,
        ValueError,
    ):

        duration = 0

    question.answer_duration_seconds = (
        duration
    )

    question.status = "answered"

    # --------------------------------------------------------
    # Recalculate interview
    # --------------------------------------------------------

    answered_questions = (
        db.query(
            InterviewSessionQuestion
        )
        .filter(
            InterviewSessionQuestion.interview_id
            == interview_id,

            InterviewSessionQuestion.status
            == "answered",
        )
        .all()
    )

    scores = [
        q.score
        for q in answered_questions
        if q.score is not None
    ]

    interview.completed_questions = (
        len(answered_questions)
    )

    interview.overall_score = (
        round(
            sum(scores)
            / len(scores)
        )
        if scores
        else 0
    )

    if (
        interview.total_questions > 0
        and interview.completed_questions
        >= interview.total_questions
    ):

        interview.status = "completed"

    else:

        interview.status = "in_progress"

    db.commit()

    db.refresh(question)

    return question


# ============================================================
# 6. ANALYTICS
# ============================================================

@router.get(
    "/{interview_id}/analytics"
)
def get_interview_analytics(

    interview_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.user_id
            == current_user.id,
        )
        .first()
    )

    if not interview:

        raise HTTPException(
            status_code=404,
            detail="Interview not found.",
        )

    questions = (
        db.query(
            InterviewSessionQuestion
        )
        .filter(
            InterviewSessionQuestion.interview_id
            == interview_id
        )
        .order_by(
            InterviewSessionQuestion.question_order.asc()
        )
        .all()
    )

    answered_questions = [
        q
        for q in questions
        if q.status == "answered"
    ]

    scores = [
        q.score
        for q in answered_questions
        if q.score is not None
    ]

    total_questions = len(
        questions
    )

    completed_questions = len(
        answered_questions
    )

    average_score = (
        round(
            sum(scores)
            / len(scores)
        )
        if scores
        else 0
    )

    strong_answers = [
        q
        for q in answered_questions
        if q.score is not None
        and q.score >= 75
    ]

    weak_answers = [
        q
        for q in answered_questions
        if q.score is not None
        and q.score < 50
    ]

    # --------------------------------------------------------
    # Voice / text
    # --------------------------------------------------------

    voice_answers = [
        q
        for q in answered_questions
        if getattr(
            q,
            "answer_source",
            "text",
        ) == "voice"
    ]

    text_answers = [
        q
        for q in answered_questions
        if getattr(
            q,
            "answer_source",
            "text",
        ) != "voice"
    ]

    voice_durations = [
        int(
            getattr(
                q,
                "answer_duration_seconds",
                0,
            )
            or 0
        )
        for q in voice_answers
    ]

    total_voice_duration = sum(
        voice_durations
    )

    average_voice_duration = (
        round(
            total_voice_duration
            / len(voice_durations)
        )
        if voice_durations
        else 0
    )

    # --------------------------------------------------------
    # Category performance
    # --------------------------------------------------------

    category_data = {}

    for question in answered_questions:

        if question.score is None:
            continue

        category = (
            question.category
            or "General"
        )

        category_data.setdefault(
            category,
            [],
        ).append(
            question.score
        )

    category_performance = [
        {
            "category": category,
            "score": round(
                sum(values)
                / len(values)
            ),
            "questions": len(values),
        }
        for category, values
        in category_data.items()
    ]

    # --------------------------------------------------------
    # Topic performance
    # --------------------------------------------------------

    topic_data = {}

    for question in answered_questions:

        if question.score is None:
            continue

        topic = (
            question.topic
            or "General"
        )

        topic_data.setdefault(
            topic,
            [],
        ).append(
            question.score
        )

    topic_performance = [
        {
            "topic": topic,
            "score": round(
                sum(values)
                / len(values)
            ),
            "questions": len(values),
        }
        for topic, values
        in topic_data.items()
    ]

    # --------------------------------------------------------
    # Recommendations
    # --------------------------------------------------------

    recommendations = []

    if not scores:

        recommendations.extend(
            [
                "Complete the interview to receive performance recommendations.",
                "Use clear explanations and practical examples.",
            ]
        )

    elif average_score < 50:

        recommendations.extend(
            [
                "Strengthen your core technical concepts.",
                "Practice answering questions with more detail.",
                "Use real project examples in your answers.",
            ]
        )

    elif average_score < 75:

        recommendations.extend(
            [
                "Improve the depth of your answers.",
                "Explain your technical decisions clearly.",
                "Add measurable results from your projects.",
            ]
        )

    else:

        recommendations.extend(
            [
                "Your overall performance is strong.",
                "Practice advanced scenario-based questions.",
                "Focus on consistency across topics.",
            ]
        )

    if weak_answers:

        recommendations.append(
            "Review questions where your score was below 50."
        )

    if voice_answers:

        if average_voice_duration < 30:

            recommendations.append(
                "Try giving slightly longer spoken answers with more explanation."
            )

        elif average_voice_duration > 120:

            recommendations.append(
                "Try to keep spoken answers more concise."
            )

    return {

        "interview_id": interview.id,

        "job_title": interview.job_title,

        "company_name": interview.company_name,

        "interview_type": interview.interview_type,

        "difficulty": interview.difficulty,

        "total_questions": total_questions,

        "completed_questions": completed_questions,

        "completion_percentage": (
            round(
                completed_questions
                / total_questions
                * 100
            )
            if total_questions
            else 0
        ),

        "average_score": average_score,

        "strong_answers": len(
            strong_answers
        ),

        "weak_answers": len(
            weak_answers
        ),

        "voice_answers": len(
            voice_answers
        ),

        "text_answers": len(
            text_answers
        ),

        "total_voice_duration_seconds":
            total_voice_duration,

        "average_voice_duration_seconds":
            average_voice_duration,

        "category_performance":
            category_performance,

        "topic_performance":
            topic_performance,

        "recommendations":
            recommendations,
    }


# ============================================================
# 7. RESULT
# ============================================================

@router.get(
    "/{interview_id}/result"
)
def get_interview_result(

    interview_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.user_id
            == current_user.id,
        )
        .first()
    )

    if not interview:

        raise HTTPException(
            status_code=404,
            detail="Interview not found.",
        )

    questions = (
        db.query(
            InterviewSessionQuestion
        )
        .filter(
            InterviewSessionQuestion.interview_id
            == interview_id
        )
        .order_by(
            InterviewSessionQuestion.question_order.asc()
        )
        .all()
    )

    total_questions = len(
        questions
    )

    answered_questions = [
        q
        for q in questions
        if q.status == "answered"
    ]

    completed_questions = len(
        answered_questions
    )

    scores = [
        q.score
        for q in answered_questions
        if q.score is not None
    ]

    average_score = (
        round(
            sum(scores)
            / len(scores)
        )
        if scores
        else 0
    )

    strong_questions = [
        q
        for q in answered_questions
        if q.score is not None
        and q.score >= 75
    ]

    weak_questions = [
        q
        for q in answered_questions
        if q.score is not None
        and q.score < 50
    ]

    category_scores = {}

    for question in answered_questions:

        if question.score is None:
            continue

        category = (
            question.category
            or "General"
        )

        category_scores.setdefault(
            category,
            [],
        ).append(
            question.score
        )

    category_performance = [
        {
            "category": category,
            "score": round(
                sum(values)
                / len(values)
            ),
            "questions": len(values),
        }
        for category, values
        in category_scores.items()
    ]

    recommendations = []

    if not scores:

        recommendations.extend(
            [
                "Complete the interview to receive a final performance score.",
                "Give clear answers with technical reasoning and examples.",
            ]
        )

    elif average_score < 50:

        recommendations.extend(
            [
                "Focus on understanding core technical concepts.",
                "Practice answering questions with clear explanations.",
            ]
        )

    elif average_score < 75:

        recommendations.extend(
            [
                "Improve answer depth and provide practical examples.",
                "Practice explaining your projects and technical decisions.",
            ]
        )

    else:

        recommendations.extend(
            [
                "Maintain your current preparation level.",
                "Practice advanced and scenario-based questions.",
            ]
        )

    if weak_questions:

        recommendations.append(
            "Review topics from questions where your score was below 50."
        )

    interview.completed_questions = (
        completed_questions
    )

    interview.overall_score = (
        average_score
    )

    if (
        total_questions > 0
        and completed_questions
        == total_questions
    ):

        interview.status = "completed"

    db.commit()

    db.refresh(interview)

    return {

        "interview_id": interview.id,

        "job_title": interview.job_title,

        "company_name": interview.company_name,

        "interview_type":
            interview.interview_type,

        "difficulty":
            interview.difficulty,

        "total_questions":
            total_questions,

        "completed_questions":
            completed_questions,

        "overall_score":
            average_score,

        "status":
            interview.status,

        "strong_questions":
            len(strong_questions),

        "weak_questions":
            len(weak_questions),

        "category_performance":
            category_performance,

        "recommendations":
            recommendations,

        "questions": [

            {
                "id": q.id,

                "question": q.question,

                "category": q.category,

                "topic": q.topic,

                "score": q.score,

                "status": q.status,

                "feedback": q.feedback,

                "question_order":
                    q.question_order,
            }

            for q in questions
        ],
    }


# ============================================================
# 8. AI QUESTION
# ============================================================

@router.post(
    "/{interview_id}/ai-question"
)
def generate_interview_ai_question(

    interview_id: int,

    request: AIQuestionRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.user_id
            == current_user.id,
        )
        .first()
    )

    if not interview:

        raise HTTPException(
            status_code=404,
            detail="Interview not found.",
        )

    resume_text = get_resume_text(
        interview,
        current_user,
        db,
    )

    return generate_ai_question(
        resume_text=resume_text,
        difficulty=safe_difficulty(
            interview.difficulty
        ),
    )


# ============================================================
# 9. AI FOLLOW-UP
# ============================================================

@router.post(
    "/{interview_id}/ai-follow-up"
)
def generate_ai_follow_up(

    interview_id: int,

    request: AIFollowUpRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.user_id
            == current_user.id,
        )
        .first()
    )

    if not interview:

        raise HTTPException(
            status_code=404,
            detail="Interview not found.",
        )

    resume_text = get_resume_text(
        interview,
        current_user,
        db,
    )

    return generate_ai_question(

        resume_text=resume_text,

        candidate_answer=
            request.candidate_answer,

        difficulty=safe_difficulty(
            interview.difficulty
        ),
    )


# ============================================================
# 10. AI EVALUATION
# ============================================================

@router.post(
    "/{interview_id}/ai-evaluate"
)
def evaluate_ai_interview_answer(

    interview_id: int,

    request: AIEvaluateRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.user_id
            == current_user.id,
        )
        .first()
    )

    if not interview:

        raise HTTPException(
            status_code=404,
            detail="Interview not found.",
        )

    return evaluate_ai_answer(

        question=request.question,

        candidate_answer=
            request.candidate_answer,

        expected_answer=
            request.expected_answer or "",
    )


# ============================================================
# 11. GET SINGLE INTERVIEW
# IMPORTANT: THIS MUST STAY LAST
# ============================================================

@router.get(
    "/{interview_id}",
    response_model=InterviewResponse,
)
def get_interview(

    interview_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    interview = (
        db.query(Interview)
        .filter(
            Interview.id == interview_id,
            Interview.user_id
            == current_user.id,
        )
        .first()
    )

    if not interview:

        raise HTTPException(
            status_code=404,
            detail="Interview not found.",
        )

    return interview