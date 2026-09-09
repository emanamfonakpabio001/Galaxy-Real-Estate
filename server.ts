import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { app } from './server/app';
import { connectToDatabase } from './server/db';

const PORT = 3000;

async function startServer() {
  // Connect to MongoDB & GridFS on server start
  try {
    await connectToDatabase();
  } catch (dbErr: any) {
    console.error('Database initialization note:', dbErr?.message || dbErr);
  }

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

