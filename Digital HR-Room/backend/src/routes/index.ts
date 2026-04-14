import { Router } from 'express';
import jobsRouter from './jobs.routes';
import applicantsRouter from './applicants.routes';
import screeningRouter from './screening.routes';
import interviewRouter from './interview.routes';
import candidateSessionRouter from './candidate-session.routes';
import umuravaRouter from './umurava.routes';

const router = Router();

router.use('/jobs', jobsRouter);
router.use('/jobs/:jobId/applicants', applicantsRouter);
router.use('/jobs/:jobId', screeningRouter);
router.use('/jobs/:jobId', interviewRouter);
router.use('/interview-session', candidateSessionRouter);
router.use('/umurava', umuravaRouter);

export default router;
