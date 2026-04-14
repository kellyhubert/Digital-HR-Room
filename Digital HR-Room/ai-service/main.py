import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import screening
from routers import interview
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Digital HR-Room AI Service",
    description="Gemini-powered candidate screening and ranking engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(screening.router, prefix="/screen", tags=["Screening"])
app.include_router(interview.router, prefix="/interview", tags=["Interview"])


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "Digital HR-Room AI Service",
        "gemini_model": os.environ.get("GEMINI_MODEL", "gemini-1.5-pro"),
        "api_key_set": bool(os.environ.get("GEMINI_API_KEY")),
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("AI_SERVICE_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
