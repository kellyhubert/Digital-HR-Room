"""
Interview Prompt Builder — generates prompts for question generation and answer evaluation.
"""

from models.interview_models import QuestionGenRequest, EvaluationRequest

SYSTEM_INSTRUCTION_QUESTIONS = """
You are a senior technical interviewer and HR specialist.
Your task: generate targeted, open-ended interview questions for a specific job role.

STRICT RULES:
1. Generate exactly the requested number of questions.
2. Mix question categories: technical (role-specific knowledge), behavioural (past behaviour), situational (hypothetical scenarios).
3. Questions must be directly relevant to the job's required skills and responsibilities.
4. Each question should require a thoughtful 2-4 paragraph response.
5. Assign a unique questionId: "q1", "q2", etc.
6. Return ONLY valid JSON — no markdown, no preamble, no commentary.
"""

SYSTEM_INSTRUCTION_EVALUATION = """
You are an expert technical interviewer evaluating a candidate's interview responses.
Your task: score the candidate's answers across four dimensions based on the quality, depth, and relevance of their responses.

STRICT RULES:
1. All scores are integers 0–100 inclusive.
2. communication: clarity, structure, and articulation of answers.
3. technicalDepth: accuracy and depth of technical knowledge demonstrated.
4. problemSolving: logical thinking and approach to challenges.
5. cultureFit: alignment with professional values and team collaboration indicators.
6. interviewScore = average of the four dimension scores (server will recompute — still provide your estimate).
7. recommendation: 2–3 sentences starting with "Recommend for final interview", "Do not recommend", or "Consider with reservations".
8. reasoning: your overall evaluation logic (3–5 sentences).
9. Return ONLY valid JSON — no markdown, no preamble.
"""


def build_question_generation_prompt(req: QuestionGenRequest) -> str:
    job = req.job
    return f"""
=== JOB POSTING ===
Title: {job.title}
Description: {job.description}
Required Skills: {", ".join(job.requiredSkills) or "Not specified"}
Preferred Skills: {", ".join(job.preferredSkills) or "None"}
Minimum Experience: {job.minExperienceYears} years

=== TASK ===
Generate exactly {req.questionCount} interview questions for this role.
Use this distribution:
- 2 technical questions (specific to the required skills above)
- 2 behavioural questions (past experience and behaviour)
- 1 situational question (hypothetical scenario relevant to this role)

=== REQUIRED OUTPUT (pure JSON, no markdown) ===
{{
  "questions": [
    {{
      "questionId": "q1",
      "text": "<the full question text>",
      "category": "technical"
    }},
    {{
      "questionId": "q2",
      "text": "<the full question text>",
      "category": "behavioural"
    }}
  ]
}}
"""


def build_evaluation_prompt(req: EvaluationRequest) -> str:
    job = req.job
    candidate = req.candidate

    answers_map = {a.questionId: a.answerText for a in req.answers}

    qa_block = ""
    for q in req.questions:
        answer = answers_map.get(q.questionId, "[No answer provided]")
        qa_block += f"""
--- Question [{q.questionId}] ({q.category}) ---
{q.text}

Candidate's Answer:
{answer}
"""

    return f"""
=== JOB CONTEXT ===
Title: {job.title}
Required Skills: {", ".join(job.requiredSkills) or "Not specified"}

=== CANDIDATE PROFILE ===
Name: {candidate.name}
Skills: {", ".join(candidate.skills) or "None listed"}
Experience: {candidate.totalExperienceYears} years
Summary: {candidate.summary or "N/A"}

=== INTERVIEW QUESTIONS AND ANSWERS ===
{qa_block}

=== SCORING DIMENSIONS ===
- communication (0–100): Clarity, structure, and articulation
- technicalDepth (0–100): Accuracy and depth of technical knowledge
- problemSolving (0–100): Logical thinking and structured problem approach
- cultureFit (0–100): Professional values and collaboration signals

=== REQUIRED OUTPUT (pure JSON, no markdown) ===
{{
  "interviewScore": <integer 0–100, average of four dimensions>,
  "scoreBreakdown": {{
    "communication": <integer 0–100>,
    "technicalDepth": <integer 0–100>,
    "problemSolving": <integer 0–100>,
    "cultureFit": <integer 0–100>
  }},
  "recommendation": "<2–3 sentences starting with Recommend for final interview / Do not recommend / Consider with reservations>",
  "reasoning": "<3–5 sentences of overall evaluation logic>"
}}
"""
