from pydantic import BaseModel
from typing import List


class ScoreBreakdown(BaseModel):
    skills: float
    experience: float
    education: float
    relevance: float


class CandidateScreenResult(BaseModel):
    applicantId: str
    rank: int
    overallScore: float
    scoreBreakdown: ScoreBreakdown
    strengths: List[str]
    gaps: List[str]
    recommendation: str
    geminiReasoning: str


class ScreeningResponse(BaseModel):
    shortlisted: List[CandidateScreenResult]
    totalEvaluated: int
    geminiModel: str
    promptTokensUsed: int
    responseTokensUsed: int
