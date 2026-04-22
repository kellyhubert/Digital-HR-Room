from fastapi import APIRouter, HTTPException
from models.interview_models import (
    QuestionGenRequest,
    QuestionGenResponse,
    EvaluationRequest,
    EvaluationResponse,
)
from services.interview_gemini_client import run_question_generation, run_evaluation

router = APIRouter()


@router.post("/generate-questions", response_model=QuestionGenResponse)
async def generate_questions(req: QuestionGenRequest):
    if req.questionCount < 1 or req.questionCount > 20:
        raise HTTPException(status_code=400, detail="questionCount must be between 1 and 20")
    try:
        return run_question_generation(req)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        msg = str(e)
        if "429" in msg or "RESOURCE_EXHAUSTED" in msg:
            raise HTTPException(status_code=429, detail=f"Gemini quota exceeded: {msg}")
        if "404" in msg or "NOT_FOUND" in msg:
            raise HTTPException(status_code=502, detail=f"Gemini model not found: {msg}")
        raise HTTPException(status_code=500, detail=f"Question generation failed: {msg}")


@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_answers(req: EvaluationRequest):
    if not req.answers:
        raise HTTPException(status_code=400, detail="No answers provided")
    if not req.questions:
        raise HTTPException(status_code=400, detail="No questions provided")
    try:
        return run_evaluation(req)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        msg = str(e)
        if "429" in msg or "RESOURCE_EXHAUSTED" in msg:
            raise HTTPException(status_code=429, detail=f"Gemini quota exceeded: {msg}")
        if "404" in msg or "NOT_FOUND" in msg:
            raise HTTPException(status_code=502, detail=f"Gemini model not found: {msg}")
        raise HTTPException(status_code=500, detail=f"Answer evaluation failed: {msg}")
