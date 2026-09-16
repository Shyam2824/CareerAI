from services.interview_evaluation_engine import (
    evaluate_answer,
)


def test_empty_answer():

    result = evaluate_answer(
        question="What is Python?",
        answer="",
    )

    assert result["score"] == 0


def test_good_answer():

    result = evaluate_answer(
        question="What is Python?",
        answer=(
            "Python is a high-level programming language. "
            "I have used Python in data science projects "
            "with Pandas and Scikit-learn to build machine "
            "learning models."
        ),
    )

    assert result["score"] > 0
    assert result["feedback"]


def test_answer_score_range():

    result = evaluate_answer(
        question="What is machine learning?",
        answer=(
            "Machine learning allows systems to learn "
            "patterns from data and make predictions."
        ),
    )

    assert 0 <= result["score"] <= 100