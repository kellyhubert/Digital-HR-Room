"""
Prompt Builder — constructs the multi-candidate batch prompt for Gemini.

Design decisions:
- All candidates in ONE prompt for consistent relative ranking.
- Weights passed as integers for reliable arithmetic.
- Server-side score recomputation in response_parser.py overrides Gemini's value.
- Candidate IDs threaded through so parser can match results back.
- JSON output enforced via both instruction and Gemini's response_mime_type.
"""

from models.request_models import ScreeningRequest

SYSTEM_INSTRUCTION = """
You are an expert technical HR recruiter and impartial talent evaluator.
Your task: evaluate ALL candidates listed below against the job requirements
and return structured, evidence-based screening scores.

STRICT RULES:
1. Evaluate EVERY candidate — never skip one.
2. All scores are integers 0–100 inclusive.
3. overallScore = weighted composite using the weights provided (compute exactly).
4. strengths: 3–5 concise bullet points, each grounded in specific evidence from the profile.
5. gaps: 1–3 honest risk factors or missing qualifications (be direct, not vague).
6. recommendation: 2–3 sentences starting with "Recommend", "Do not recommend", or "Consider for interview".
7. reasoning: your internal evaluation logic for this candidate (2–4 sentences).
8. Return ONLY valid JSON — no markdown fences, no preamble, no commentary.
9. The evaluations array must include ALL candidates, sorted by overallScore descending.
"""


def build_prompt(req: ScreeningRequest) -> str:
    w = req.job.weights

    job_block = f"""
=== JOB POSTING ===
Title: {req.job.title}
Description: {req.job.description}
Required Skills: {", ".join(req.job.requiredSkills) or "Not specified"}
Preferred Skills: {", ".join(req.job.preferredSkills) or "None"}
Minimum Experience: {req.job.minExperienceYears} years
Education Requirement: {req.job.educationRequirement or "Not specified"}
Location: {req.job.location}

=== SCORING WEIGHTS (must sum to 100) ===
Skills match:    {int(w.skills)}%
Experience:      {int(w.experience)}%
Education:       {int(w.education)}%
Role Relevance:  {int(w.relevance)}%
"""

    candidates_block = "\n=== CANDIDATES TO EVALUATE ===\n"
    for i, c in enumerate(req.candidates, 1):
        exp_lines = "; ".join(
            f"{e.title} at {e.company} ({e.durationMonths} months)"
            for e in c.experience
        ) or "None provided"

        edu_lines = "; ".join(
            f"{e.degree} in {e.field}, {e.institution} ({e.graduationYear})"
            for e in c.education
        ) or "None provided"

        candidates_block += f"""
--- Candidate {i} [ID: {c.applicantId}] ---
Name:              {c.name}
Skills:            {", ".join(c.skills) or "None listed"}
Total Experience:  {c.totalExperienceYears} years
Work History:      {exp_lines}
Education:         {edu_lines}
Location:          {c.location}
Availability:      {c.availability}
Portfolio:         {c.portfolio or "N/A"}
Summary:           {c.summary or "N/A"}
"""

    output_schema = """
=== REQUIRED OUTPUT (pure JSON, no markdown) ===
{
  "evaluations": [
    {
      "applicantId": "<string — must match the ID given above>",
      "scoreBreakdown": {
        "skills": <integer 0-100>,
        "experience": <integer 0-100>,
        "education": <integer 0-100>,
        "relevance": <integer 0-100>
      },
      "overallScore": <integer 0-100, weighted composite>,
      "strengths": ["<evidence-backed point>", "...", "..."],
      "gaps": ["<specific gap or risk>"],
      "recommendation": "<2-3 sentences starting with Recommend / Do not recommend / Consider for interview>",
      "reasoning": "<2-4 sentences of internal evaluation logic>"
    }
  ]
}
"""

    return job_block + candidates_block + output_schema
