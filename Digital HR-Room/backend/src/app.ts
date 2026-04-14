import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/env';
import apiRouter from './routes/index';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(config.uploadDir)));

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api/v1', apiRouter);
app.use(errorHandler);

export default app;
