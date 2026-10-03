'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import {
  ReminderPreferences,
  UpdateReminderPreferencesInput,
  InAppReminderItem,
  NotificationPermissionState,
  ReminderType,
} from '@/types';
import { useAuth } from './AuthContext';
import { useCycleData } from './CycleDataContext';
import { createClient } from '@/lib/supabase/client';
import {
  getReminderPreferences,
  upsertReminderPreferences,
  savePushSubscription,
  deactivatePushSubscription,
  DEFAULT_REMINDER_PREFERENCES,
} from '@/lib/supabase/reminders';
import {
  isPushSupported,
  getNotificationPermissionState,
  subscribeToWebPush,
  unsubscribeFromWebPush,
  getExistingPushSubscription,
  registerServiceWorker,
} from '@/lib/notifications/webPush';
import {
  evaluateAllReminders,
  NOTIFICATION_TEMPLATES,
} from '@/lib/notifications/evaluator';

interface ReminderContextType {
  preferences: ReminderPreferences;
  isLoadingPreferences: boolean;
  updatePreferences: (updates: UpdateReminderPreferencesInput) => Promise<{ success: boolean; error?: string }>;
  
  // Push Notification Controls
  pushPermissionStatus: NotificationPermissionState;
  isPushSubscribed: boolean;
  isPushSupported: boolean;
  enableWebPush: () => Promise<{ success: boolean; error?: string }>;
  disableWebPush: () => Promise<{ success: boolean; error?: string }>;
  
  // In-App Reminders
  activeInAppReminders: InAppReminderItem[];
  dismissReminder: (id: string) => void;
  simulateNotificationPreview: (type: ReminderType) => void;
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export const ReminderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const {
    dailyLogs,
    cycleRecords,
    nextPeriodPrediction,
    isDemoMode,
    showToast,
  } = useCycleData();
  const supabase = createClient();

  // Local preferences state
  const [preferences, setPreferences] = useState<ReminderPreferences>({
    ...DEFAULT_REMINDER_PREFERENCES,
    timezone: profile?.timezone || 'UTC',
  });
  const [isLoadingPreferences, setIsLoadingPreferences] = useState<boolean>(true);

  // Push notification device state
  const [pushPermissionStatus, setPushPermissionStatus] = useState<NotificationPermissionState>('unsupported');
  const [isPushSubscribed, setIsPushSubscribed] = useState<boolean>(false);
  const [dismissedReminderIds, setDismissedReminderIds] = useState<string[]>([]);

  // 1. Initialize permission state & service worker on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const state = getNotificationPermissionState();
      setPushPermissionStatus(state);

