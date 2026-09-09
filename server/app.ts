import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { connectToDatabase, getDatabaseStatus } from './db';

// Import route modules
import { authRouter } from './routes/auth';
import { propertiesRouter } from './routes/properties';
import { mediaRouter } from './routes/media';
import { contentRouter } from './routes/content';
import { settingsRouter } from './routes/settings';
import { inquiriesRouter } from './routes/inquiries';
import { activityRouter } from './routes/activity';
import { backupRouter } from './routes/backup';

const app = express();

// Trust proxy for reverse proxies (Cloud Run / Vercel / Nginx)
app.set('trust proxy', 1);

// Security headers (configured to allow inline images and local API communication)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Middleware to ensure database connection is established before processing API requests
app.use('/api', async (req, res, next) => {
  // Let health check pass through or report status
  if (req.path === '/health') {
    return next();
  }
  try {
    await connectToDatabase();
    next();
  } catch (dbErr: any) {
    console.error('Database connection error in /api middleware:', dbErr);
    res.status(503).json({
      success: false,
      error: 'Database connection is initializing or unavailable. Please verify MONGODB_URI and MongoDB Atlas network whitelist (0.0.0.0/0).',
      details: dbErr?.message || String(dbErr),
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDatabaseStatus();
  res.json({
    status: 'ok',
    service: 'Galaxy Real Estate API & CMS Engine',
    database: 'MongoDB + GridFS',
    storageEngine: dbStatus.mode === 'atlas' ? 'MongoDB Atlas (Cloud Cluster)' : 'High-Performance Embedded MongoDB',
    connected: dbStatus.connected,
    timestamp: new Date().toISOString(),
  });
});

// REST API Routes
app.use('/api/auth', authRouter);
app.use('/api/properties', propertiesRouter);
app.use('/api/media', mediaRouter);
app.use('/api/content', contentRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/admin/activity', activityRouter);
app.use('/api/admin/backup', backupRouter);

// Catch-all 404 handler for API routes (prevent falling through to HTML SPA fallback)
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler for API routes (always return JSON, never HTML)
app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error handler caught:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'An internal server error occurred while processing your request.',
  });
});

export { app };
export default app;
