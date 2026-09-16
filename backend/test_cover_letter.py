from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


# ============================================================
# BASIC API TEST
# ============================================================

def test_auth_test():
    response = client.get("/auth/test")

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == (
        "Authentication router is working"
    )


# ============================================================
# COVER LETTER ROUTE EXISTS
# ============================================================

def test_cover_letter_history_requires_auth():
    response = client.get(
        "/cover-letter/history"
    )

    assert response.status_code in [401, 403]


# ============================================================
# COVER LETTER GENERATE REQUIRES AUTH
# ============================================================

def test_cover_letter_generate_requires_auth():

    response = client.post(
        "/cover-letter/generate",
        json={
            "resume_id": 1,
            "job_title": "Data Scientist",
            "company_name": "ABC Technologies",
            "job_description": (
                "Python SQL Machine Learning "
                "Pandas Scikit-learn"
            ),
            "tone": "professional",
        },
    )

    assert response.status_code in [401, 403]


# ============================================================
# COVER LETTER ANALYZE REQUIRES AUTH
# ============================================================

def test_cover_letter_analyze_requires_auth():

    response = client.post(
        "/cover-letter/analyze",
        json={
            "resume_id": 1,
            "job_title": "Data Scientist",
            "company_name": "ABC Technologies",
            "job_description": (
                "Python SQL Machine Learning"
            ),
            "tone": "professional",
        },
    )

    assert response.status_code in [401, 403]


# ============================================================
# SINGLE COVER LETTER REQUIRES AUTH
# ============================================================

def test_single_cover_letter_requires_auth():

    response = client.get(
        "/cover-letter/1"
    )

    assert response.status_code in [401, 403]


# ============================================================
# PDF REQUIRES AUTH
# ============================================================

def test_pdf_requires_auth():

    response = client.get(
        "/cover-letter/1/pdf"
    )

    assert response.status_code in [401, 403]


# ============================================================
# DOCX REQUIRES AUTH
# ============================================================

def test_docx_requires_auth():

    response = client.get(
        "/cover-letter/1/docx"
    )

    assert response.status_code in [401, 403]