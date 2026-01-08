/**
 * 🖼️ Cloudinary Image Optimization Utility
 * Tự động tối ưu hóa URL của ảnh Cloudinary
 */

/**
 * Tối ưu hóa URL ảnh Cloudinary với các transformations
 * @param {string} url - URL gốc của ảnh
 * @param {object} options - Tùy chọn transformation
 * @returns {string} URL đã được tối ưu hóa
 */
export const optimizeCloudinaryImage = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }

  const {
    width = 800,
    height = null,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto'
  } = options;

  // Xây dựng transformation string
  const transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity && crop === 'fill') transformations.push(`g_${gravity}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  const transformString = transformations.join(',');
  
  return url.replace('/upload/', `/upload/${transformString}/`);
};

/**
 * Các preset transformation phổ biến
 */
export const IMAGE_PRESETS = {
  THUMBNAIL: { width: 200, height: 200, quality: 'auto' },
  CARD: { width: 500, height: 500, quality: 'auto' },
  DETAIL: { width: 1000, height: 1000, quality: 'auto' },
  HERO: { width: 1920, height: 1080, quality: 'auto', crop: 'fill' },
  GALLERY: { width: 800, height: 800, quality: 'auto' }
};

/**
 * Tạo srcset cho responsive images
 */
export const generateSrcSet = (url, widths = [400, 800, 1200, 1600]) => {
  if (!url) return '';
  
  return widths
    .map(w => `${optimizeCloudinaryImage(url, { width: w })} ${w}w`)
    .join(', ');
};

/**
 * Placeholder LQIP (Low Quality Image Placeholder) cho lazy loading
 */
export const getLQIP = (url) => {
  return optimizeCloudinaryImage(url, { 
    width: 50, 
    quality: 'auto:low',
    effect: 'blur:1000'
  });
};
