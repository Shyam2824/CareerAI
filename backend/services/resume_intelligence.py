import re
from typing import List, Optional


TECHNICAL_SKILLS = [
    "python",
    "java",
    "javascript",
    "typescript",
    "react",
    "next.js",
    "node.js",
    "express",
    "django",
    "fastapi",
    "spring boot",
    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "terraform",
    "jenkins",
    "ansible",
    "git",
    "github",
    "gitlab",
    "machine learning",
    "deep learning",
    "tensorflow",
    "keras",
    "pytorch",
    "scikit-learn",
    "pandas",
    "numpy",
    "opencv",
    "yolo",
    "nlp",
    "bert",
]


def detect_skills(text: str) -> List[str]:
    if not text:
        return []

    text_lower = text.lower()

    detected = []

    for skill in TECHNICAL_SKILLS:
        pattern = r"(?<!\w)" + re.escape(skill.lower()) + r"(?!\w)"

        if re.search(pattern, text_lower):
            detected.append(skill)

    return sorted(set(detected))


def detect_experience(text: str) -> Optional[float]:
    if not text:
        return None

    patterns = [
        r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?experience",
        r"experience\s*[:\-]?\s*(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text.lower())

        if match:
            try:
                return float(match.group(1))
            except ValueError:
                return None

    return None


def detect_education(text: str) -> Optional[str]:
    if not text:
        return None

    education_keywords = [
        "b.tech",
        "btech",
        "b.e.",
        "be ",
        "bachelor of technology",
        "bachelor of engineering",
        "m.tech",
        "mtech",
        "master of technology",
        "master of engineering",
        "mca",
        "bca",
        "b.sc",
        "bsc",
        "m.sc",
        "msc",
        "mba",
        "phd",
    ]

    lines = text.splitlines()

    for line in lines:
        line_clean = line.strip()

        if not line_clean:
            continue

        line_lower = line_clean.lower()

        for keyword in education_keywords:
            if keyword in line_lower:
                return line_clean[:255]

    return None