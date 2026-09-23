import { Router } from 'express';
import { buildDropCandidates, revealDropCandidate } from '../services/dropService.js';

const router = Router();

router.post('/match', (request, response) => {
  response.json(buildDropCandidates(request.body));
});

router.post('/reveal', (request, response) => {
  const item = revealDropCandidate(request.body);
  if (!item) {
    response.status(409).json({ error: { code: 'DROP_UNAVAILABLE', message: 'This box is no longer available. Please roll again.' } });
    return;
  }
  response.json({ item });
});

export default router;
