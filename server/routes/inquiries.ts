import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../db';
import { requireAdmin, logActivity, AuthRequest } from '../auth';

export const inquiriesRouter = Router();

// POST /api/inquiries - Public form submission (Contact form or Property Inspection/Inquiry)
inquiriesRouter.post('/', async (req, res) => {
  try {
    const { name, email, phone, message, propertyId, propertyTitle, propertyPrice, propertySlug } = req.body;

    if (!name || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your name and at least an email address or phone number.',
      });
    }

    const db = getDb();
    const now = new Date();

    const newInquiry = {
      id: `inq-${Date.now()}`,
      name: name.trim(),
      email: (email || '').trim().toLowerCase(),
      phone: (phone || '').trim(),
      message: message || 'Interested in properties from Galaxy Real Estate.',
      propertyId: propertyId || null,
      propertyTitle: propertyTitle || null,
      propertyPrice: propertyPrice ? Number(propertyPrice) : null,
      propertySlug: propertySlug || null,
      status: 'New',
      date: now.toLocaleDateString('en-GB'),
      createdAt: now.toISOString(),
      notes: '',
    };

    const result = await db.collection('inquiries').insertOne(newInquiry);

    await logActivity(
      'New Customer Inquiry',
      name.trim(),
      propertyTitle ? `Inquiry submitted for "${propertyTitle}"` : `General contact message received from ${email || phone}`,
      `Inquiry: ${newInquiry.id}`
    );

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your inquiry has been received. A Galaxy luxury property specialist will reach out shortly.',
      inquiryId: result.insertedId.toString(),
    });
  } catch (error: any) {
    console.error('Error saving inquiry to MongoDB:', error);
    return res.status(500).json({ success: false, error: 'Failed to record inquiry.' });
  }
});

// GET /api/admin/inquiries - Admin list inquiries with search & filter
inquiriesRouter.get('/admin/all', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { status, search } = req.query;
    const db = getDb();

    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { propertyTitle: { $regex: q, $options: 'i' } },
        { message: { $regex: q, $options: 'i' } },
      ];
    }

    const inquiries = await db.collection('inquiries')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = inquiries.map((i: any) => ({
      ...i,
      id: i.id || i._id?.toString(),
    }));

    const stats = {
      total: formatted.length,
      new: formatted.filter((i: any) => i.status === 'New').length,
      contacted: formatted.filter((i: any) => i.status === 'Contacted').length,
      inProgress: formatted.filter((i: any) => i.status === 'In Progress').length,
      closed: formatted.filter((i: any) => i.status === 'Closed').length,
    };

    return res.json({
      success: true,
      stats,
      data: formatted,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve inquiries.' });
  }
});

// PUT /api/admin/inquiries/:id/status - Update inquiry status or notes
inquiriesRouter.put('/admin/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const db = getDb();

    const query: any = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id };
    const updates: any = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    await db.collection('inquiries').updateOne(query, { $set: updates });

    await logActivity(
      'Inquiry Updated',
      req.user?.name || 'Admin',
      `Updated inquiry ${id} status to "${status || 'Updated'}"`,
      `Inquiry: ${id}`
    );

    return res.json({ success: true, message: 'Inquiry updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update inquiry.' });
  }
});

// DELETE /api/admin/inquiries/:id - Delete inquiry
inquiriesRouter.delete('/admin/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const query: any = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id };

    await db.collection('inquiries').deleteOne(query);

    await logActivity(
      'Inquiry Deleted',
      req.user?.name || 'Admin',
      `Deleted inquiry record ${id}`,
      `Inquiry: ${id}`
    );

    return res.json({ success: true, message: 'Inquiry deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete inquiry.' });
  }
});
