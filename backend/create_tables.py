from database.database import Base, engine

# Import all models
import models

print("Creating CareerAI database tables...")

Base.metadata.create_all(bind=engine)

print("All tables created successfully!")