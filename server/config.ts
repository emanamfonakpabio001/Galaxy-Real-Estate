import dotenv from 'dotenv';
dotenv.config();

function sanitizeMongoUri(raw?: string): string {
  if (!raw) return '';
  let uri = raw.trim();
  while (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'")) ||
    (uri.startsWith('`') && uri.endsWith('`'))
  ) {
    uri = uri.slice(1, -1).trim();
  }

  // If standard mongodb+srv is provided without a database path, cleanly format it
  if (uri.startsWith('mongodb+srv://') || uri.startsWith('mongodb://')) {
    const parts = uri.split('?');
    const base = parts[0];
    const query = parts[1] || '';
    
    // Check if base has a database name path after host
    // Matches e.g. mongodb+srv://user:pass@host/ or mongodb+srv://user:pass@host
    const match = base.match(/^(mongodb(?:\+srv)?:\/\/[^\/]+)(\/.*)?$/);
    if (match) {
      const hostPart = match[1];
      const pathPart = (match[2] || '').replace(/^\//, '').trim();
      const dbName = pathPart || process.env.MONGODB_DATABASE || 'galaxy_real_estate';
      const queryString = query ? `?${query}` : '?retryWrites=true&w=majority';
      uri = `${hostPart}/${dbName}${queryString}`;
    }
  }

  return uri;
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: sanitizeMongoUri(process.env.MONGODB_URI),
  mongodbDatabase: (process.env.MONGODB_DATABASE || 'galaxy_real_estate').trim().replace(/['"`]/g, ''),
  jwtSecret: process.env.JWT_SECRET || 'galaxy_super_secure_jwt_secret_2026_nigeria',
  sessionSecret: process.env.SESSION_SECRET || 'galaxy_session_secret_change_in_production',
  adminEmail: (process.env.ADMIN_EMAIL || 'admin@galaxyrealestate.com').trim(),
  adminInitialPassword: process.env.ADMIN_INITIAL_PASSWORD || 'admin123@Galaxy',
  adminPin: process.env.ADMIN_PIN || '456824',
};
