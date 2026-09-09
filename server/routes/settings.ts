import { Router } from 'express';
import { getDb } from '../db';
import { requireAdmin, logActivity, AuthRequest } from '../auth';

export const settingsRouter = Router();

// GET /api/settings - Public website settings (company name, logo, phone, WhatsApp, colors)
settingsRouter.get('/', async (req, res) => {
  try {
    const db = getDb();
    const settings = await db.collection('websiteSettings').findOne({});
    return res.json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve website settings.' });
  }
});

// PUT /api/admin/settings - Update general website settings
settingsRouter.put('/admin/update', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const db = getDb();
    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    delete updates._id;

    await db.collection('websiteSettings').updateOne(
      {},
      { $set: updates },
      { upsert: true }
    );

    await logActivity(
      'Website Settings Updated',
      req.user?.name || 'Admin',
      'Updated site branding, contact details, or colors',
      'Website Settings'
    );

    return res.json({ success: true, message: 'Website settings updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update website settings.' });
  }
});

// PUT /api/admin/settings/whatsapp - Update WhatsApp number and default template
settingsRouter.put('/admin/whatsapp', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { whatsapp, defaultWhatsAppMessage } = req.body;
    const db = getDb();

    if (!whatsapp) {
      return res.status(400).json({ success: false, error: 'WhatsApp number is required.' });
    }

    // Clean number (strip non-digit characters)
    const cleanWhatsApp = whatsapp.replace(/\D/g, '');

    await db.collection('websiteSettings').updateOne(
      {},
      {
        $set: {
          whatsapp: cleanWhatsApp,
          defaultWhatsAppMessage: defaultWhatsAppMessage || 'Hello Galaxy Real Estate, I am interested in one of your properties and would like to speak with an agent.',
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    await logActivity(
      'WhatsApp Settings Updated',
      req.user?.name || 'Admin',
      `Changed WhatsApp contact line to "${cleanWhatsApp}"`,
      'WhatsApp Desk'
    );

    return res.json({
      success: true,
      message: `WhatsApp number updated to ${cleanWhatsApp}. Public site buttons updated.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update WhatsApp settings.' });
  }
});
