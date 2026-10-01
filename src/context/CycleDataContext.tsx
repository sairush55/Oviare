'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import {
  DailyLogEntry,
  UserPreferences,
  CycleRecord,
} from '@/types';
import { useAuth } from './AuthContext';
import { createClient } from '@/lib/supabase/client';
import {
  getCycleRecords,
  createCycleRecord,
  updateCycleRecord,
  deleteCycleRecord,
} from '@/lib/supabase/cycles';
import {
  buildCycleHistory,
  calculateCycleStats,
  predictNextPeriod,
  getCurrentCycleDay,
  validatePeriodDates,
  hasDateConflict,
  CycleHistoryItem,
  CycleStats,
  PredictionResult,
} from '@/lib/cycle/calculations';

// Sample demonstration daily entries (Phase 1)
const INITIAL_SAMPLE_ENTRIES: DailyLogEntry[] = [
  {
    id: 'sample-1',
    date: '2026-09-08',
    flow: 'medium',
    symptoms: ['cramps', 'fatigue'],
    moods: ['sensitive', 'low_energy'],
    sleepHours: 7,
    energy: 'low',
    notes: 'Mild lower abdomen cramps in the morning.',
    isPrototypeSample: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    date: '2026-09-09',
    flow: 'heavy',
    symptoms: ['cramps', 'bloating'],
    moods: ['low_energy'],
    sleepHours: 6.5,
    energy: 'low',
    isPrototypeSample: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    date: '2026-09-10',
    flow: 'medium',
    symptoms: ['tender_breasts'],
    moods: ['balanced'],
    sleepHours: 8,
    energy: 'moderate',
    isPrototypeSample: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-4',
    date: '2026-09-11',
    flow: 'light',
    symptoms: [],
    moods: ['calm'],
    sleepHours: 8,
    energy: 'moderate',
    isPrototypeSample: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-5',
    date: '2026-09-12',
    flow: 'spotting',
    symptoms: [],
    moods: ['happy'],
    sleepHours: 8.5,
    energy: 'high',
    isPrototypeSample: true,
    createdAt: new Date().toISOString(),
  },
];

// Sample demonstration cycle records (Phase 3)
export const INITIAL_SAMPLE_CYCLE_RECORDS: CycleRecord[] = [
  {
    id: 'sample-cycle-1',
    user_id: 'demo-user',
    period_start: '2026-07-16',
    period_end: '2026-07-20',
    flow_intensity: 'medium',
    notes: 'Initial recorded period',
    created_at: '2026-07-16T08:00:00Z',
    updated_at: '2026-07-20T08:00:00Z',
  },
  {
    id: 'sample-cycle-2',
    user_id: 'demo-user',
    period_start: '2026-08-13',
    period_end: '2026-08-17',
    flow_intensity: 'heavy',
    notes: '28-day cycle interval, typical flow',
    created_at: '2026-08-13T08:00:00Z',
    updated_at: '2026-08-17T08:00:00Z',
  },
  {
    id: 'sample-cycle-3',
    user_id: 'demo-user',
    period_start: '2026-09-08',
    period_end: '2026-09-12',
    flow_intensity: 'medium',
    notes: '26-day cycle interval, regular transition',
    created_at: '2026-09-08T08:00:00Z',
    updated_at: '2026-09-12T08:00:00Z',
  },
];

interface CycleDataContextType {
  // Session Daily logs (Phase 1)
  entries: DailyLogEntry[];
  preferences: UserPreferences;
  demoMode: boolean;
  toastMessage: string | null;
  addLogEntry: (entry: Omit<DailyLogEntry, 'id' | 'createdAt'>) => void;
  getEntryForDate: (date: string) => DailyLogEntry | undefined;
  setDemoMode: (enabled: boolean) => void;
  clearTemporaryData: () => void;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => void;
  showToast: (msg: string) => void;
  hideToast: () => void;

