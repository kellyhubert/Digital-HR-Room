import { Router } from 'express';
import { listApplicants, getApplicant } from '../controllers/applicants.controller';

const router = Router({ mergeParams: true });

router.get('/', listApplicants);
router.get('/:applicantId', getApplicant);

export default router;
