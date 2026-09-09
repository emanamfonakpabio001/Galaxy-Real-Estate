import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { connectToDatabase, getDatabaseStatus } from './server/db';
import { config } from './server/config';

// Import route modules
import { authRouter } from './server/routes/auth';
import { propertiesRouter } from './server/routes/properties';
import { mediaRouter } from './server/routes/media';
import { contentRouter } from './server/routes/content';
import { settingsRouter } from './server/routes/settings';
import { inquiriesRouter } from './server/routes/inquiries';
import { activityRouter } from './server/routes/activity';
import { backupRouter } from './server/routes/backup';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy for reverse proxies (Cloud Run / Nginx)
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

  // Connect to MongoDB & GridFS
  try {
    await connectToDatabase();
  } catch (dbErr: any) {
    console.error('Fatal database initialization failure:', dbErr?.message || dbErr);
  }

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

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Galaxy Real Estate CMS & Public Web Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
