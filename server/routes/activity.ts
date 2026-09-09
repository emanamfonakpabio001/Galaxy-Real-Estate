import { Router } from 'express';
import { getDb } from '../db';
import { requireAdmin, AuthRequest } from '../auth';

export const activityRouter = Router();

// GET /api/admin/activity - Retrieve activity logs with search
activityRouter.get('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { search, limit = '100' } = req.query;
    const db = getDb();

    const query: any = {};
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      query.$or = [
        { action: { $regex: q, $options: 'i' } },
        { user: { $regex: q, $options: 'i' } },
        { details: { $regex: q, $options: 'i' } },
        { affectedItem: { $regex: q, $options: 'i' } },
      ];
    }

    const logs = await db.collection('activityLogs')
      .find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit as string, 10))
      .toArray();

    const formatted = logs.map(l => ({
      ...l,
      id: l.id || l._id.toString(),
    }));

    return res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve activity log.' });
  }
});
