import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { GridFSService } from '../gridfs';
import { requireAdmin, logActivity, AuthRequest } from '../auth';

export const mediaRouter = Router();

// Configure Multer with memory storage for GridFS piping
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max file size per image
    files: 25, // up to 25 files at once
  },
  fileFilter: (req, file, cb) => {
    const mime = (file.mimetype || '').toLowerCase();
    const name = (file.originalname || '').toLowerCase();
    const isImageExt = /\.(jpe?g|png|webp|avif|gif|svg|bmp|heic|heif|tiff|ico)$/i.test(name);
    const isImageMime = mime.startsWith('image/') || (mime === 'application/octet-stream' && isImageExt);

    if (isImageMime || isImageExt) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type "${file.mimetype || 'unknown'}". Only image files (JPEG, PNG, WebP, AVIF, SVG, GIF, HEIC) are accepted.`));
    }
  },
});

// Middleware to safely wrap Multer and return JSON on errors (prevents HTML error pages)
const handleMulterUpload = (req: AuthRequest, res: Response, next: NextFunction) => {
  upload.array('images', 25)(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, error: 'Image file too large. Maximum size is 25MB per image.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ success: false, error: 'Too many files uploaded. Maximum is 25 images per batch.' });
        }
        return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ success: false, error: err.message || 'Error parsing uploaded image files.' });
    }
    next();
  });
};

// ----------------------------------------------------
// ADMIN PROTECTED ROUTES (Defined FIRST to avoid route collisions)
// ----------------------------------------------------

// GET /api/media/admin/library - List all images in media library
mediaRouter.get('/admin/library', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { category, search } = req.query;
    const items = await GridFSService.listMedia(category as string, search as string);
    return res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || 'Failed to retrieve media library.' });
  }
});

// POST /api/media/admin/upload - Upload one or multiple images to GridFS
mediaRouter.post('/admin/upload', requireAdmin, handleMulterUpload, async (req: AuthRequest, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { category = 'Property', propertyId, altText, caption } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No image files provided for upload.' });
    }

    const uploaded = [];
    for (const file of files) {
      // Normalize MIME type
      let contentType = (file.mimetype || '').toLowerCase();
      if (!contentType || contentType === 'application/octet-stream' || contentType === 'image/jpg') {
        if (/\.jpe?g$/i.test(file.originalname)) contentType = 'image/jpeg';
        else if (/\.png$/i.test(file.originalname)) contentType = 'image/png';
        else if (/\.webp$/i.test(file.originalname)) contentType = 'image/webp';
        else if (/\.gif$/i.test(file.originalname)) contentType = 'image/gif';
        else if (/\.svg$/i.test(file.originalname)) contentType = 'image/svg+xml';
        else contentType = 'image/jpeg';
      }

      const result = await GridFSService.uploadImage(file.buffer, {
        filename: file.originalname,
        contentType,
        category,
        propertyId,
        altText,
        caption,
      });
      uploaded.push(result.metadata);
    }

    await logActivity(
      'Images Uploaded',
      req.user?.name || 'Admin',
      `Uploaded ${uploaded.length} image(s) to MongoDB GridFS in category "${category}"`,
      `Media Library (${category})`
    );

    return res.status(201).json({
      success: true,
      message: `${uploaded.length} image(s) stored in MongoDB GridFS successfully.`,
      data: uploaded,
    });
  } catch (error: any) {
    console.error('GridFS upload failed:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to upload image to GridFS.' });
  }
});

// POST /api/media/admin/save-edited - Save edited image from in-browser image editor
mediaRouter.post('/admin/save-edited', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { base64Data, filename, category = 'Property', originalFileId, altText } = req.body;

    if (!base64Data) {
      return res.status(400).json({ success: false, error: 'Image data is required.' });
    }

    // Extract base64 payload
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, error: 'Invalid base64 image encoding.' });
    }

    const contentType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    const result = await GridFSService.uploadImage(buffer, {
      filename: filename || `edited_image_${Date.now()}.jpg`,
      contentType,
      category,
      originalFileId,
      altText: altText || 'Edited Image',
    });

    await logActivity(
      'Image Edited',
      req.user?.name || 'Admin',
      `Applied crop/adjustments and saved new version to GridFS (${result.fileId})`,
      `Media: ${result.fileId}`
    );

    return res.status(201).json({
      success: true,
      message: 'Edited image saved to MongoDB GridFS.',
      data: result.metadata,
    });
  } catch (error: any) {
    console.error('Error saving edited image:', error);
    return res.status(500).json({ success: false, error: 'Failed to store edited image in GridFS.' });
  }
});

// PUT /api/media/admin/:fileId - Update media metadata
mediaRouter.put('/admin/:fileId', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { fileId } = req.params;
    const { altText, caption, category } = req.body;

    const updated = await GridFSService.updateMetadata(fileId, {
      altText,
      caption,
      category,
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Media record not found.' });
    }

    return res.json({ success: true, message: 'Media metadata updated successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || 'Failed to update media metadata.' });
  }
});

// DELETE /api/media/admin/:fileId - Delete image from GridFS & metadata
mediaRouter.delete('/admin/:fileId', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { fileId } = req.params;
    await GridFSService.deleteImage(fileId);

    await logActivity(
      'Image Deleted',
      req.user?.name || 'Admin',
      `Deleted file from GridFS (${fileId})`,
      `Media: ${fileId}`
    );

    return res.json({
      success: true,
      message: 'Image deleted from MongoDB GridFS successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || 'Failed to delete image.' });
  }
});

// ----------------------------------------------------
// PUBLIC STREAMING ROUTE (Defined AFTER admin routes)
// ----------------------------------------------------

// GET /api/media/:fileId - Stream image directly from MongoDB GridFS
mediaRouter.get('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Check if valid ObjectId string
    if (!fileId || fileId.length !== 24) {
      return res.status(400).json({ success: false, error: 'Invalid media file ID.' });
    }

    const fileStream = await GridFSService.streamImage(fileId);
    if (!fileStream) {
      return res.status(404).json({ success: false, error: 'Image not found in MongoDB GridFS.' });
    }

    res.set('Content-Type', fileStream.contentType);
    res.set('Content-Length', fileStream.length.toString());
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.set('Content-Disposition', `inline; filename="${fileStream.filename}"`);

    fileStream.stream.pipe(res);
  } catch (error: any) {
    console.error('Error streaming GridFS image:', error);
    return res.status(500).json({ success: false, error: 'Failed to stream media asset.' });
  }
});
