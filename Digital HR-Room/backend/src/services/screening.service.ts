import mongoose from 'mongoose';
import Job, { IJob } from '../models/Job.model';
import Applicant from '../models/Applicant.model';
import ScreeningResult from '../models/ScreeningResult.model';
import { runAIScreening, CandidateInput } from './ai-bridge.service';
import { getTalents, TalentFilter, UmuravaTalent } from './umurava.service';
import { parseFile, ParsedCandidate } from './file-parser.service';

const CHUNK_SIZE = 30;

function talentToInput(t: UmuravaTalent, applicantId: string): CandidateInput {
  return {
    applicantId,
    name: t.name,
    skills: t.skills,
    totalExperienceYears: t.totalExperienceYears,
    experience: t.experience.map(e => ({
      title: e.title,
      company: e.company,
      durationMonths: e.durationMonths,
      description: e.description,
    })),
    education: t.education,
    location: t.location,
    availability: t.availability,
    portfolio: t.portfolio,
    summary: t.summary,
  };
}

function parsedToInput(p: ParsedCandidate, applicantId: string): CandidateInput {
  return {
    applicantId,
    name: p.name,
    skills: p.skills,
    totalExperienceYears: p.totalExperienceYears,
    experience: p.experience,
    education: p.education,
    location: p.location,
    availability: p.availability,
    portfolio: p.portfolio,
    summary: p.summary,
  };
}

async function chunkAndScreen(
  job: IJob,
  candidates: CandidateInput[],
  topN: number
) {
  if (candidates.length <= CHUNK_SIZE) {
    return runAIScreening(job, candidates, topN);
  }

  // Split into chunks, screen each, merge and re-rank
  const chunks: CandidateInput[][] = [];
  for (let i = 0; i < candidates.length; i += CHUNK_SIZE) {
    chunks.push(candidates.slice(i, i + CHUNK_SIZE));
  }

  const allResults = await Promise.all(
    chunks.map(chunk => runAIScreening(job, chunk, Math.min(topN, chunk.length)))
  );

  const merged = allResults.flatMap(r => r.shortlisted);
  merged.sort((a, b) => b.overallScore - a.overallScore);
  const shortlisted = merged.slice(0, topN);
  shortlisted.forEach((r, i) => { r.rank = i + 1; });

  return {
    shortlisted,
    totalEvaluated: candidates.length,
    geminiModel: allResults[0].geminiModel,
    promptTokensUsed: allResults.reduce((s, r) => s + r.promptTokensUsed, 0),
    responseTokensUsed: allResults.reduce((s, r) => s + r.responseTokensUsed, 0),
  };
}

