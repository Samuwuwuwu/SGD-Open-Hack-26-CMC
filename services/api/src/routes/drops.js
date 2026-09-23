import { Router } from 'express';
import { buildDropCandidates } from '../services/dropService.js';

const router = Router();

router.post('/match', (request, response) => {
  response.json(buildDropCandidates(request.body));
});

export default router;
