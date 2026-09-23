import { Router } from 'express';
import { getDemoInventory } from '../services/inventoryService.js';

const router = Router();

router.get('/demo', (_request, response) => {
  response.json({ source: 'inventory.xlsx', items: getDemoInventory() });
});

export default router;
