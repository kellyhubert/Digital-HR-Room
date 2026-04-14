import { Request, Response, NextFunction } from 'express';
import ScreeningResult from '../models/ScreeningResult.model';
import Applicant from '../models/Applicant.model';
import { screenUmurava, screenExternal } from '../services/screening.service';

export async function triggerUmuravaScreening(req: Request, res: Response, next: NextFunction) {
  try {
    const jobId = req.params.jobId as string;
    const { filters = {}, topN = 10 } = req.body;
    const screeningResultId = await screenUmurava(jobId, filters, topN);
    res.status(202).json({ success: true, message: 'Screening started', screeningResultId });
  } catch (err) {
    next(err);
  }
}

export async function triggerExternalScreening(req: Request, res: Response, next: NextFunction) {
  try {
    const jobId = req.params.jobId as string;
    if (!req.file) { res.status(400).json({ success: false, error: 'No file uploaded' }); return; }
    const topN = parseInt(req.body.topN || '10', 10);
    const screeningResultId = await screenExternal(jobId, req.file.path, topN);
    res.status(202).json({ success: true, message: 'Screening started', screeningResultId });
  } catch (err) {
    next(err);
  }
}

export async function getResults(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ScreeningResult.findOne({ jobId: req.params.jobId }).sort({ createdAt: -1 });
    if (!result) { res.status(404).json({ success: false, error: 'No screening results found' }); return; }

    // Populate applicant details
    const populatedResults = await Promise.all(
      result.results.map(async r => {
        const applicant = await Applicant.findById(r.applicantId).select('-rawText');
        return { ...r, applicant };
      })
    );

    res.json({
      success: true,
      data: {
        _id: result._id,
        jobId: result.jobId,
        scenario: result.scenario,
        status: result.status,
        totalCandidatesEvaluated: result.totalCandidatesEvaluated,
        shortlistedCount: result.shortlistedCount,
        processingTimeMs: result.processingTimeMs,
        geminiModel: result.geminiModel,
        promptTokensUsed: result.promptTokensUsed,
        responseTokensUsed: result.responseTokensUsed,
        errorMessage: result.errorMessage,
        results: populatedResults,
        createdAt: result.createdAt,
        completedAt: result.completedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getResultById(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ScreeningResult.findById(req.params.resultId);
    if (!result) { res.status(404).json({ success: false, error: 'Screening result not found' }); return; }

    const populatedResults = await Promise.all(
      result.results.map(async r => {
        const applicant = await Applicant.findById(r.applicantId).select('-rawText');
        return { ...r, applicant };
      })
    );

    res.json({ success: true, data: { ...result.toObject(), results: populatedResults } });
  } catch (err) {
    next(err);
  }
}

export async function exportResults(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ScreeningResult.findById(req.params.resultId);
    if (!result) { res.status(404).json({ success: false, error: 'Not found' }); return; }

    const rows = await Promise.all(
      result.results.map(async r => {
        const applicant = await Applicant.findById(r.applicantId);
        return [
          r.rank,
          applicant?.name || '',
          applicant?.email || '',
          r.overallScore,
          r.scoreBreakdown.skills,
          r.scoreBreakdown.experience,
          r.scoreBreakdown.education,
          r.scoreBreakdown.relevance,
          r.strengths.join(' | '),
          r.gaps.join(' | '),
          r.recommendation,
        ];
      })
    );

    const header = ['Rank', 'Name', 'Email', 'Overall Score', 'Skills', 'Experience', 'Education', 'Relevance', 'Strengths', 'Gaps', 'Recommendation'];
    const csv = [header, ...rows].map(row => row.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="screening-results-${result._id}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}
