"""
Response Parser — validates and post-processes Gemini's JSON output.

Key responsibilities:
- Parse JSON (with fallback cleanup for minor formatting issues)
- Recompute overallScore server-side from breakdown values + weights
  (Gemini's arithmetic can drift; we never trust its composite score)
- Assign ranks after sort
- Enforce topN cutoff
"""

import json
import re
from models.request_models import ScreeningRequest
from models.response_models import (
    CandidateScreenResult,
    ScoreBreakdown,
    ScreeningResponse,
)


def _clean_json(text: str) -> str:
    """Strip any accidental markdown fences around JSON."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?", "", text)
    text = re.sub(r"```$", "", text)
    return text.strip()


def _clamp(value: float) -> float:
    return round(min(max(float(value), 0.0), 100.0), 1)


def parse_and_rank(raw: dict, req: ScreeningRequest) -> ScreeningResponse:
    text = _clean_json(raw["raw_text"])

    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini returned invalid JSON: {e}\n\nRaw output:\n{text[:500]}")

    evaluations = data.get("evaluations", [])
    if not evaluations:
        raise ValueError("Gemini returned no evaluations in response")

    w = req.job.weights
    results = []

    for ev in evaluations:
        bd = ev.get("scoreBreakdown", {})
        skills_score     = _clamp(bd.get("skills", 0))
        experience_score = _clamp(bd.get("experience", 0))
        education_score  = _clamp(bd.get("education", 0))
        relevance_score  = _clamp(bd.get("relevance", 0))

        # Recompute — never trust Gemini's overallScore
        computed_overall = (
            skills_score     * (w.skills / 100) +
            experience_score * (w.experience / 100) +
            education_score  * (w.education / 100) +
            relevance_score  * (w.relevance / 100)
        )
        computed_overall = _clamp(computed_overall)

        results.append(
            CandidateScreenResult(
                applicantId=ev.get("applicantId", ""),
                rank=0,  # assigned after sort
                overallScore=computed_overall,
                scoreBreakdown=ScoreBreakdown(
                    skills=skills_score,
                    experience=experience_score,
                    education=education_score,
                    relevance=relevance_score,
                ),
                strengths=ev.get("strengths", []),
                gaps=ev.get("gaps", []),
                recommendation=ev.get("recommendation", ""),
                geminiReasoning=ev.get("reasoning", ""),
            )
        )

    # Sort descending by computed score, assign ranks
    results.sort(key=lambda x: x.overallScore, reverse=True)
    for i, r in enumerate(results, 1):
        r.rank = i

    shortlisted = results[: req.topN]

    return ScreeningResponse(
        shortlisted=shortlisted,
        totalEvaluated=len(results),
        geminiModel=raw["model"],
        promptTokensUsed=raw["prompt_tokens"],
        responseTokensUsed=raw["response_tokens"],
    )
