from pydantic import BaseModel
from typing import List, Optional


class WeightsModel(BaseModel):
    skills: float
    experience: float
    education: float
    relevance: float


class ExperienceEntry(BaseModel):
    title: str
    company: str
    durationMonths: int
    description: Optional[str] = ""


class EducationEntry(BaseModel):
    degree: str
    field: str
    institution: str
    graduationYear: int


class CandidateInput(BaseModel):
    applicantId: str
    name: str
    skills: List[str]
    totalExperienceYears: float
    experience: List[ExperienceEntry]
    education: List[EducationEntry]
    location: str
    availability: str
    portfolio: Optional[str] = None
    summary: Optional[str] = None


class JobContext(BaseModel):
    title: str
    description: str
    requiredSkills: List[str]
    preferredSkills: List[str]
    minExperienceYears: int
    educationRequirement: str
    location: str
    weights: WeightsModel


class ScreeningRequest(BaseModel):
    job: JobContext
    candidates: List[CandidateInput]
    topN: int = 10
