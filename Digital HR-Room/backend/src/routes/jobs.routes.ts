import { Router } from 'express';
import { listJobs, createJob, getJob, updateJob, deleteJob } from '../controllers/jobs.controller';

const router = Router();

router.get('/', listJobs);
router.post('/', createJob);
router.get('/:jobId', getJob);
router.patch('/:jobId', updateJob);
router.delete('/:jobId', deleteJob);

export default router;