      if (isPushSupported()) {
        registerServiceWorker();
        getExistingPushSubscription().then((sub) => {
          setIsPushSubscribed(!!sub);
        });
      }
    }
  }, []);

  // 2. Fetch or initialize preferences
  useEffect(() => {
    let isMounted = true;

    async function loadPreferences() {
      if (isDemoMode || !user) {
        if (isMounted) {
          setPreferences({
            ...DEFAULT_REMINDER_PREFERENCES,
            timezone: profile?.timezone || 'UTC',
          });
          setIsLoadingPreferences(false);
        }
        return;
      }

      setIsLoadingPreferences(true);
      try {
        const saved = await getReminderPreferences(supabase, user.id);
        if (isMounted) {
          if (saved) {
            setPreferences(saved);
          } else {
            // Default preferences if none saved yet
            setPreferences({
              ...DEFAULT_REMINDER_PREFERENCES,
              timezone: profile?.timezone || 'UTC',
            });
          }
        }
      } catch (err) {
        console.error('Error loading reminder preferences:', err);
      } finally {
        if (isMounted) {
          setIsLoadingPreferences(false);
        }
      }
    }

    loadPreferences();

    return () => {
      isMounted = false;
    };
  }, [user, isDemoMode, profile?.timezone]);

  // 3. Update preferences
  const updatePreferencesHandler = useCallback(
    async (updates: UpdateReminderPreferencesInput): Promise<{ success: boolean; error?: string }> => {
      const nextPreferences = { ...preferences, ...updates };
      setPreferences(nextPreferences);

      if (isDemoMode) {
        showToast('Reminder preferences updated (Demo Mode)');
        return { success: true };
      }

      if (!user) {
        return { success: false, error: 'User must be signed in to save preferences.' };
      }

      try {
        const result = await upsertReminderPreferences(supabase, user.id, updates);
        if (result) {
          setPreferences(result);
        }
        showToast('Reminder preferences saved');
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to save reminder preferences.';
        showToast(msg);
        return { success: false, error: msg };
      }
    },
    [preferences, isDemoMode, user, supabase, showToast]
  );

  // 4. Enable Web Push
  const enableWebPush = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (isDemoMode) {
      setIsPushSubscribed(true);
      setPushPermissionStatus('granted');
      showToast('Simulated Push enabled for this demo session');
      return { success: true };
    }

    if (!isPushSupported()) {
      return { success: false, error: 'Web Push is not supported on this browser.' };
    }

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      showToast('VAPID public key not configured on server.');
      return {
        success: false,
        error:
          'Web Push server keys are not yet configured in environment variables (NEXT_PUBLIC_VAPID_PUBLIC_KEY). In-app reminders remain active.',
      };
    }

    try {
      const { subscription, error } = await subscribeToWebPush(vapidKey);
      if (error || !subscription) {
        const currentPerm = getNotificationPermissionState();
        setPushPermissionStatus(currentPerm);
        return { success: false, error: error || 'Failed to subscribe to Web Push.' };
      }

      // Save subscription in Supabase
      if (user) {
        await savePushSubscription(supabase, user.id, subscription);
      }

      setIsPushSubscribed(true);
      setPushPermissionStatus('granted');
      showToast('Web Push notifications enabled');
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error enabling push notifications.';
      return { success: false, error: msg };
    }
  }, [isDemoMode, user, supabase, showToast]);

  // 5. Disable Web Push
  const disableWebPush = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (isDemoMode) {
      setIsPushSubscribed(false);
      showToast('Simulated Push disabled (Demo Mode)');
      return { success: true };
    }

    try {
      const { success, endpoint } = await unsubscribeFromWebPush();
      if (user && endpoint) {
        await deactivatePushSubscription(supabase, user.id, endpoint);
      }
      setIsPushSubscribed(false);
      showToast('Web Push notifications disabled');
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to disable Web Push.';
      return { success: false, error: msg };
    }
  }, [isDemoMode, user, supabase, showToast]);

  // 6. Dismiss In-App Reminder
  const dismissReminder = useCallback((id: string) => {
    setDismissedReminderIds((prev) => [...prev, id]);
  }, []);

  // 7. Simulated Notification Preview
  const simulateNotificationPreview = useCallback(
    (type: ReminderType) => {
      const template = NOTIFICATION_TEMPLATES[type];
      showToast(`Preview: "${template.title} — ${template.body}"`);

      // If browser permission is granted and supported, show a native test notification
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(template.title, {
            body: template.body,
            icon: '/icons/icon-192.svg',
            badge: '/icons/badge-72.svg',
            tag: 'oviare-preview',
          });
        } catch (e) {
          // Some mobile browsers require service worker showNotification
          console.warn('Native notification preview error:', e);
        }
      }
    },
    [showToast]
  );

  // 8. Compute active in-app reminders
  const activeInAppReminders = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return evaluateAllReminders({
      preferences,
      todayDateStr: todayStr,
      dailyLogs,
      cycleRecords,
      prediction: nextPeriodPrediction,
      dismissedReminderIds,
    });
  }, [preferences, dailyLogs, cycleRecords, nextPeriodPrediction, dismissedReminderIds]);

  const value = {
    preferences,
    isLoadingPreferences,
    updatePreferences: updatePreferencesHandler,
    pushPermissionStatus,
    isPushSubscribed,
    isPushSupported: isPushSupported(),
    enableWebPush,
    disableWebPush,
    activeInAppReminders,
    dismissReminder,
    simulateNotificationPreview,
  };

  return <ReminderContext.Provider value={value}>{children}</ReminderContext.Provider>;
};

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error('useReminders must be used within a ReminderProvider');
  }
  return context;
};
