from database.database import Base, engine

# Import every model so SQLAlchemy knows about all tables.
from models.user import User
from models.resume import Resume
from models.career_profile import CareerProfile
from models.skill_gap import SkillGapAnalysis
from models.career_path import CareerPathRecommendation
from models.learning_roadmap import LearningRoadmap
from models.career_chat import CareerChatMessage
from models.career_score import CareerScore
from models.career_report import CareerReport


def init_db() -> None:
    """
    Create all missing database tables.

    Existing tables are not deleted or modified.
    """
    Base.metadata.create_all(bind=engine)