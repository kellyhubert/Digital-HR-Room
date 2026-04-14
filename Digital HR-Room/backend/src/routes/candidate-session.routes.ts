import { Router } from 'express';
import { getCandidateSession, submitResponses } from '../controllers/interview.controller';

const router = Router();

router.get('/:token', getCandidateSession);
router.post('/:token/responses', submitResponses);

export default router;
