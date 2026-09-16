from typing import Dict, List


ROLE_SKILLS: Dict[str, List[str]] = {

    "ai engineer": [
        "python",
        "machine learning",
        "deep learning",
        "tensorflow",
        "pytorch",
        "sql",
        "nlp",
        "llms",
        "rag",
        "vector databases",
        "langchain",
        "docker",
        "git",
    ],

    "machine learning engineer": [
        "python",
        "machine learning",
        "deep learning",
        "scikit-learn",
        "tensorflow",
        "pytorch",
        "sql",
        "statistics",
        "mlops",
        "docker",
        "git",
    ],

    "data scientist": [
        "python",
        "pandas",
        "numpy",
        "scikit-learn",
        "sql",
        "statistics",
        "machine learning",
        "data visualization",
        "tensorflow",
        "deep learning",
    ],

    "devops engineer": [
        "linux",
        "git",
        "docker",
        "kubernetes",
        "aws",
        "terraform",
        "jenkins",
        "ci/cd",
        "ansible",
        "python",
        "monitoring",
    ],

    "software engineer": [
        "java",
        "python",
        "javascript",
        "sql",
        "git",
        "rest api",
        "data structures",
        "algorithms",
        "docker",
        "testing",
    ],
}


HIGH_PRIORITY = {
    "ai engineer": [
        "llms",
        "rag",
        "machine learning",
        "deep learning",
    ],

    "machine learning engineer": [
        "machine learning",
        "deep learning",
        "pytorch",
        "mlops",
    ],

    "data scientist": [
        "python",
        "machine learning",
        "statistics",
        "sql",
    ],

    "devops engineer": [
        "kubernetes",
        "aws",
        "terraform",
        "docker",
    ],

    "software engineer": [
        "data structures",
        "algorithms",
        "java",
        "sql",
    ],
}


def normalize_skill(skill: str) -> str:
    return skill.strip().lower()


def parse_skills(skills: str | None) -> List[str]:

    if not skills:
        return []

    return [
        normalize_skill(skill)
        for skill in skills.split(",")
        if skill.strip()
    ]


def get_required_skills(
    target_role: str,
) -> List[str]:

    role = target_role.strip().lower()

    if role in ROLE_SKILLS:
        return ROLE_SKILLS[role]

    return [
        "python",
        "sql",
        "git",
        "problem solving",
        "communication",
    ]


def calculate_skill_gap(
    target_role: str,
    user_skills: str | None,
):

    role = target_role.strip().lower()

    user_skill_list = set(
        parse_skills(user_skills)
    )

    required_skills = get_required_skills(
        target_role
    )

    available = []
    missing = []

    for skill in required_skills:

        if normalize_skill(skill) in user_skill_list:
            available.append(skill)
        else:
            missing.append(skill)

    if required_skills:
        readiness_score = round(
            (
                len(available)
                / len(required_skills)
            )
            * 100,
            2,
        )
    else:
        readiness_score = 0

    high_priority_list = HIGH_PRIORITY.get(
        role,
        [],
    )

    high_priority = [
        skill
        for skill in missing
        if skill in high_priority_list
    ]

    medium_priority = [
        skill
        for skill in missing
        if skill not in high_priority
    ]

    # First half of remaining skills = medium
    # Later we'll improve this with AI scoring.

    midpoint = len(medium_priority) // 2

    if midpoint == 0:
        low_priority = []
    else:
        low_priority = medium_priority[midpoint:]

    medium_priority = (
        medium_priority[:midpoint]
    )

    recommendations = generate_recommendations(
        high_priority,
        medium_priority,
        low_priority,
    )

    return {
        "user_skills": available,
        "required_skills": required_skills,
        "missing_skills": missing,
        "high_priority_skills": high_priority,
        "medium_priority_skills": medium_priority,
        "low_priority_skills": low_priority,
        "readiness_score": readiness_score,
        "recommendations": recommendations,
    }


def generate_recommendations(
    high_priority: List[str],
    medium_priority: List[str],
    low_priority: List[str],
) -> str:

    recommendations = []

    order = (
        high_priority
        + medium_priority
        + low_priority
    )

    for index, skill in enumerate(
        order[:8],
        start=1,
    ):
        recommendations.append(
            f"{index}. Learn and practice {skill}."
        )

    if not recommendations:
        return (
            "Your current skills cover the "
            "identified requirements. Continue "
            "building projects and practical "
            "experience."
        )

    return "\n".join(recommendations)