export async function screenUmurava(
  jobId: string,
  filters: TalentFilter,
  topN: number
): Promise<string> {
  const job = await Job.findById(jobId);
  if (!job) throw new Error('Job not found');

  // Create pending screening result
  const screeningResult = await ScreeningResult.create({
    jobId: new mongoose.Types.ObjectId(jobId),
    scenario: 'umurava',
    totalCandidatesEvaluated: 0,
    shortlistedCount: topN,
    status: 'processing',
  });

  await Job.findByIdAndUpdate(jobId, { status: 'screening', screeningScenario: 'umurava' });

  // Run in background
  (async () => {
    const startTime = Date.now();
    try {
      const talents = await getTalents(filters);
      if (talents.length === 0) throw new Error('No talents match the given filters');

      // Save applicants to DB
      const applicantDocs = await Promise.all(
        talents.map(t =>
          Applicant.findOneAndUpdate(
            { jobId: new mongoose.Types.ObjectId(jobId), email: t.email },
            {
              jobId: new mongoose.Types.ObjectId(jobId),
              source: 'umurava',
              externalId: t.id,
              name: t.name,
              email: t.email,
              phone: t.phone,
              location: t.location,
              skills: t.skills,
              totalExperienceYears: t.totalExperienceYears,
              experience: t.experience,
              education: t.education,
              portfolio: t.portfolio,
              availability: t.availability,
              linkedIn: t.linkedIn,
              github: t.github,
              summary: t.summary,
            },
            { upsert: true, new: true }
          )
        )
      );

      const candidates = applicantDocs.map((doc, i) =>
        talentToInput(talents[i], doc._id.toString())
      );

      const aiResult = await chunkAndScreen(job, candidates, topN);
      const processingTimeMs = Date.now() - startTime;

      const results = aiResult.shortlisted.map(r => ({
        applicantId: new mongoose.Types.ObjectId(r.applicantId),
        rank: r.rank,
        overallScore: r.overallScore,
        scoreBreakdown: r.scoreBreakdown,
        strengths: r.strengths,
        gaps: r.gaps,
        recommendation: r.recommendation,
        geminiReasoning: r.geminiReasoning,
      }));

      await ScreeningResult.findByIdAndUpdate(screeningResult._id, {
        totalCandidatesEvaluated: aiResult.totalEvaluated,
        shortlistedCount: aiResult.shortlisted.length,
        results,
        geminiModel: aiResult.geminiModel,
        promptTokensUsed: aiResult.promptTokensUsed,
        responseTokensUsed: aiResult.responseTokensUsed,
        processingTimeMs,
        status: 'completed',
        completedAt: new Date(),
      });

      await Job.findByIdAndUpdate(jobId, { status: 'completed' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      await ScreeningResult.findByIdAndUpdate(screeningResult._id, {
        status: 'failed',
        errorMessage: message,
      });
      await Job.findByIdAndUpdate(jobId, { status: 'active' });
    }
  })();

  return screeningResult._id.toString();
}

export async function screenExternal(
  jobId: string,
  filePath: string,
  topN: number
): Promise<string> {
  const job = await Job.findById(jobId);
  if (!job) throw new Error('Job not found');

  const screeningResult = await ScreeningResult.create({
    jobId: new mongoose.Types.ObjectId(jobId),
    scenario: 'external',
    totalCandidatesEvaluated: 0,
    shortlistedCount: topN,
    status: 'processing',
  });

  await Job.findByIdAndUpdate(jobId, { status: 'screening', screeningScenario: 'external' });

  (async () => {
    const startTime = Date.now();
    try {
      const parsed: ParsedCandidate[] = await parseFile(filePath);
      if (parsed.length === 0) throw new Error('No candidates found in uploaded file');

      const applicantDocs = await Promise.all(
        parsed.map(p =>
          Applicant.findOneAndUpdate(
            { jobId: new mongoose.Types.ObjectId(jobId), email: p.email || `unknown-${Date.now()}@placeholder.com` },
            {
              jobId: new mongoose.Types.ObjectId(jobId),
              source: 'external',
              name: p.name,
              email: p.email || `unknown-${Date.now()}@placeholder.com`,
              phone: p.phone,
              location: p.location,
              skills: p.skills,
              totalExperienceYears: p.totalExperienceYears,
              experience: p.experience,
              education: p.education,
              portfolio: p.portfolio,
              availability: p.availability,
              linkedIn: p.linkedIn,
              github: p.github,
              summary: p.summary,
              rawText: p.rawText,
            },
            { upsert: true, new: true }
          )
        )
      );

      const candidates = applicantDocs.map((doc, i) =>
        parsedToInput(parsed[i], doc._id.toString())
      );

      const aiResult = await chunkAndScreen(job, candidates, topN);
      const processingTimeMs = Date.now() - startTime;

      const results = aiResult.shortlisted.map(r => ({
        applicantId: new mongoose.Types.ObjectId(r.applicantId),
        rank: r.rank,
        overallScore: r.overallScore,
        scoreBreakdown: r.scoreBreakdown,
        strengths: r.strengths,
        gaps: r.gaps,
        recommendation: r.recommendation,
        geminiReasoning: r.geminiReasoning,
      }));

      await ScreeningResult.findByIdAndUpdate(screeningResult._id, {
        totalCandidatesEvaluated: aiResult.totalEvaluated,
        shortlistedCount: aiResult.shortlisted.length,
        results,
        geminiModel: aiResult.geminiModel,
        promptTokensUsed: aiResult.promptTokensUsed,
        responseTokensUsed: aiResult.responseTokensUsed,
        processingTimeMs,
        status: 'completed',
        completedAt: new Date(),
      });

      await Job.findByIdAndUpdate(jobId, { status: 'completed' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      await ScreeningResult.findByIdAndUpdate(screeningResult._id, {
        status: 'failed',
        errorMessage: message,
      });
      await Job.findByIdAndUpdate(jobId, { status: 'active' });
    }
  })();

  return screeningResult._id.toString();
}
