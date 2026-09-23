import { Router } from 'express';
import { capturePreferenceSession } from '../services/preferenceService.js';

const router = Router();

router.post('/session', (request, response) => {
  response.status(201).json(capturePreferenceSession(request.body));
});

export default router;
