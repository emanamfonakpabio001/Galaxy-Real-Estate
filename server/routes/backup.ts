import { Router } from 'express';
import { getDb } from '../db';
import { requireAdmin, logActivity, AuthRequest } from '../auth';

export const backupRouter = Router();

// GET /api/admin/backup/export - Export full site data as JSON (excluding passwords)
backupRouter.get('/export', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const db = getDb();

    const [
      properties,
      services,
      testimonials,
      homepageContent,
      aboutContent,
      websiteSettings,
      seoSettings,
      navigationItems,
      inquiries,
      mediaMetadata,
    ] = await Promise.all([
      db.collection('properties').find({}).toArray(),
      db.collection('services').find({}).toArray(),
      db.collection('testimonials').find({}).toArray(),
      db.collection('homepageContent').findOne({}),
      db.collection('aboutContent').findOne({}),
      db.collection('websiteSettings').findOne({}),
      db.collection('seoSettings').findOne({}),
      db.collection('navigationItems').find({}).toArray(),
      db.collection('inquiries').find({}).toArray(),
      db.collection('mediaMetadata').find({}).toArray(),
    ]);

    const backupPayload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      exporter: req.user?.email,
      data: {
        properties,
        services,
        testimonials,
        homepageContent,
        aboutContent,
        websiteSettings,
        seoSettings,
        navigationItems,
        inquiries,
        mediaMetadata,
      },
    };

    await logActivity(
      'Backup Exported',
      req.user?.name || 'Admin',
      'Downloaded complete JSON system backup',
      'Backup System'
    );

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="galaxy_backup_${Date.now()}.json"`);
    return res.json(backupPayload);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to generate backup export.' });
  }
});

// POST /api/admin/backup/import - Import backup JSON with validation
backupRouter.post('/import', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { backupData, overwrite = false } = req.body;

    if (!backupData || !backupData.data) {
      return res.status(400).json({
        success: false,
        error: 'Invalid backup format. Expected a valid Galaxy Real Estate JSON backup object.',
      });
    }

    const { data } = backupData;
    const db = getDb();

    if (overwrite) {
      if (Array.isArray(data.properties) && data.properties.length > 0) {
        await db.collection('properties').deleteMany({});
        await db.collection('properties').insertMany(data.properties);
      }
      if (Array.isArray(data.services) && data.services.length > 0) {
        await db.collection('services').deleteMany({});
        await db.collection('services').insertMany(data.services);
      }
      if (Array.isArray(data.testimonials) && data.testimonials.length > 0) {
        await db.collection('testimonials').deleteMany({});
        await db.collection('testimonials').insertMany(data.testimonials);
      }
      if (data.homepageContent) {
        await db.collection('homepageContent').deleteMany({});
        await db.collection('homepageContent').insertOne(data.homepageContent);
      }
      if (data.aboutContent) {
        await db.collection('aboutContent').deleteMany({});
        await db.collection('aboutContent').insertOne(data.aboutContent);
      }
      if (data.websiteSettings) {
        await db.collection('websiteSettings').deleteMany({});
        await db.collection('websiteSettings').insertOne(data.websiteSettings);
      }
      if (data.seoSettings) {
        await db.collection('seoSettings').deleteMany({});
        await db.collection('seoSettings').insertOne(data.seoSettings);
      }
      if (Array.isArray(data.navigationItems) && data.navigationItems.length > 0) {
        await db.collection('navigationItems').deleteMany({});
        await db.collection('navigationItems').insertMany(data.navigationItems);
      }
    }

    await logActivity(
      'Backup Restored',
      req.user?.name || 'Admin',
      `Restored backup from ${backupData.exportedAt || 'uploaded file'}`,
      'Backup System'
    );

    return res.json({
      success: true,
      message: 'Backup data imported and synchronized with MongoDB successfully.',
    });
  } catch (error: any) {
    console.error('Error importing backup:', error);
    return res.status(500).json({ success: false, error: 'Failed to process backup file.' });
  }
});
