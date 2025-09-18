import { getLessons, getLessonProgress, postLessonStart, updateLessonComplete } from '../controllers/lessonsController.js';
import express from 'express';

const router = express.Router();
router.get('/', getLessons);
router.get('/:userId', getLessonProgress) 
router.post('/start', postLessonStart);
router.put('/complete', updateLessonComplete)

export default router;