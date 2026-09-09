import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../db';
import { requireAdmin, logActivity, AuthRequest } from '../auth';

export const contentRouter = Router();

// ==========================================
// 1. HOMEPAGE CONTENT
// ==========================================

// GET /api/content/homepage
contentRouter.get('/homepage', async (req, res) => {
  try {
    const db = getDb();
    const content = await db.collection('homepageContent').findOne({});
    return res.json({ success: true, data: content });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch homepage content.' });
  }
});

// PUT /api/content/homepage (Admin)
contentRouter.put('/homepage', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const db = getDb();
    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    delete updates._id;

    await db.collection('homepageContent').updateOne(
      {},
      { $set: updates },
      { upsert: true }
    );

    await logActivity('Homepage Updated', req.user?.name || 'Admin', 'Updated hero text, statistics, or CTA sections', 'Homepage CMS');
    return res.json({ success: true, message: 'Homepage content updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update homepage content.' });
  }
});

// ==========================================
// 2. ABOUT US CONTENT
// ==========================================

// GET /api/content/about
contentRouter.get('/about', async (req, res) => {
  try {
    const db = getDb();
    const content = await db.collection('aboutContent').findOne({});
    return res.json({ success: true, data: content });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch about content.' });
  }
});

// PUT /api/content/about (Admin)
contentRouter.put('/about', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const db = getDb();
    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    delete updates._id;

    await db.collection('aboutContent').updateOne(
      {},
      { $set: updates },
      { upsert: true }
    );

    await logActivity('About Us Updated', req.user?.name || 'Admin', 'Updated mission, vision, or core values', 'About CMS');
    return res.json({ success: true, message: 'About content updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update about content.' });
  }
});

// ==========================================
// 3. SERVICES CONTENT
// ==========================================

// GET /api/content/services
contentRouter.get('/services', async (req, res) => {
  try {
    const db = getDb();
    const services = await db.collection('services')
      .find({})
      .sort({ displayOrder: 1 })
      .toArray();

    const formatted = services.map(s => ({
      ...s,
      id: s.id || s._id.toString(),
    }));

    return res.json({ success: true, data: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch services.' });
  }
});

// POST /api/content/services (Admin: Create Service)
contentRouter.post('/services', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    const db = getDb();

    const newService = {
      id: `srv-${Date.now()}`,
      title: data.title,
      subtitle: data.subtitle || '',
      description: data.description || '',
      iconName: data.iconName || 'Home',
      benefits: Array.isArray(data.benefits) ? data.benefits : [],
      image: data.image || '',
      displayOrder: Number(data.displayOrder || 1),
      published: data.published !== false,
      createdAt: new Date().toISOString(),
    };

    const result = await db.collection('services').insertOne(newService);
    await logActivity('Service Added', req.user?.name || 'Admin', `Added service: "${newService.title}"`, 'Services CMS');

    return res.status(201).json({ success: true, data: { ...newService, _id: result.insertedId.toString() } });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create service.' });
  }
});

// PUT /api/content/services/:id (Admin: Edit Service)
contentRouter.put('/services/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = getDb();

    const query: any = {
      $or: [
        { id: id },
        ...(ObjectId.isValid(id) ? [{ _id: new ObjectId(id) }] : [])
      ]
    };
    delete updates._id;

    await db.collection('services').updateOne(query, { $set: updates });
    await logActivity('Service Updated', req.user?.name || 'Admin', `Updated service details for ${id}`, 'Services CMS');

    return res.json({ success: true, message: 'Service updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update service.' });
  }
});

// DELETE /api/content/services/:id (Admin: Delete Service)
contentRouter.delete('/services/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const query: any = {
      $or: [
        { id: id },
        ...(ObjectId.isValid(id) ? [{ _id: new ObjectId(id) }] : [])
      ]
    };
    await db.collection('services').deleteOne(query);
    await logActivity('Service Deleted', req.user?.name || 'Admin', `Deleted service ${id}`, 'Services CMS');
    return res.json({ success: true, message: 'Service deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete service.' });
  }
});

// ==========================================
// 4. TESTIMONIALS CONTENT
// ==========================================

// GET /api/content/testimonials
contentRouter.get('/testimonials', async (req, res) => {
  try {
    const db = getDb();
    const testimonials = await db.collection('testimonials')
      .find({})
      .sort({ displayOrder: 1, date: -1 })
      .toArray();

    const formatted = testimonials.map(t => ({
      ...t,
      id: t.id || t._id.toString(),
    }));

    return res.json({ success: true, data: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch testimonials.' });
  }
});

// POST /api/content/testimonials (Admin)
contentRouter.post('/testimonials', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    const db = getDb();

    const newTestimonial = {
      id: `tst-${Date.now()}`,
      name: data.name,
      role: data.role || 'Property Buyer',
      location: data.location || 'Abuja, Nigeria',
      avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      rating: Number(data.rating || 5),
      comment: data.comment,
      propertyPurchased: data.propertyPurchased || '',
      date: data.date || new Date().toISOString().split('T')[0],
      displayOrder: Number(data.displayOrder || 1),
      published: data.published !== false,
      createdAt: new Date().toISOString(),
    };

    const result = await db.collection('testimonials').insertOne(newTestimonial);
    await logActivity('Testimonial Added', req.user?.name || 'Admin', `Added testimonial from: "${newTestimonial.name}"`, 'Testimonials CMS');

    return res.status(201).json({ success: true, data: { ...newTestimonial, _id: result.insertedId.toString() } });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create testimonial.' });
  }
});

// PUT /api/content/testimonials/:id (Admin)
contentRouter.put('/testimonials/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = getDb();

    const query: any = {
      $or: [
        { id: id },
        ...(ObjectId.isValid(id) ? [{ _id: new ObjectId(id) }] : [])
      ]
    };
    delete updates._id;

    await db.collection('testimonials').updateOne(query, { $set: updates });
    await logActivity('Testimonial Updated', req.user?.name || 'Admin', `Updated testimonial ${id}`, 'Testimonials CMS');

    return res.json({ success: true, message: 'Testimonial updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update testimonial.' });
  }
});

// DELETE /api/content/testimonials/:id (Admin)
contentRouter.delete('/testimonials/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const query: any = {
      $or: [
        { id: id },
        ...(ObjectId.isValid(id) ? [{ _id: new ObjectId(id) }] : [])
      ]
    };
    await db.collection('testimonials').deleteOne(query);
    await logActivity('Testimonial Deleted', req.user?.name || 'Admin', `Deleted testimonial ${id}`, 'Testimonials CMS');
    return res.json({ success: true, message: 'Testimonial deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete testimonial.' });
  }
});

// ==========================================
// 5. SEO MANAGEMENT
// ==========================================

// GET /api/content/seo
contentRouter.get('/seo', async (req, res) => {
  try {
    const db = getDb();
    const seo = await db.collection('seoSettings').findOne({});
    return res.json({ success: true, data: seo });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch SEO settings.' });
  }
});

// PUT /api/content/seo (Admin)
contentRouter.put('/seo', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const db = getDb();
    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    delete updates._id;

    await db.collection('seoSettings').updateOne(
      {},
      { $set: updates },
      { upsert: true }
    );

    await logActivity('SEO Settings Updated', req.user?.name || 'Admin', 'Updated meta titles, descriptions, and OpenGraph tags', 'SEO CMS');
    return res.json({ success: true, message: 'SEO settings updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update SEO settings.' });
  }
});
