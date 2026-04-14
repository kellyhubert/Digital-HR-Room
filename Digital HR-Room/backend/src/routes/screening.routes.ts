import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import {
  triggerUmuravaScreening,
  triggerExternalScreening,
  getResults,
  getResultById,
  exportResults,
} from '../controllers/screening.controller';

const router = Router({ mergeParams: true });

router.post('/screen/umurava', triggerUmuravaScreening);
router.post('/screen/external', upload.single('file'), triggerExternalScreening);
router.get('/screening-results', getResults);
router.get('/screening-results/:resultId', getResultById);
router.get('/screening-results/:resultId/export', exportResults);

export default router;
