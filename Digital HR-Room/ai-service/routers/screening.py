from fastapi import APIRouter, HTTPException
from models.request_models import ScreeningRequest
from models.response_models import ScreeningResponse
from services.gemini_client import run_screening
from services.response_parser import parse_and_rank

router = APIRouter()


@router.post("/", response_model=ScreeningResponse)
async def screen_candidates(req: ScreeningRequest):
    if not req.candidates:
        raise HTTPException(status_code=400, detail="No candidates provided")

    weights_sum = (
        req.job.weights.skills
        + req.job.weights.experience
        + req.job.weights.education
        + req.job.weights.relevance
    )
    if abs(weights_sum - 100) > 0.5:
        raise HTTPException(
            status_code=400,
            detail=f"Scoring weights must sum to 100, got {weights_sum}",
        )

    if req.topN < 1 or req.topN > 50:
        raise HTTPException(status_code=400, detail="topN must be between 1 and 50")

    try:
        raw = run_screening(req)
        result = parse_and_rank(raw, req)
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI screening failed: {str(e)}")
