import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { errorHandler } from './middleware/error-handler.js';
import { logger } from './lib/logger.js';
import { startJobProcessor } from './workers/job-processor.js';

import authRoutes from './routes/auth.routes.js';
import organizationsRoutes from './routes/organizations.routes.js';
import projectsRoutes from './routes/projects.routes.js';
import sourcesRoutes from './routes/sources.routes.js';
import processingRoutes from './routes/processing.routes.js';
import datasetsRoutes from './routes/datasets.routes.js';
import integrationsRoutes from './routes/integrations.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet({
  contentSecurityPolicy: config.isDev ? false : undefined,
}));

app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
}));

app.use(rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'API-002', message: 'Too many requests, please try again later' } },
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'healthy', timestamp: new Date().toISOString() } });
});

app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/projects/:projectId/sources', sourcesRoutes);
app.use('/api/projects/:projectId/processing-runs', processingRoutes);
app.use('/api/projects/:projectId/datasets', datasetsRoutes);
app.use('/api/organizations/:organizationId/integrations', integrationsRoutes);

if (!config.isDev) {
  const clientDist = path.resolve(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(errorHandler);

const host = config.isDev ? '127.0.0.1' : '0.0.0.0';

app.listen(config.port, host, () => {
  logger.info(`Server running on http://${host}:${config.port} in ${config.nodeEnv} mode`);
  startJobProcessor();
});

export default app;
