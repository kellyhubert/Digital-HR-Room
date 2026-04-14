from pydantic import BaseModel
from typing import List, Optional


class JobContextBasic(BaseModel):
    title: str
    description: str
    requiredSkills: List[str]
    preferredSkills: List[str]
    minExperienceYears: int


class QuestionGenRequest(BaseModel):
    job: JobContextBasic
    questionCount: int = 5


class GeneratedQuestion(BaseModel):
    questionId: str
    text: str
    category: str  # "technical" | "behavioural" | "situational"


class QuestionGenResponse(BaseModel):
    questions: List[GeneratedQuestion]
    geminiModel: str
    promptTokensUsed: int
    responseTokensUsed: int


class AnswerEntry(BaseModel):
    questionId: str
    answerText: str


class CandidateAnswerContext(BaseModel):
    name: str
    skills: List[str]
    totalExperienceYears: float
    summary: Optional[str] = None


class EvaluationRequest(BaseModel):
    job: JobContextBasic
    candidate: CandidateAnswerContext
    questions: List[GeneratedQuestion]
    answers: List[AnswerEntry]


class InterviewScoreBreakdown(BaseModel):
    communication: float
    technicalDepth: float
    problemSolving: float
    cultureFit: float


class EvaluationResponse(BaseModel):
    interviewScore: float
    scoreBreakdown: InterviewScoreBreakdown
    recommendation: str
    geminiReasoning: str
    geminiModel: str
    promptTokensUsed: int
    responseTokensUsed: int
