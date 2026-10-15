import { describe, it } from 'node:test';
import assert from 'node:assert';
import { shouldBypassCache, isStaticCacheableAsset } from '../cacheRules';

describe('Phase 6: PWA Cache Boundaries & Privacy Protection', () => {
  describe('Sensitive Route Exclusions (Must Bypass Cache)', () => {
    it('bypasses external Supabase database requests', () => {
      const url = 'https://rjbpkcdvdegvaiaewhjw.supabase.co/rest/v1/daily_logs?select=*';
      assert.strictEqual(shouldBypassCache('GET', url), true);
    });

    it('bypasses Supabase authentication endpoints', () => {
      const url = 'https://rjbpkcdvdegvaiaewhjw.supabase.co/auth/v1/user';
      assert.strictEqual(shouldBypassCache('GET', url), true);
    });

    it('bypasses internal user data export API', () => {
      const url = 'https://oviare.app/api/user/export?format=json';
      assert.strictEqual(shouldBypassCache('GET', url), true);
    });

    it('bypasses internal account deletion API', () => {
      const url = 'https://oviare.app/api/user/delete';
      assert.strictEqual(shouldBypassCache('POST', url), true);
    });

    it('bypasses automated reminders push route', () => {
      const url = 'https://oviare.app/api/reminders/send';
      assert.strictEqual(shouldBypassCache('GET', url), true);
    });

    it('bypasses OAuth and email verification callback routes', () => {
      const url = 'https://oviare.app/auth/callback?code=xyz';
      assert.strictEqual(shouldBypassCache('GET', url), true);
    });

    it('bypasses any mutation method (POST, PUT, DELETE, PATCH)', () => {
      assert.strictEqual(shouldBypassCache('POST', 'https://oviare.app/dashboard'), true);
      assert.strictEqual(shouldBypassCache('DELETE', 'https://oviare.app/log'), true);
      assert.strictEqual(shouldBypassCache('PUT', 'https://oviare.app/profile'), true);
    });

    it('bypasses any request bearing an authorization header', () => {
      assert.strictEqual(shouldBypassCache('GET', 'https://oviare.app/dashboard', true), true);
    });
  });

  describe('Non-Sensitive Static Asset Whitelist', () => {
    it('allows Next.js immutable static build assets', () => {
      assert.strictEqual(
        isStaticCacheableAsset('/_next/static/chunks/main-app-12345.js'),
        true
      );
      assert.strictEqual(
        isStaticCacheableAsset('/_next/static/css/app-style-67890.css'),
        true
      );
    });

    it('allows branded application icons and manifest', () => {
      assert.strictEqual(isStaticCacheableAsset('/icons/icon-192.png'), true);
      assert.strictEqual(isStaticCacheableAsset('/icons/icon-512.png'), true);
      assert.strictEqual(isStaticCacheableAsset('/icons/badge-72.svg'), true);
      assert.strictEqual(isStaticCacheableAsset('/manifest.json'), true);
    });

    it('allows standalone offline fallback page', () => {
      assert.strictEqual(isStaticCacheableAsset('/offline.html'), true);
    });

    it('rejects dynamic HTML pages from static asset cache', () => {
      assert.strictEqual(isStaticCacheableAsset('/dashboard'), false);
      assert.strictEqual(isStaticCacheableAsset('/log'), false);
      assert.strictEqual(isStaticCacheableAsset('/insights'), false);
      assert.strictEqual(isStaticCacheableAsset('/profile'), false);
    });
  });
});
