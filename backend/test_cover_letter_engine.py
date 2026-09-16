from services.cover_letter_engine import (
    extract_keywords,
    find_matched_skills,
    find_missing_skills,
    analyze_resume_against_job,
    generate_cover_letter,
)


def test_extract_keywords():

    text = """
    I have experience with Python, SQL,
    Pandas and Machine Learning.
    """

    keywords = extract_keywords(text)

    assert "python" in keywords
    assert "sql" in keywords
    assert "pandas" in keywords
    assert "machine learning" in keywords


def test_matched_skills():

    resume = """
    Python SQL Pandas Machine Learning
    """

    job = """
    Python SQL Machine Learning TensorFlow
    """

    matched = find_matched_skills(
        resume,
        job,
    )

    assert "python" in matched
    assert "sql" in matched
    assert "machine learning" in matched

    assert "tensorflow" not in matched


def test_missing_skills():

    resume = """
    Python SQL Pandas
    """

    job = """
    Python SQL TensorFlow AWS
    """

    missing = find_missing_skills(
        resume,
        job,
    )

    assert "tensorflow" in missing
    assert "aws" in missing

    assert "python" not in missing


def test_job_analysis():

    resume = """
    Python SQL Pandas Machine Learning
    """

    job = """
    Python SQL Machine Learning TensorFlow
    """

    result = analyze_resume_against_job(
        resume,
        job,
    )

    assert "matched_skills" in result
    assert "missing_skills" in result
    assert "match_percentage" in result

    assert "python" in result["matched_skills"]


def test_generate_cover_letter():

    resume = """
    I have experience developing applications
    using Python and SQL.
    """

    job = """
    We are looking for a Data Scientist
    with Python, SQL and Machine Learning.
    """

    result = generate_cover_letter(
        resume_text=resume,
        job_description=job,
        job_title="Data Scientist",
        company_name="ABC Technologies",
        tone="professional",
    )

    assert isinstance(result, str)

    assert len(result) > 100

    assert "Python" in result
    assert "SQL" in result

    # Missing skill must NOT be invented
    assert "TensorFlow" not in result