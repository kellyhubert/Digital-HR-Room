import { Request, Response, NextFunction } from 'express';
import Job from '../models/Job.model';

export async function listJobs(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit as string)),
      Job.countDocuments(filter),
    ]);

    res.json({ success: true, data: jobs, total, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch (err) {
    next(err);
  }
}

export async function createJob(req: Request, res: Response, next: NextFunction) {
  try {
    const { weights } = req.body;
    const sum = (weights?.skills || 0) + (weights?.experience || 0) + (weights?.education || 0) + (weights?.relevance || 0);
    if (Math.abs(sum - 100) > 0.1) {
      res.status(400).json({ success: false, error: `Weights must sum to 100, got ${sum}` });
      return;
    }
    const job = await Job.create(req.body);
    res.status(201).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
}

export async function getJob(req: Request, res: Response, next: NextFunction) {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) { res.status(404).json({ success: false, error: 'Job not found' }); return; }
    res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
}

export async function updateJob(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.body.weights) {
      const { weights } = req.body;
      const sum = (weights?.skills || 0) + (weights?.experience || 0) + (weights?.education || 0) + (weights?.relevance || 0);
      if (Math.abs(sum - 100) > 0.1) {
        res.status(400).json({ success: false, error: `Weights must sum to 100, got ${sum}` });
        return;
      }
    }
    const job = await Job.findByIdAndUpdate(req.params.jobId, req.body, { new: true, runValidators: true });
    if (!job) { res.status(404).json({ success: false, error: 'Job not found' }); return; }
    res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
}

export async function deleteJob(req: Request, res: Response, next: NextFunction) {
  try {
    const job = await Job.findByIdAndUpdate(req.params.jobId, { status: 'closed' }, { new: true });
    if (!job) { res.status(404).json({ success: false, error: 'Job not found' }); return; }
    res.json({ success: true, message: 'Job closed successfully' });
  } catch (err) {
    next(err);
  }
}
