import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Interview from '../models/Interview.model';
import InterviewSession from '../models/InterviewSession.model';
import InterviewResponse from '../models/InterviewResponse.model';
import Applicant from '../models/Applicant.model';
import Job from '../models/Job.model';
import { launchInterview, evaluateAllSessions } from '../services/interview.service';

// ─── HR: Launch interview for a job ─────────────────────────────────────────

export async function launch(req: Request, res: Response, next: NextFunction) {
  try {
    const jobId = req.params.jobId as string;
    const job = await Job.findById(jobId);
    if (!job) { res.status(404).json({ success: false, error: 'Job not found' }); return; }
    if (job.status !== 'completed') {
      res.status(400).json({ success: false, error: 'Job must be in completed status to launch interviews' });
      return;
    }
    const interviewId = await launchInterview(jobId);
    res.status(202).json({ success: true, message: 'Interview launch started', interviewId });
  } catch (err) {
    next(err);
  }
}

// ─── HR: Get interview for a job ─────────────────────────────────────────────

export async function getInterview(req: Request, res: Response, next: NextFunction) {
  try {
    const interview = await Interview.findOne({ jobId: req.params.jobId }).sort({ createdAt: -1 });
    if (!interview) { res.status(404).json({ success: false, error: 'No interview found for this job' }); return; }
    res.json({ success: true, data: interview });
  } catch (err) {
    next(err);
  }
}

// ─── HR: List sessions for an interview ──────────────────────────────────────

export async function getSessions(req: Request, res: Response, next: NextFunction) {
  try {
    const sessions = await InterviewSession.find({
      interviewId: new mongoose.Types.ObjectId(req.params.interviewId as string),
    }).sort({ interviewScore: -1 });

    const populated = await Promise.all(
      sessions.map(async s => {
        const applicant = await Applicant.findById(s.applicantId).select('name email skills totalExperienceYears');
        return { ...s.toObject(), applicant };
      })
    );

    res.json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
}

// ─── HR: Trigger evaluation of submitted sessions ────────────────────────────

export async function triggerEvaluation(req: Request, res: Response, next: NextFunction) {
  try {
    const interview = await Interview.findById(req.params.interviewId);
    if (!interview) { res.status(404).json({ success: false, error: 'Interview not found' }); return; }
    if (interview.status !== 'active') {
      res.status(400).json({ success: false, error: 'Interview must be active to trigger evaluation' });
      return;
    }
    await evaluateAllSessions(req.params.interviewId as string);
    res.status(202).json({ success: true, message: 'Evaluation started' });
  } catch (err) {
    next(err);
  }
}

// ─── HR: Advance candidate to final interview ─────────────────────────────────

export async function advanceCandidate(req: Request, res: Response, next: NextFunction) {
  try {
    const { advance } = req.body as { advance: boolean };
    const session = await InterviewSession.findByIdAndUpdate(
      req.params.sessionId,
      { advancedToFinal: advance },
      { new: true }
    );
    if (!session) { res.status(404).json({ success: false, error: 'Session not found' }); return; }
    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
}

// ─── HR: Export interview results as CSV ─────────────────────────────────────

export async function exportInterviewResults(req: Request, res: Response, next: NextFunction) {
  try {
    const sessions = await InterviewSession.find({
      interviewId: new mongoose.Types.ObjectId(req.params.interviewId as string),
      status: 'evaluated',
    }).sort({ interviewScore: -1 });

    const rows = await Promise.all(
      sessions.map(async (s, i) => {
        const applicant = await Applicant.findById(s.applicantId);
        const bd = s.scoreBreakdown;
        return [
          i + 1,
          applicant?.name || '',
          applicant?.email || '',
          s.screeningRank,
          s.interviewScore ?? '',
          bd?.communication ?? '',
          bd?.technicalDepth ?? '',
          bd?.problemSolving ?? '',
          bd?.cultureFit ?? '',
          s.recommendation || '',
          s.advancedToFinal ? 'Yes' : 'No',
        ];
      })
    );

    const header = ['Interview Rank', 'Name', 'Email', 'Screening Rank', 'Interview Score', 'Communication', 'Technical Depth', 'Problem Solving', 'Culture Fit', 'Recommendation', 'Advanced to Final'];
    const csv = [header, ...rows]
      .map(row => row.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="interview-results-${req.params.interviewId}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

// ─── Public: Candidate loads their session via token ─────────────────────────

export async function getCandidateSession(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await InterviewSession.findOne({ token: req.params.token });
    if (!session) { res.status(404).json({ success: false, error: 'Session not found' }); return; }

    if (new Date() > session.tokenExpiresAt) {
      await InterviewSession.findByIdAndUpdate(session._id, { status: 'expired' });
      res.status(410).json({ success: false, error: 'This interview link has expired' });
      return;
    }

    const interview = await Interview.findById(session.interviewId).select('questions');
    const job = await Job.findById(session.jobId).select('title department');
    const applicant = await Applicant.findById(session.applicantId).select('name');

    // Mark as in_progress on first open
    if (session.status === 'invited') {
      await InterviewSession.findByIdAndUpdate(session._id, { status: 'in_progress', startedAt: new Date() });
    }

    res.json({
      success: true,
      data: {
        sessionId: session._id,
        status: session.status === 'invited' ? 'in_progress' : session.status,
        candidateName: applicant?.name || '',
        jobTitle: job?.title || '',
        jobDepartment: job?.department || '',
        questions: interview?.questions || [],
        tokenExpiresAt: session.tokenExpiresAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Public: Candidate submits answers ───────────────────────────────────────

export async function submitResponses(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await InterviewSession.findOne({ token: req.params.token });
    if (!session) { res.status(404).json({ success: false, error: 'Session not found' }); return; }

    if (new Date() > session.tokenExpiresAt) {
      res.status(410).json({ success: false, error: 'This interview link has expired' });
      return;
    }

    if (session.status === 'submitted' || session.status === 'evaluated') {
      res.status(400).json({ success: false, error: 'Interview already submitted' });
      return;
    }

    const { responses } = req.body as { responses: { questionId: string; answerText: string }[] };
    if (!responses || responses.length === 0) {
      res.status(400).json({ success: false, error: 'No responses provided' });
      return;
    }

    const now = new Date();
    await Promise.all(
      responses.map(r =>
        InterviewResponse.findOneAndUpdate(
          { sessionId: session._id, questionId: r.questionId },
          {
            sessionId: session._id,
            interviewId: session.interviewId,
            questionId: r.questionId,
            answerText: r.answerText,
            wordCount: r.answerText.trim().split(/\s+/).length,
            submittedAt: now,
          },
          { upsert: true, new: true }
        )
      )
    );

    await InterviewSession.findByIdAndUpdate(session._id, {
      status: 'submitted',
      submittedAt: now,
    });

    await Interview.findByIdAndUpdate(session.interviewId, { $inc: { totalSubmitted: 1 } });

    res.json({ success: true, message: 'Interview submitted successfully' });
  } catch (err) {
    next(err);
  }
}
