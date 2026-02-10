from pydantic import BaseModel
from typing import List, Optional

class UserLevel(BaseModel):
    level: str # Low, Medium, High

class VideoAnalysis(BaseModel):
    video_id: str
    lqs_score: float
    concept_flow: List[str]
    clarity_rating: float
    noise_level: str

class LearningPack(BaseModel):
    video_id: str
    checklist: List[str]
    concepts: List[str]
    questions: List[dict]
    analogy: str

# This would map to SQLAlchemy or Tortoise models for PostgreSQL
# For now, we use Pydantic for API contracts and in-memory mocks
