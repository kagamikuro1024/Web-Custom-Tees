import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 🚀 usePrefetch Hook
 * Pre-fetch data/components khi user hover vào link
 * Cải thiện perceived performance
 */

const prefetchedRoutes = new Set();

/**
 * Hook để prefetch route components
 * @param {string} path - Đường dẫn cần prefetch
 * @returns {object} - Handlers cho onMouseEnter và onTouchStart
 */
export const usePrefetch = (path) => {
  const navigate = useNavigate();

  const prefetch = () => {
    if (!path || prefetchedRoutes.has(path)) return;

    // Đánh dấu đã prefetch để không prefetch lại
    prefetchedRoutes.add(path);

    // Tạo invisible link để trigger prefetch
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = path;
    link.as = 'document';
    document.head.appendChild(link);

    // Log để debug (có thể tắt trong production)
    if (import.meta.env.DEV) {
      console.log(`[Prefetch] Prefetching route: ${path}`);
    }
  };

  return {
    onMouseEnter: prefetch,
    onTouchStart: prefetch, // Mobile support
  };
};

/**
 * Hook để prefetch API data
 * @param {Function} fetchFn - Hàm fetch data
 * @param {boolean} enabled - Bật/tắt prefetch
 */
export const usePrefetchData = (fetchFn, enabled = false) => {
  useEffect(() => {
    if (!enabled || !fetchFn) return;

    const timer = setTimeout(() => {
      fetchFn().catch(err => {
        console.warn('[Prefetch] Failed to prefetch data:', err);
      });
    }, 100); // Delay nhỏ để không block main thread

    return () => clearTimeout(timer);
  }, [fetchFn, enabled]);
};

/**
 * Prefetch images
 * @param {string[]} imageUrls - Mảng URLs ảnh cần prefetch
 */
export const prefetchImages = (imageUrls) => {
  if (!Array.isArray(imageUrls)) return;

  imageUrls.forEach(url => {
    if (!url) return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'image';
    document.head.appendChild(link);
  });
};

/**
 * Cleanup prefetched routes (optional)
 */
export const clearPrefetchCache = () => {
  prefetchedRoutes.clear();
};
