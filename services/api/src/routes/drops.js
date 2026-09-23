import { Router } from 'express';
import { buildDropBundleResponse } from '../services/dropService.js';

const router = Router();

router.post('/match', (request, response) => {
  response.json(buildDropBundleResponse(request.body));
});

export default router;
