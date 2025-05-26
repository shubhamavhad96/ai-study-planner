import express from 'express';
import { createPlan, generateAndSyncPlan } from '../controllers/plannerController';

const router = express.Router();
router.post('/', createPlan);
router.post('/sync-calendar', generateAndSyncPlan);


export default router;
