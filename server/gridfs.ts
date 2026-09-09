import { ObjectId } from 'mongodb';
import { Readable } from 'stream';
import { getGridFSBucket, getDb } from './db';
import { MediaFileMetadata } from '../src/types';

export interface UploadImageOptions {
  filename: string;
  contentType: string;
  category?: MediaFileMetadata['category'];
  altText?: string;
  caption?: string;
  propertyId?: string;
  originalFileId?: string;
  editedFromFileId?: string;
}

export class GridFSService {
  /**
   * Upload image buffer to MongoDB GridFS
   */
  static async uploadImage(buffer: Buffer, options: UploadImageOptions): Promise<{ fileId: string; metadata: MediaFileMetadata }> {
    const bucket = getGridFSBucket();
    const db = getDb();

    // Sanitize filename and create unique safe name
    const timestamp = Date.now();
    const cleanName = options.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFilename = `${timestamp}_${cleanName}`;

    return new Promise((resolve, reject) => {
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);

      const uploadStream = bucket.openUploadStream(uniqueFilename, {
        metadata: {
          contentType: options.contentType,
          originalName: options.filename,
          category: options.category || 'Property',
          propertyId: options.propertyId,
          altText: options.altText || '',
          caption: options.caption || '',
          originalFileId: options.originalFileId,
          editedFromFileId: options.editedFromFileId,
          uploadDate: new Date().toISOString(),
        },
      });

      readableStream.pipe(uploadStream)
        .on('error', (error) => {
          console.error('GridFS upload error:', error);
          reject(error);
        })
        .on('finish', async () => {
          const fileId = uploadStream.id.toString();
          const metadataRecord: MediaFileMetadata = {
            id: fileId,
            fileId,
            filename: uniqueFilename,
            contentType: options.contentType,
            size: buffer.length,
            uploadDate: new Date().toISOString(),
            category: options.category || 'Property',
            altText: options.altText || '',
            caption: options.caption || '',
            propertyId: options.propertyId,
            originalFileId: options.originalFileId,
            editedFromFileId: options.editedFromFileId,
            url: `/api/media/${fileId}`,
            usedBy: options.propertyId ? [`Property: ${options.propertyId}`] : [],
          };

          try {
            await db.collection('mediaMetadata').insertOne(metadataRecord as any);
            resolve({ fileId, metadata: metadataRecord });
          } catch (dbErr) {
            console.error('Error saving media metadata:', dbErr);
            resolve({ fileId, metadata: metadataRecord });
          }
        });
    });
  }

  /**
   * Stream image from GridFS by fileId
   */
  static async streamImage(fileId: string) {
    const bucket = getGridFSBucket();
    const objectId = new ObjectId(fileId);

    const files = await bucket.find({ _id: objectId }).toArray();
    if (!files || files.length === 0) {
      return null;
    }

    const file = files[0];
    const downloadStream = bucket.openDownloadStream(objectId);
    return {
      stream: downloadStream,
      filename: file.filename,
      contentType: (file.metadata as any)?.contentType || (file as any).contentType || 'image/jpeg',
      length: file.length,
    };
  }

  /**
   * Get metadata for an image
   */
  static async getImageMetadata(fileId: string): Promise<MediaFileMetadata | null> {
    const db = getDb();
    const record = await db.collection('mediaMetadata').findOne({ fileId });
    if (record) {
      return {
        id: record.fileId,
        fileId: record.fileId,
        filename: record.filename,
        contentType: record.contentType,
        size: record.size,
        uploadDate: record.uploadDate,
        category: record.category,
        altText: record.altText,
        caption: record.caption,
        propertyId: record.propertyId,
        url: `/api/media/${record.fileId}`,
        usedBy: record.usedBy || [],
      };
    }
    return null;
  }

  /**
   * List all media files
   */
  static async listMedia(category?: string, search?: string): Promise<MediaFileMetadata[]> {
    const db = getDb();
    const query: any = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (search && search.trim()) {
      query.$or = [
        { filename: { $regex: search.trim(), $options: 'i' } },
        { altText: { $regex: search.trim(), $options: 'i' } },
        { caption: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const items = await db.collection('mediaMetadata')
      .find(query)
      .sort({ uploadDate: -1 })
      .toArray();

    return items.map(item => ({
      id: item.fileId || item._id.toString(),
      fileId: item.fileId,
      filename: item.filename,
      contentType: item.contentType,
      size: item.size,
      uploadDate: item.uploadDate,
      category: item.category,
      altText: item.altText,
      caption: item.caption,
      propertyId: item.propertyId,
      originalFileId: item.originalFileId,
      editedFromFileId: item.editedFromFileId,
      url: `/api/media/${item.fileId}`,
      usedBy: item.usedBy || [],
    }));
  }

  /**
   * Delete image from GridFS and metadata collection
   */
  static async deleteImage(fileId: string): Promise<boolean> {
    const bucket = getGridFSBucket();
    const db = getDb();
    try {
      const objectId = new ObjectId(fileId);
      await bucket.delete(objectId);
      await db.collection('mediaMetadata').deleteOne({ fileId });
      return true;
    } catch (err) {
      console.error('Error deleting image from GridFS:', err);
      // Still remove from metadata if gridfs file was already removed
      await db.collection('mediaMetadata').deleteOne({ fileId });
      return false;
    }
  }

  /**
   * Update metadata
   */
  static async updateMetadata(fileId: string, updates: Partial<MediaFileMetadata>): Promise<boolean> {
    const db = getDb();
    const result = await db.collection('mediaMetadata').updateOne(
      { fileId },
      { $set: updates }
    );
    return result.matchedCount > 0;
  }
}
