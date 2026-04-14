import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
from models.request_models import ScreeningRequest
from services.prompt_builder import build_prompt, SYSTEM_INSTRUCTION

load_dotenv()

MODEL_NAME = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")


def _get_client() -> genai.Client:
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set")
    return genai.Client(api_key=api_key)


def run_screening(req: ScreeningRequest) -> dict:
    client = _get_client()
    prompt = build_prompt(req)

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            temperature=0.2,
            max_output_tokens=8192,
        ),
    )

    prompt_tokens = 0
    response_tokens = 0
    if response.usage_metadata:
        prompt_tokens = response.usage_metadata.prompt_token_count or 0
        response_tokens = response.usage_metadata.candidates_token_count or 0

    return {
        "raw_text": response.text,
        "prompt_tokens": prompt_tokens,
        "response_tokens": response_tokens,
        "model": MODEL_NAME,
    }
