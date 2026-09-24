import { Router } from 'express';
import { buildDropCandidatesResponse, revealDropCandidate } from '../services/dropService.js';

const router = Router();

router.post('/match', (request, response) => {
  response.json(buildDropCandidatesResponse(request.body));
});

router.post('/reveal', (request, response) => {
  const drop = revealDropCandidate(request.body);
  if (!drop) return response.status(409).json({ error: { code: 'DROP_UNAVAILABLE', message: 'This box is no longer available. Go back and find new boxes.' } });
  response.json({ drop });
});

export default router;
