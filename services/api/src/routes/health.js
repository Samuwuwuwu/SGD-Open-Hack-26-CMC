import { Router } from 'express';

const router = Router();

router.get('/', (_request, response) => {
  response.json({ status: 'ok', service: 'rollover-api' });
});

export default router;
