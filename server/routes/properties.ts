import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../db';
import { requireAdmin, logActivity, AuthRequest } from '../auth';
import { Property } from '../../src/types';

export const propertiesRouter = Router();

// Helper to generate URL-safe slug
function generateSlug(title: string, city: string = 'Nigeria'): string {
  const base = `${title} ${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// ----------------------------------------------------
// PUBLIC ROUTES
// ----------------------------------------------------

// GET /api/properties - Retrieve published properties with filtering & sorting
propertiesRouter.get('/', async (req, res) => {
  try {
    const { 
      searchTerm, 
      city, 
      propertyType, 
      status, 
      bedrooms, 
      minPrice, 
      maxPrice, 
      featured,
      sortBy 
    } = req.query;

    const db = getDb();
    const query: any = { published: { $ne: false } }; // only published

    if (city && city !== 'all') {
      query['location.city'] = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    if (propertyType && propertyType !== 'all') {
      query.type = { $regex: new RegExp(`^${propertyType}$`, 'i') };
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (bedrooms && bedrooms !== 'all') {
      if (bedrooms === '5+') {
        query.bedrooms = { $gte: 5 };
      } else {
        query.bedrooms = parseInt(bedrooms as string, 10);
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
      const q = searchTerm.trim();
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { shortDescription: { $regex: q, $options: 'i' } },
        { fullDescription: { $regex: q, $options: 'i' } },
        { 'location.neighborhood': { $regex: q, $options: 'i' } },
        { 'location.address': { $regex: q, $options: 'i' } },
        { 'location.city': { $regex: q, $options: 'i' } },
        { type: { $regex: q, $options: 'i' } },
      ];
    }

    let sortOption: any = { featured: -1, createdAt: -1 };
    if (sortBy === 'price-asc') sortOption = { price: 1 };
    else if (sortBy === 'price-desc') sortOption = { price: -1 };
    else if (sortBy === 'newest') sortOption = { createdAt: -1, yearBuilt: -1 };
    else if (sortBy === 'bedrooms') sortOption = { bedrooms: -1 };

    const properties = await db.collection('properties')
      .find(query)
      .sort(sortOption)
      .toArray();

    const formatted = properties.map(p => ({
      ...p,
      id: p.id || p._id.toString(),
    }));

    return res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error: any) {
    console.error('Error fetching public properties:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch properties from database.' });
  }
});

// GET /api/properties/:slug - Get single property by slug or ID
propertiesRouter.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const db = getDb();

    let property = await db.collection('properties').findOne({ slug });
    if (!property && ObjectId.isValid(slug)) {
      property = await db.collection('properties').findOne({ _id: new ObjectId(slug) });
    }
    if (!property) {
      property = await db.collection('properties').findOne({ id: slug });
    }

    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found.' });
    }

    return res.json({
      success: true,
      data: {
        ...property,
        id: property.id || property._id.toString(),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve property details.' });
  }
});

// ----------------------------------------------------
// ADMIN PROTECTED ROUTES
// ----------------------------------------------------

// GET /api/admin/properties - Retrieve all properties including drafts for CMS
propertiesRouter.get('/admin/all', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const db = getDb();
    const properties = await db.collection('properties')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = properties.map((p: any) => ({
      ...p,
      id: p.id || p._id?.toString(),
    }));

    const stats = {
      total: formatted.length,
      published: formatted.filter((p: any) => p.published !== false).length,
      drafts: formatted.filter((p: any) => p.published === false).length,
      forSale: formatted.filter((p: any) => p.status === 'For Sale').length,
      forRent: formatted.filter((p: any) => p.status === 'For Rent').length,
      featured: formatted.filter((p: any) => p.featured).length,
    };

    return res.json({
      success: true,
      stats,
      data: formatted,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch admin properties.' });
  }
});

// POST /api/admin/properties - Create new property
propertiesRouter.post('/admin/create', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    const db = getDb();

    if (!data.title || !data.price || !data.location?.city) {
      return res.status(400).json({
        success: false,
        error: 'Title, price, and city are required to create a property.',
      });
    }

    const slug = data.slug?.trim() ? data.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : generateSlug(data.title, data.location.city);
    const now = new Date().toISOString();

    const newProperty: any = {
      id: `prop-${Date.now()}`,
      title: data.title.trim(),
      slug,
      location: {
        address: data.location.address || '',
        city: data.location.city || 'Abuja',
        state: data.location.state || 'FCT',
        neighborhood: data.location.neighborhood || data.location.city,
        country: data.location.country || 'Nigeria',
      },
      price: Number(data.price),
      currency: data.currency || '₦',
      period: data.period || (data.status === 'For Rent' ? 'year' : undefined),
      status: data.status || 'For Sale',
      type: data.type || 'Villa',
      transactionType: data.transactionType || (data.status === 'For Rent' ? 'For Rent' : 'For Sale'),
      bedrooms: Number(data.bedrooms || 0),
      bathrooms: Number(data.bathrooms || 0),
      parkingSpaces: Number(data.parkingSpaces || 0),
      sizeSqm: Number(data.sizeSqm || 0),
      featured: Boolean(data.featured),
      published: data.published !== false,
      verified: Boolean(data.verified !== false),
      shortDescription: data.shortDescription || '',
      fullDescription: data.fullDescription || '',
      images: Array.isArray(data.images) && data.images.length > 0 ? data.images : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'],
      mainImage: data.mainImage || (data.images && data.images[0]) || '',
      features: Array.isArray(data.features) ? data.features : [],
      yearBuilt: Number(data.yearBuilt || new Date().getFullYear()),
      agent: data.agent || {
        name: 'Galaxy Luxury Specialist',
        title: 'Senior Property Advisor',
        phone: '08066154568',
        whatsapp: '2348066154568',
        email: 'info@galaxyrealestate.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        verified: true,
      },
      virtualTourAvailable: Boolean(data.virtualTourAvailable),
      seo: data.seo || {
        title: `${data.title} | Galaxy Real Estate`,
        description: data.shortDescription,
      },
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection('properties').insertOne(newProperty);
    const createdId = result.insertedId.toString();

    await logActivity(
      'Property Created',
      req.user?.name || 'Admin',
      `Created property "${newProperty.title}" at ₦${newProperty.price.toLocaleString()}`,
      `Property: ${newProperty.title}`
    );

    return res.status(201).json({
      success: true,
      message: 'Property created successfully.',
      data: { ...newProperty, _id: createdId },
    });
  } catch (error: any) {
    console.error('Error creating property:', error);
    return res.status(500).json({ success: false, error: 'Failed to create property in database.' });
  }
});

// PUT /api/admin/properties/:id - Update property
propertiesRouter.put('/admin/:id', requireAdmin, async (req: AuthRequest, res) => {
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
    const existing = await db.collection('properties').findOne(query);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Property not found.' });
    }

    const cleanedUpdates: any = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    delete cleanedUpdates._id;
    delete cleanedUpdates.id;

    if (cleanedUpdates.price) cleanedUpdates.price = Number(cleanedUpdates.price);
    if (cleanedUpdates.bedrooms) cleanedUpdates.bedrooms = Number(cleanedUpdates.bedrooms);
    if (cleanedUpdates.bathrooms) cleanedUpdates.bathrooms = Number(cleanedUpdates.bathrooms);
    if (cleanedUpdates.parkingSpaces) cleanedUpdates.parkingSpaces = Number(cleanedUpdates.parkingSpaces);
    if (cleanedUpdates.sizeSqm) cleanedUpdates.sizeSqm = Number(cleanedUpdates.sizeSqm);
    if (cleanedUpdates.images && cleanedUpdates.images.length > 0 && !cleanedUpdates.mainImage) {
      cleanedUpdates.mainImage = cleanedUpdates.images[0];
    }

    await db.collection('properties').updateOne(query, { $set: cleanedUpdates });

    await logActivity(
      'Property Edited',
      req.user?.name || 'Admin',
      `Updated details for "${existing.title}"`,
      `Property: ${existing.title}`
    );

    return res.json({
      success: true,
      message: 'Property updated successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update property.' });
  }
});

// DELETE /api/admin/properties/:id - Delete property
propertiesRouter.delete('/admin/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const db = getDb();

    const query: any = {
      $or: [
        { id: id },
        ...(ObjectId.isValid(id) ? [{ _id: new ObjectId(id) }] : [])
      ]
    };
    const existing = await db.collection('properties').findOne(query);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Property not found.' });
    }

    await db.collection('properties').deleteOne(query);

    await logActivity(
      'Property Deleted',
      req.user?.name || 'Admin',
      `Deleted property "${existing.title}"`,
      `Property: ${existing.title}`
    );

    return res.json({
      success: true,
      message: `Property "${existing.title}" deleted successfully.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete property.' });
  }
});

// POST /api/admin/properties/:id/duplicate - Duplicate property
propertiesRouter.post('/admin/:id/duplicate', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const db = getDb();

    const query: any = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id };
    const existing = await db.collection('properties').findOne(query);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Original property not found.' });
    }

    const copy = { ...existing };
    delete copy._id;
    copy.id = `prop-${Date.now()}`;
    copy.title = `${existing.title} (Copy)`;
    copy.slug = generateSlug(copy.title, existing.location?.city);
    copy.published = false; // start as draft
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();

    const result = await db.collection('properties').insertOne(copy);

    await logActivity(
      'Property Duplicated',
      req.user?.name || 'Admin',
      `Duplicated "${existing.title}" as draft copy`,
      `Property: ${copy.title}`
    );

    return res.status(201).json({
      success: true,
      message: 'Property duplicated successfully as draft.',
      data: { ...copy, _id: result.insertedId.toString() },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to duplicate property.' });
  }
});
