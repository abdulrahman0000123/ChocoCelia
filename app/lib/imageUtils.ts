/**
 * Image utilities for handling image uploads and compression
 */

export interface ImageUploadResult {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * Compress and convert image to base64
 */
export async function compressImage(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.8
): Promise<ImageUploadResult> {
  return new Promise((resolve) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      resolve({ success: false, error: 'File must be an image' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      resolve({ success: false, error: 'Image size must be less than 5MB' });
      return;
    }

    const reader = new FileReader();
    
    reader.onerror = () => {
      resolve({ success: false, error: 'Failed to read file' });
    };

    reader.onload = (e) => {
      const img = new Image();
      
      img.onerror = () => {
        resolve({ success: false, error: 'Failed to load image' });
      };

      img.onload = () => {
        try {
          // Calculate new dimensions
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }

          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ success: false, error: 'Failed to create canvas context' });
            return;
          }

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          
          resolve({ success: true, data: compressedBase64 });
        } catch (error) {
          resolve({ success: false, error: 'Failed to compress image' });
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Get image dimensions from base64 or URL
 */
export async function getImageDimensions(src: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = src;
  });
}

/**
 * Validate image URL
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(parsed.pathname);
  } catch {
    return false;
  }
}
