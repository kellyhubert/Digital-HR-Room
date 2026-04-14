import { Request, Response, NextFunction } from 'express';
import Applicant from '../models/Applicant.model';

export async function listApplicants(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const [applicants, total] = await Promise.all([
      Applicant.find({ jobId: req.params.jobId }).skip(skip).limit(parseInt(limit as string)),
      Applicant.countDocuments({ jobId: req.params.jobId }),
    ]);
    res.json({ success: true, data: applicants, total });
  } catch (err) {
    next(err);
  }
}

export async function getApplicant(req: Request, res: Response, next: NextFunction) {
  try {
    const applicant = await Applicant.findById(req.params.applicantId);
    if (!applicant) { res.status(404).json({ success: false, error: 'Applicant not found' }); return; }
    res.json({ success: true, data: applicant });
  } catch (err) {
    next(err);
  }
}
