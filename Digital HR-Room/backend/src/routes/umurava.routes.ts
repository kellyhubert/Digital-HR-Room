import { Router } from 'express';
import { listTalents, getTalent } from '../controllers/umurava.controller';

const router = Router();

router.get('/talents', listTalents);
router.get('/talents/:talentId', getTalent);

export default router;
