import { Router } from 'express';
import logger from '../utils/logger';

const router = Router();

router.get('/', (req, res) => {
  logger.info('Hello World endpoint called');
  res.json({ message: 'Hello World!' });
});

export default router; 