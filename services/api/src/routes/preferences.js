import { Router } from 'express';
import { capturePreferenceSession } from '../services/preferenceService.js';
import { nextQuizQuestion } from '../services/quizService.js';

const router = Router();

router.post('/session', (request, response) => {
  response.status(201).json(capturePreferenceSession(request.body));
});

router.post('/question', async (request, response, next) => {
  try {
    response.json(await nextQuizQuestion(request.body));
  } catch (error) {
    next(error);
  }
});

export default router;
