import express from 'express';
import { startOAuth, handleOAuthCallback, syncCalendar } from '../controllers/calendarController';

const router = express.Router();

router.get('/auth', startOAuth);
router.get('/oauth2callback', handleOAuthCallback);
router.post('/sync', syncCalendar);

export default router;
