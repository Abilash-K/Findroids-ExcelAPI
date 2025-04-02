import express from 'express';
import cors from 'cors';
import logger from './utils/logger';
import { requestLogger } from './middleware/logger.middleware';
import { errorHandler } from './middleware/error.middleware';
import helloRoutes from './routes/hello.routes';
import authRoutes from './routes/auth.routes';
import config from './config';
import './config/supabase'; // This will initialize Supabase and validate its config

const app = express();
const { port } = config.server;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.use('/', helloRoutes);
app.use('/auth', authRoutes);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Server is running on port ${port} in ${config.server.nodeEnv} mode`);
});