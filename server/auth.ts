import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from './config';
import { getDb } from './db';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function generateToken(user: { id: string; email: string; name: string; role: string }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: '8h' }
  );
}

export function verifyToken(token: string): AuthenticatedUser | null {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthenticatedUser;
    return decoded;
  } catch (err) {
    return null;
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  // Check authorization header or cookie
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.galaxy_admin_token) {
    token = req.cookies.galaxy_admin_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please enter admin password to unlock.',
    });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Session expired or invalid. Please unlock again.',
    });
  }

  req.user = user;
  next();
}

export async function logActivity(action: string, user: string, details?: string, affectedItem?: string) {
  try {
    const db = getDb();
    const now = new Date();
    await db.collection('activityLogs').insertOne({
      action,
      user,
      timestamp: now.toISOString(),
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-GB'),
      details: details || '',
      affectedItem: affectedItem || '',
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}
