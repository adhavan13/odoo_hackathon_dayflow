import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/env.config';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Express = express();

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Dayflow HRMS Backend API',
  });
});

app.use('/api/v1', routes);

app.use(errorHandler);

export default app;
