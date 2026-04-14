import { Request, Response, NextFunction } from 'express';
import { getTalents, getTalentById } from '../services/umurava.service';

export async function listTalents(req: Request, res: Response, next: NextFunction) {
  try {
    const skills = req.query.skills as string | undefined;
    const minExperienceYears = req.query.minExperienceYears as string | undefined;
    const location = req.query.location as string | undefined;
    const availability = req.query.availability as string | undefined;
    const filters = {
      skills: skills ? skills.split(',') : undefined,
      minExperienceYears: minExperienceYears ? parseInt(minExperienceYears) : undefined,
      location,
      availability: availability ? availability.split(',') : undefined,
    };
    const talents = await getTalents(filters);
    res.json({ success: true, data: talents, total: talents.length });
  } catch (err) {
    next(err);
  }
}

export async function getTalent(req: Request, res: Response, next: NextFunction) {
  try {
    const talent = await getTalentById(req.params.talentId as string);
    if (!talent) { res.status(404).json({ success: false, error: 'Talent not found' }); return; }
    res.json({ success: true, data: talent });
  } catch (err) {
    next(err);
  }
}
