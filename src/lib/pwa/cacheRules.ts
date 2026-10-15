/**
 * Pure evaluation rules for Service Worker caching boundaries.
 * Determines which requests can safely be cached and which must bypass CacheStorage.
 */
export function shouldBypassCache(
  method: string,
  urlString: string,
  hasAuthHeader: boolean = false
): boolean {
  if (method !== 'GET') return true;
  if (hasAuthHeader) return true;

  try {
    const parsedUrl = new URL(urlString, 'https://oviare.app');
    const hostname = parsedUrl.hostname.toLowerCase();
    const pathname = parsedUrl.pathname.toLowerCase();

    // Supabase endpoints (DB & Auth) must NEVER be stored in service worker cache
    if (hostname.includes('supabase.co')) return true;

    // Internal API routes (export, delete, push scheduler) must NEVER be cached
    if (pathname.startsWith('/api/')) return true;

    // Auth callback and session exchange routes must NEVER be cached
    if (pathname.startsWith('/auth/')) return true;

    return false;
  } catch {
    return true; // Fail closed if URL is malformed
  }
}

export function isStaticCacheableAsset(urlString: string): boolean {
  try {
    const parsedUrl = new URL(urlString, 'https://oviare.app');
    const pathname = parsedUrl.pathname.toLowerCase();

    return (
      pathname.startsWith('/_next/static/') ||
      pathname.startsWith('/icons/') ||
      pathname.endsWith('.svg') ||
      pathname.endsWith('.png') ||
      pathname.endsWith('.jpg') ||
      pathname.endsWith('.jpeg') ||
      pathname.endsWith('.webp') ||
      pathname.endsWith('.ico') ||
      pathname.endsWith('.css') ||
      pathname.endsWith('.js') ||
      pathname === '/manifest.json' ||
      pathname === '/offline.html'
    );
  } catch {
    return false;
  }
}
