import express from 'express';
import {
  trackEvent,
  getSessionsList,
  getSessionTimeline,
  getHeatmapData,
} from '../controllers/analyticsController.js';

const router = express.Router();

router.post('/events', trackEvent);
router.get('/sessions', getSessionsList);
router.get('/sessions/:sessionId/events', getSessionTimeline);
router.get('/heatmap', getHeatmapData);

export default router;