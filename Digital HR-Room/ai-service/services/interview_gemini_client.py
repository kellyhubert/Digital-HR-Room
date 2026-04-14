"""
Interview Gemini Client — calls Gemini for question generation and answer evaluation.
"""

import os
import json
import re
from google import genai
from google.genai import types
from dotenv import load_dotenv
from models.interview_models import (
    QuestionGenRequest,
    EvaluationRequest,
    GeneratedQuestion,
    QuestionGenResponse,
    InterviewScoreBreakdown,
    EvaluationResponse,
)
from services.interview_prompt_builder import (
    build_question_generation_prompt,
    build_evaluation_prompt,
    SYSTEM_INSTRUCTION_QUESTIONS,
    SYSTEM_INSTRUCTION_EVALUATION,
)

load_dotenv()

MODEL_NAME = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")


def _get_client() -> genai.Client:
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set")
    return genai.Client(api_key=api_key)


def _clean_json(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:json)?", "", text)
    text = re.sub(r"```$", "", text)
    return text.strip()


def _clamp(value: float) -> float:
    return round(min(max(float(value), 0.0), 100.0), 1)


def run_question_generation(req: QuestionGenRequest) -> QuestionGenResponse:
    client = _get_client()
    prompt = build_question_generation_prompt(req)

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION_QUESTIONS,
            response_mime_type="application/json",
            temperature=0.3,
            max_output_tokens=2048,
        ),
    )

    prompt_tokens = 0
    response_tokens = 0
    if response.usage_metadata:
        prompt_tokens = response.usage_metadata.prompt_token_count or 0
        response_tokens = response.usage_metadata.candidates_token_count or 0

    text = _clean_json(response.text)
    data = json.loads(text)
    raw_questions = data.get("questions", [])

    questions = [
        GeneratedQuestion(
            questionId=q.get("questionId", f"q{i+1}"),
            text=q.get("text", ""),
            category=q.get("category", "technical"),
        )
        for i, q in enumerate(raw_questions)
    ]

    return QuestionGenResponse(
        questions=questions,
        geminiModel=MODEL_NAME,
        promptTokensUsed=prompt_tokens,
        responseTokensUsed=response_tokens,
    )


def run_evaluation(req: EvaluationRequest) -> EvaluationResponse:
    client = _get_client()
    prompt = build_evaluation_prompt(req)

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION_EVALUATION,
            response_mime_type="application/json",
            temperature=0.2,
            max_output_tokens=1024,
        ),
    )

    prompt_tokens = 0
    response_tokens = 0
    if response.usage_metadata:
        prompt_tokens = response.usage_metadata.prompt_token_count or 0
        response_tokens = response.usage_metadata.candidates_token_count or 0

    text = _clean_json(response.text)
    data = json.loads(text)

    bd = data.get("scoreBreakdown", {})
    communication   = _clamp(bd.get("communication", 0))
    technical_depth = _clamp(bd.get("technicalDepth", 0))
    problem_solving = _clamp(bd.get("problemSolving", 0))
    culture_fit     = _clamp(bd.get("cultureFit", 0))

    # Recompute — never trust Gemini's arithmetic
    interview_score = _clamp((communication + technical_depth + problem_solving + culture_fit) / 4)

    return EvaluationResponse(
        interviewScore=interview_score,
        scoreBreakdown=InterviewScoreBreakdown(
            communication=communication,
            technicalDepth=technical_depth,
            problemSolving=problem_solving,
            cultureFit=culture_fit,
        ),
        recommendation=data.get("recommendation", ""),
        geminiReasoning=data.get("reasoning", ""),
        geminiModel=MODEL_NAME,
        promptTokensUsed=prompt_tokens,
        responseTokensUsed=response_tokens,
    )
