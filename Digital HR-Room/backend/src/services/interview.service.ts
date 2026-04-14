import crypto from 'crypto';
import mongoose from 'mongoose';
import Job from '../models/Job.model';
import Applicant from '../models/Applicant.model';
import ScreeningResult from '../models/ScreeningResult.model';
import Interview from '../models/Interview.model';
import InterviewSession from '../models/InterviewSession.model';
import InterviewResponse from '../models/InterviewResponse.model';
import { generateInterviewQuestions, evaluateInterviewAnswers, GeneratedQuestion } from './ai-bridge.service';

const TOKEN_EXPIRY_DAYS = parseInt(process.env.INTERVIEW_TOKEN_EXPIRY_DAYS || '7', 10);

export async function launchInterview(jobId: string): Promise<string> {
  const job = await Job.findById(jobId);
  if (!job) throw new Error('Job not found');

  const screeningResult = await ScreeningResult.findOne({ jobId, status: 'completed' }).sort({ createdAt: -1 });
  if (!screeningResult) throw new Error('No completed screening result found for this job');

  const interview = await Interview.create({
    jobId: new mongoose.Types.ObjectId(jobId),
    screeningResultId: screeningResult._id,
    status: 'generating',
    totalInvited: 0,
  });

  await Job.findByIdAndUpdate(jobId, { status: 'interviewing' });

  // Run async in background
  (async () => {
    const startTime = Date.now();
    try {
      // Generate questions via Gemini
      const aiResult = await generateInterviewQuestions(job, 5);

      await Interview.findByIdAndUpdate(interview._id, {
        questions: aiResult.questions,
        geminiModel: aiResult.geminiModel,
        promptTokensUsed: aiResult.promptTokensUsed,
        responseTokensUsed: aiResult.responseTokensUsed,
        status: 'active',
        launchedAt: new Date(),
      });

      // Create one session per shortlisted candidate
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
      const sessionDocs = screeningResult.results.map(r => ({
        interviewId: interview._id,
        jobId: new mongoose.Types.ObjectId(jobId),
        applicantId: r.applicantId,
        screeningRank: r.rank,
        token: crypto.randomUUID(),
        tokenExpiresAt: expiresAt,
        status: 'invited' as const,
      }));

      await InterviewSession.insertMany(sessionDocs);

      await Interview.findByIdAndUpdate(interview._id, {
        totalInvited: sessionDocs.length,
      });

      console.log(`[Interview] Launched for job ${jobId}: ${sessionDocs.length} sessions created`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      await Interview.findByIdAndUpdate(interview._id, {
        status: 'failed',
        errorMessage: message,
      });
      await Job.findByIdAndUpdate(jobId, { status: 'completed' });
    }
  })();

  return interview._id.toString();
}

export async function evaluateAllSessions(interviewId: string): Promise<void> {
  const interview = await Interview.findById(interviewId);
  if (!interview) throw new Error('Interview not found');

  const job = await Job.findById(interview.jobId);
  if (!job) throw new Error('Job not found');

  const submittedSessions = await InterviewSession.find({
    interviewId: new mongoose.Types.ObjectId(interviewId),
    status: 'submitted',
  });

  if (submittedSessions.length === 0) throw new Error('No submitted sessions to evaluate');

  await Interview.findByIdAndUpdate(interviewId, { status: 'evaluating' });

  (async () => {
    const startTime = Date.now();
    let totalPromptTokens = 0;
    let totalResponseTokens = 0;
    let geminiModel = '';

    try {
      await Promise.all(
        submittedSessions.map(async session => {
          try {
            const applicant = await Applicant.findById(session.applicantId);
            if (!applicant) return;

            const responses = await InterviewResponse.find({ sessionId: session._id });
            const answers = responses.map(r => ({ questionId: r.questionId, answerText: r.answerText }));

            const questions: GeneratedQuestion[] = interview.questions.map(q => ({
              questionId: q.questionId,
              text: q.text,
              category: q.category,
            }));

            const result = await evaluateInterviewAnswers(
              job,
              {
                name: applicant.name,
                skills: applicant.skills,
                totalExperienceYears: applicant.totalExperienceYears,
                summary: applicant.summary,
              },
              questions,
              answers
            );

            totalPromptTokens += result.promptTokensUsed;
            totalResponseTokens += result.responseTokensUsed;
            geminiModel = result.geminiModel;

            await InterviewSession.findByIdAndUpdate(session._id, {
              status: 'evaluated',
              interviewScore: result.interviewScore,
              scoreBreakdown: result.scoreBreakdown,
              recommendation: result.recommendation,
              geminiReasoning: result.geminiReasoning,
              evaluatedAt: new Date(),
            });
          } catch (err) {
            console.error(`[Interview] Failed to evaluate session ${session._id}:`, err);
          }
        })
      );

      const processingTimeMs = Date.now() - startTime;
      await Interview.findByIdAndUpdate(interviewId, {
        status: 'completed',
        totalEvaluated: submittedSessions.length,
        geminiModel,
        promptTokensUsed: interview.promptTokensUsed + totalPromptTokens,
        responseTokensUsed: interview.responseTokensUsed + totalResponseTokens,
        processingTimeMs,
        completedAt: new Date(),
      });

      await Job.findByIdAndUpdate(interview.jobId.toString(), { status: 'interview_completed' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      await Interview.findByIdAndUpdate(interviewId, {
        status: 'failed',
        errorMessage: message,
      });
    }
  })();
}
