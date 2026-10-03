import { CreatePushSubscriptionInput, NotificationPermissionState } from '@/types';

/**
 * Converts a URL-safe Base64 encoded string to a Uint8Array
 * required by the browser's PushManager.subscribe({ applicationServerKey })
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Checks if the current browser and operating system support Web Push
 */
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Detects if the device is running iOS or iPadOS
 */
export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return (
    /iphone|ipad|ipod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Detects if the web application is running as an installed PWA (Home Screen)
 */
export function isInstalledPWA(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandaloneMatch = window.matchMedia('(display-mode: standalone)').matches;
  const isNavStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return isStandaloneMatch || isNavStandalone;
}

/**
 * Evaluates the current notification permission state including iOS PWA requirements
 */
export function getNotificationPermissionState(): NotificationPermissionState {
  if (!isPushSupported()) {
    // If iOS device and not installed to home screen, push requires installation on iOS 16.4+
    if (isIOSDevice() && !isInstalledPWA()) {
      return 'needs_install';
    }
    return 'unsupported';
  }

  // iOS 16.4+ explicitly requires standalone mode before push notifications can be requested
  if (isIOSDevice() && !isInstalledPWA()) {
    return 'needs_install';
  }

  return Notification.permission as NotificationPermissionState;
}

/**
 * Registers the Oviare service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    await navigator.serviceWorker.ready;
    return registration;
  } catch (err) {
    console.error('Failed to register Oviare service worker:', err);
    return null;
  }
}

/**
 * Requests browser permission and creates a Web Push subscription
 */
export async function subscribeToWebPush(
  vapidPublicKey: string
): Promise<{ subscription: CreatePushSubscriptionInput | null; error?: string }> {
  if (!isPushSupported()) {
    return {
      subscription: null,
      error: 'Web Push notifications are not supported in this browser.',
    };
  }

  if (isIOSDevice() && !isInstalledPWA()) {
    return {
      subscription: null,
      error:
        'On iOS devices, Web Push notifications require adding Oviare to your Home Screen first (Share → Add to Home Screen).',
    };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        subscription: null,
        error:
          permission === 'denied'
            ? 'Notification permission was denied. You can change this in your browser settings.'
            : 'Notification permission was not granted.',
      };
    }

    const registration = await registerServiceWorker();
    if (!registration) {
      return {
        subscription: null,
        error: 'Unable to initialize the background service worker.',
      };
    }

    // Subscribe using the VAPID public key
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    const pushSub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as unknown as BufferSource,
    });

    const json = pushSub.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
      return {
        subscription: null,
        error: 'Incomplete push subscription data returned by the browser.',
      };
    }

    return {
      subscription: {
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
        user_agent: navigator.userAgent,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to subscribe to Web Push.';
    console.error('Web Push subscription error:', err);
    return { subscription: null, error: message };
  }
}

/**
 * Unsubscribes the current device from browser Web Push
 */
export async function unsubscribeFromWebPush(): Promise<{ success: boolean; endpoint?: string }> {
  if (!isPushSupported()) return { success: true };

  try {
    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    if (!registration) return { success: true };

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return { success: true };

    const endpoint = subscription.endpoint;
    const unsubscribed = await subscription.unsubscribe();
    return { success: unsubscribed, endpoint };
  } catch (err) {
    console.error('Error unsubscribing from Web Push:', err);
    return { success: false };
  }
}

/**
 * Retrieves existing active push subscription if present on this device
 */
export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    if (!registration) return null;
    return await registration.pushManager.getSubscription();
  } catch {
    return null;
  }
}