  // Real Cycle Records & Engine (Phase 3)
  cycleRecords: CycleRecord[];
  isLoadingCycles: boolean;
  cycleHistory: CycleHistoryItem[];
  cycleStats: CycleStats;
  nextPeriodPrediction: PredictionResult;
  currentCycleDay: number | null;
  refreshCycles: () => Promise<void>;
  addPeriod: (input: {
    period_start: string;
    period_end?: string | null;
    flow_intensity?: 'light' | 'medium' | 'heavy' | 'spotting' | null;
    notes?: string | null;
  }) => Promise<{ success: boolean; error?: string }>;
  editPeriod: (
    id: string,
    updates: {
      period_start?: string;
      period_end?: string | null;
      flow_intensity?: 'light' | 'medium' | 'heavy' | 'spotting' | null;
      notes?: string | null;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  deletePeriod: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const defaultPreferences: UserPreferences = {
  averageCycleLength: 28,
  averagePeriodLength: 5,
  reminderNotifications: true,
  reminderDaysBefore: 2,
  dataSharingConsent: false,
  anonymousAnalytics: false,
};

const CycleDataContext = createContext<CycleDataContextType | undefined>(undefined);

export const CycleDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const supabase = createClient();

  // Daily entries (session state)
  const [entries, setEntries] = useState<DailyLogEntry[]>(INITIAL_SAMPLE_ENTRIES);
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistent cycle records
  const [userCycleRecords, setUserCycleRecords] = useState<CycleRecord[]>([]);
  const [sampleCycleRecords, setSampleCycleRecords] = useState<CycleRecord[]>(INITIAL_SAMPLE_CYCLE_RECORDS);
  const [isLoadingCycles, setIsLoadingCycles] = useState<boolean>(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  const hideToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  // Fetch real cycle records from Supabase when user changes
  const fetchUserCycles = useCallback(async () => {
    if (!user) {
      setUserCycleRecords([]);
      return;
    }

    try {
      setIsLoadingCycles(true);
      const records = await getCycleRecords(supabase, user.id);
      setUserCycleRecords(records);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to load cycle records';
      console.error('Error in fetchUserCycles:', errMsg);
    } finally {
      setIsLoadingCycles(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchUserCycles();
  }, [fetchUserCycles]);

  // Determine active cycle records based on demo mode and user auth
  const activeCycleRecords = useMemo(() => {
    if (user && !demoMode) {
      return userCycleRecords;
    }
    if (demoMode) {
      return sampleCycleRecords;
    }
    return userCycleRecords;
  }, [user, demoMode, userCycleRecords, sampleCycleRecords]);

  // Pure cycle calculations engine outputs
  const cycleHistory = useMemo(() => {
    return buildCycleHistory(activeCycleRecords);
  }, [activeCycleRecords]);

  const cycleStats = useMemo(() => {
    return calculateCycleStats(cycleHistory);
  }, [cycleHistory]);

  const nextPeriodPrediction = useMemo(() => {
    return predictNextPeriod(activeCycleRecords, cycleStats);
  }, [activeCycleRecords, cycleStats]);

  // System reference date for prototype: 2026-10-01
  const cycleDayInfo = useMemo(() => {
    return getCurrentCycleDay(activeCycleRecords, '2026-10-01');
  }, [activeCycleRecords]);

  // Add a new period log
  const addPeriod = async (input: {
    period_start: string;
    period_end?: string | null;
    flow_intensity?: 'light' | 'medium' | 'heavy' | 'spotting' | null;
    notes?: string | null;
  }): Promise<{ success: boolean; error?: string }> => {
    const periodEnd = input.period_end ?? null;

    // 1. Validate dates
    const dateValidation = validatePeriodDates(input.period_start, periodEnd);
    if (!dateValidation.isValid) {
      return { success: false, error: dateValidation.error };
    }

    // 2. Validate against existing records for conflicts/overlaps
    const recordsToCheck = demoMode ? sampleCycleRecords : userCycleRecords;
    const conflict = hasDateConflict(input.period_start, periodEnd, recordsToCheck);
    if (conflict.hasConflict) {
      return { success: false, error: conflict.reason };
    }

    // 3. Save to Supabase if authenticated and not in demo mode
    if (user && !demoMode) {
      try {
        const created = await createCycleRecord(supabase, {
          user_id: user.id,
          period_start: input.period_start,
          period_end: input.period_end || null,
          flow_intensity: input.flow_intensity || null,
          notes: input.notes?.trim() || null,
        });

        setUserCycleRecords((prev) =>
          [...prev, created].sort((a, b) => a.period_start.localeCompare(b.period_start))
        );
        showToast('Period recorded successfully');
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to save period';
        return { success: false, error: msg };
      }
    }

    // 4. In demo mode or guest mode: update local state
    const localRecord: CycleRecord = {
      id: `local-cycle-${Date.now()}`,
      user_id: user?.id || 'demo-user',
      period_start: input.period_start,
      period_end: input.period_end || null,
      flow_intensity: input.flow_intensity || null,
      notes: input.notes?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (demoMode) {
      setSampleCycleRecords((prev) =>
        [...prev, localRecord].sort((a, b) => a.period_start.localeCompare(b.period_start))
      );
    } else {
      setUserCycleRecords((prev) =>
        [...prev, localRecord].sort((a, b) => a.period_start.localeCompare(b.period_start))
      );
    }

    showToast('Period recorded (local state)');
    return { success: true };
  };

  // Edit an existing period log
  const editPeriod = async (
    id: string,
    updates: {
      period_start?: string;
      period_end?: string | null;
      flow_intensity?: 'light' | 'medium' | 'heavy' | 'spotting' | null;
      notes?: string | null;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    // 1. Validate dates if start date changed
    if (updates.period_start) {
      const periodEnd = updates.period_end ?? null;
      const dateValidation = validatePeriodDates(updates.period_start, periodEnd);
      if (!dateValidation.isValid) {
        return { success: false, error: dateValidation.error };
      }

      // Check conflict excluding the edited record itself
      const recordsToCheck = demoMode ? sampleCycleRecords : userCycleRecords;
      const conflict = hasDateConflict(updates.period_start, periodEnd, recordsToCheck, id);
      if (conflict.hasConflict) {
        return { success: false, error: conflict.reason };
      }
    }

    // 2. Persist update in Supabase if authenticated and not demo
    if (user && !demoMode) {
      try {
        const updated = await updateCycleRecord(supabase, id, user.id, updates);
        setUserCycleRecords((prev) =>
          prev
            .map((r) => (r.id === id ? updated : r))
            .sort((a, b) => a.period_start.localeCompare(b.period_start))
        );
        showToast('Period record updated');
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to update period';
        return { success: false, error: msg };
      }
    }

    // 3. Local update in demo mode
    const updater = (prev: CycleRecord[]) =>
      prev
        .map((r) => {
          if (r.id !== id) return r;
          return {
            ...r,
            ...updates,
            period_end: updates.period_end === undefined ? r.period_end : updates.period_end,
            notes: updates.notes === undefined ? r.notes : updates.notes,
            updated_at: new Date().toISOString(),
          };
        })
        .sort((a, b) => a.period_start.localeCompare(b.period_start));

    if (demoMode) {
      setSampleCycleRecords(updater);
    } else {
      setUserCycleRecords(updater);
    }

    showToast('Period record updated');
    return { success: true };
  };

  // Delete an existing period log
  const deletePeriod = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (user && !demoMode) {
      try {
        await deleteCycleRecord(supabase, id, user.id);
        setUserCycleRecords((prev) => prev.filter((r) => r.id !== id));
        showToast('Period record removed');
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to delete period';
        return { success: false, error: msg };
      }
    }

    if (demoMode) {
      setSampleCycleRecords((prev) => prev.filter((r) => r.id !== id));
    } else {
      setUserCycleRecords((prev) => prev.filter((r) => r.id !== id));
    }

    showToast('Period record removed');
    return { success: true };
  };

  // Daily symptom log handlers
  const addLogEntry = (newEntryData: Omit<DailyLogEntry, 'id' | 'createdAt'>) => {
    const newEntry: DailyLogEntry = {
      ...newEntryData,
      id: `session-log-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isPrototypeSample: false,
    };

    setEntries((prev) => {
      const filtered = prev.filter((item) => item.date !== newEntry.date);
      return [newEntry, ...filtered];
    });

    showToast(`Logged symptoms for ${newEntry.date} (session state)`);
  };

  const getEntryForDate = (date: string): DailyLogEntry | undefined => {
    const activeEntries = demoMode ? entries : entries.filter((e) => !e.isPrototypeSample);
    return activeEntries.find((entry) => entry.date === date);
  };

  const clearTemporaryData = () => {
    setEntries([]);
    showToast('All temporary session data cleared');
  };

  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...newPrefs }));
    showToast('Preferences updated (session only)');
  };

  return (
    <CycleDataContext.Provider
      value={{
        entries: demoMode ? entries : entries.filter((e) => !e.isPrototypeSample),
        preferences,
        demoMode,
        toastMessage,
        addLogEntry,
        getEntryForDate,
        setDemoMode,
        clearTemporaryData,
        updatePreferences,
        showToast,
        hideToast,

        // Cycle Tracking (Phase 3)
        cycleRecords: activeCycleRecords,
        isLoadingCycles,
        cycleHistory,
        cycleStats,
        nextPeriodPrediction,
        currentCycleDay: cycleDayInfo.currentCycleDay,
        refreshCycles: fetchUserCycles,
        addPeriod,
        editPeriod,
        deletePeriod,
      }}
    >
      {children}
    </CycleDataContext.Provider>
  );
};

export const useCycleData = () => {
  const context = useContext(CycleDataContext);
  if (!context) {
    throw new Error('useCycleData must be used within a CycleDataProvider');
  }
  return context;
};
