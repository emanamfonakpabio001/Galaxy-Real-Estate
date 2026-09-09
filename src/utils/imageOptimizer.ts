/**
 * Client-side image optimization helper.
 * Downsamples high-resolution smartphone / DSLR camera photos (e.g. 10MB+ 4000x3000px)
 * to crisp web-optimized dimensions (max 2048px) and clean JPEG quality,
 * shrinking files from 10MB down to ~400-800KB before network transfer.
 * This prevents Cloud Run / reverse proxy 32MB payload drops and "Failed to fetch" errors.
 */

export async function optimizeImageForWeb(
  file: File,
  maxDimension: number = 2048,
  quality: number = 0.88
): Promise<File> {
  // If file is not an image or is SVG/GIF (which we shouldn't raster-compress), return as is
  const fileType = (file.type || '').toLowerCase();
  const fileName = (file.name || '').toLowerCase();
  
  if (
    fileType === 'image/svg+xml' ||
    fileType === 'image/gif' ||
    fileName.endsWith('.svg') ||
    fileName.endsWith('.gif')
  ) {
    return file;
  }

  // If already very lightweight (under 300KB), no need to compress
  if (file.size < 300 * 1024) {
    return file;
  }

  try {
    return await new Promise<File>((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        let { width, height } = img;

        // Check if downsampling is needed
        if (width <= maxDimension && height <= maxDimension && file.size < 1.5 * 1024 * 1024) {
          // If dimensions are within bounds and file size is reasonable, keep original
          resolve(file);
          return;
        }

        // Calculate proportional scale
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Enable high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG (universal support across all browsers)
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // If canvas compression didn't save size, keep original
              resolve(file);
              return;
            }

            // Create a clean filename ending with .jpg
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            const optimizedFile = new File([blob], `${baseName}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            resolve(optimizedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        // Fall back to original file if image element fails
        resolve(file);
      };

      img.src = objectUrl;
    });
  } catch (err) {
    console.warn('Image optimization skipped:', err);
    return file;
  }
}
