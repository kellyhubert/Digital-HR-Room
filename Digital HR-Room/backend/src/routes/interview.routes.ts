import { Router } from 'express';
import {
  launch,
  getInterview,
  getSessions,
  triggerEvaluation,
  advanceCandidate,
  exportInterviewResults,
} from '../controllers/interview.controller';

const router = Router({ mergeParams: true });

router.post('/interviews', launch);
router.get('/interviews', getInterview);
router.get('/interviews/:interviewId/sessions', getSessions);
router.post('/interviews/:interviewId/evaluate', triggerEvaluation);
router.patch('/interviews/:interviewId/sessions/:sessionId/advance', advanceCandidate);
router.get('/interviews/:interviewId/export', exportInterviewResults);

export default router;
