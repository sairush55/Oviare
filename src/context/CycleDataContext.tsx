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
  DailyLogRecord,
  UpsertDailyLogInput,
  DailyLogEntry,
  UserPreferences,
  CycleRecord,
  MoodType,
  EnergyLevel,
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
  getDailyLogs,
  upsertDailyLog,
  deleteDailyLog,
  getCustomSymptoms,
  addCustomSymptom,
} from '@/lib/supabase/dailyLogs';
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
import { DEMO_CYCLE_RECORDS, DEMO_DAILY_LOGS } from '@/lib/demo/demoData';

interface CycleDataContextType {
  // Demo Mode Status & Actions
  isDemoMode: boolean;
  enterDemo: () => void;
  exitDemo: () => void;
  demoMode: boolean; // Alias
  setDemoMode: (enabled: boolean) => void; // Alias

  // Toast feedback
  toastMessage: string | null;
  showToast: (msg: string) => void;
  hideToast: () => void;

  // Preferences
  preferences: UserPreferences;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => void;

  // Persistent Cycle Tracking (Phase 3)
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

  // Persistent Daily Wellness Tracking (Phase 4)
  dailyLogs: DailyLogRecord[];
  isLoadingDailyLogs: boolean;
  customSymptoms: string[];
  refreshDailyLogs: () => Promise<void>;
  saveDailyWellness: (input: UpsertDailyLogInput) => Promise<{ success: boolean; error?: string }>;
  removeDailyWellness: (logId: string) => Promise<{ success: boolean; error?: string }>;
  getDailyLog: (dateStr: string) => DailyLogRecord | undefined;
  addCustomSymptomName: (name: string) => Promise<void>;

  // Backward compatibility helpers
  entries: DailyLogEntry[];
  addLogEntry: (entry: Omit<DailyLogEntry, 'id' | 'createdAt'>) => void;
  getEntryForDate: (date: string) => DailyLogEntry | undefined;
  clearTemporaryData: () => void;
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

  // Demo mode state: strictly false for authenticated users
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Initialize demo mode flag from cookie / storage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user) {
        // Real authenticated user: ensure demo mode is always disabled
        setIsDemoMode(false);
        document.cookie = 'oviare_demo_mode=; path=/; max-age=0';
        localStorage.removeItem('oviare_demo_mode');
      } else {
        const hasDemoCookie = document.cookie.includes('oviare_demo_mode=true');
        const hasDemoStorage = localStorage.getItem('oviare_demo_mode') === 'true';
        if (hasDemoCookie || hasDemoStorage) {
          setIsDemoMode(true);
        }
      }
    }
  }, [user]);

  // Real user state (starts completely clean and empty)
  const [userCycleRecords, setUserCycleRecords] = useState<CycleRecord[]>([]);
  const [userDailyLogs, setUserDailyLogs] = useState<DailyLogRecord[]>([]);
  const [customSymptomsList, setCustomSymptomsList] = useState<string[]>([]);
  const [isLoadingCycles, setIsLoadingCycles] = useState<boolean>(false);
  const [isLoadingDailyLogs, setIsLoadingDailyLogs] = useState<boolean>(false);

  // In-memory isolated demo state (only used when isDemoMode is true)
  const [demoCycleRecords, setDemoCycleRecords] = useState<CycleRecord[]>(DEMO_CYCLE_RECORDS);
  const [demoDailyLogs, setDemoDailyLogs] = useState<DailyLogRecord[]>(DEMO_DAILY_LOGS);

  // UI toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  const hideToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  // Enter isolated demo trial
  const enterDemo = useCallback(() => {
    if (typeof window !== 'undefined') {
      document.cookie = 'oviare_demo_mode=true; path=/; max-age=86400; SameSite=Lax';
      localStorage.setItem('oviare_demo_mode', 'true');
    }
    setDemoCycleRecords([...DEMO_CYCLE_RECORDS]);
    setDemoDailyLogs([...DEMO_DAILY_LOGS]);
    setIsDemoMode(true);
    showToast('Entered interactive trial demo with sample data');
  }, [showToast]);

  // Exit demo trial and reset
  const exitDemo = useCallback(() => {
    if (typeof window !== 'undefined') {
      document.cookie = 'oviare_demo_mode=; path=/; max-age=0';
      localStorage.removeItem('oviare_demo_mode');
    }
    setIsDemoMode(false);
    setDemoCycleRecords([]);
    setDemoDailyLogs([]);
    showToast('Exited demo mode');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, [showToast]);

  // Fetch real cycle records from Supabase
  const fetchUserCycles = useCallback(async () => {
    if (!user) {
      setUserCycleRecords([]);
      return;
    }

    try {
      setIsLoadingCycles(true);
      const records = await getCycleRecords(supabase, user.id);
      setUserCycleRecords(records || []);
    } catch (err: unknown) {
      console.error('Failed to load user cycle records:', err);
    } finally {
      setIsLoadingCycles(false);
    }
  }, [user, supabase]);

  // Fetch real daily logs from Supabase
  const fetchUserDailyLogs = useCallback(async () => {
    if (!user) {
      setUserDailyLogs([]);
      return;
    }

    try {
      setIsLoadingDailyLogs(true);
      const [logs, customSymps] = await Promise.all([
        getDailyLogs(supabase, user.id),
        getCustomSymptoms(supabase, user.id),
      ]);
      setUserDailyLogs(logs || []);
      setCustomSymptomsList(customSymps || []);
    } catch (err: unknown) {
      console.error('Failed to load user daily logs:', err);
    } finally {
      setIsLoadingDailyLogs(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) {
      fetchUserCycles();
      fetchUserDailyLogs();
    } else {
      setUserCycleRecords([]);
      setUserDailyLogs([]);
    }
  }, [user, fetchUserCycles, fetchUserDailyLogs]);

  // Active records:
  // If user is logged in, ALWAYS user records (never demo data!)
  // If user is not logged in and in demo mode, demo records.
  const activeCycleRecords = useMemo(() => {
    if (user) return userCycleRecords;
    if (isDemoMode) return demoCycleRecords;
    return [];
  }, [user, isDemoMode, userCycleRecords, demoCycleRecords]);

  const activeDailyLogs = useMemo(() => {
    if (user) return userDailyLogs;
    if (isDemoMode) return demoDailyLogs;
    return [];
  }, [user, isDemoMode, userDailyLogs, demoDailyLogs]);

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

  const cycleDayInfo = useMemo(() => {
    return getCurrentCycleDay(activeCycleRecords, '2026-10-01');
  }, [activeCycleRecords]);

  // -------------------------------------------------------------
  // Period Logging Operations
  // -------------------------------------------------------------
  const addPeriod = async (input: {
    period_start: string;
    period_end?: string | null;
    flow_intensity?: 'light' | 'medium' | 'heavy' | 'spotting' | null;
    notes?: string | null;
  }): Promise<{ success: boolean; error?: string }> => {
    const periodEnd = input.period_end ?? null;

    // Validate
    const dateValidation = validatePeriodDates(input.period_start, periodEnd);
    if (!dateValidation.isValid) {
      return { success: false, error: dateValidation.error };
    }

    const recordsToCheck = activeCycleRecords;
    const conflict = hasDateConflict(input.period_start, periodEnd, recordsToCheck);
    if (conflict.hasConflict) {
      return { success: false, error: conflict.reason };
    }

    // Persist to Supabase if authenticated
    if (user && !isDemoMode) {
      try {
        const created = await createCycleRecord(supabase, {
          user_id: user.id,
          period_start: input.period_start,
          period_end: periodEnd,
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

    // In demo mode: local in-memory update only
    const localRecord: CycleRecord = {
      id: `demo-cycle-${Date.now()}`,
      user_id: 'demo-visitor-trial',
      period_start: input.period_start,
      period_end: periodEnd,
      flow_intensity: input.flow_intensity || null,
      notes: input.notes?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setDemoCycleRecords((prev) =>
      [...prev, localRecord].sort((a, b) => a.period_start.localeCompare(b.period_start))
    );
    showToast('Period recorded in demo trial (in-memory)');
    return { success: true };
  };

  const editPeriod = async (
    id: string,
    updates: {
      period_start?: string;
      period_end?: string | null;
      flow_intensity?: 'light' | 'medium' | 'heavy' | 'spotting' | null;
      notes?: string | null;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    if (updates.period_start) {
      const periodEnd = updates.period_end ?? null;
      const dateValidation = validatePeriodDates(updates.period_start, periodEnd);
      if (!dateValidation.isValid) {
        return { success: false, error: dateValidation.error };
      }

      const recordsToCheck = activeCycleRecords;
      const conflict = hasDateConflict(updates.period_start, periodEnd, recordsToCheck, id);
      if (conflict.hasConflict) {
        return { success: false, error: conflict.reason };
      }
    }

    if (user && !isDemoMode) {
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

    // Demo mode local update
    setDemoCycleRecords((prev) =>
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
        .sort((a, b) => a.period_start.localeCompare(b.period_start))
    );
    showToast('Period updated in demo trial');
    return { success: true };
  };

  const deletePeriod = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (user && !isDemoMode) {
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

    setDemoCycleRecords((prev) => prev.filter((r) => r.id !== id));
    showToast('Period removed in demo trial');
    return { success: true };
  };

  // -------------------------------------------------------------
  // Daily Wellness Tracking Operations (Phase 4)
  // -------------------------------------------------------------
  const saveDailyWellness = async (input: UpsertDailyLogInput): Promise<{ success: boolean; error?: string }> => {
    if (!input.log_date) {
      return { success: false, error: 'Please specify a logging date.' };
    }

    if (user && !isDemoMode) {
      try {
        const saved = await upsertDailyLog(supabase, user.id, input);
        setUserDailyLogs((prev) => {
          const filtered = prev.filter((l) => l.log_date !== input.log_date);
          return [saved, ...filtered].sort((a, b) => b.log_date.localeCompare(a.log_date));
        });
        showToast(`Daily wellness saved for ${input.log_date}`);
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to save daily wellness log';
        return { success: false, error: msg };
      }
    }

    // In demo mode: local in-memory update
    const demoLog: DailyLogRecord = {
      id: `demo-log-${Date.now()}`,
      user_id: 'demo-visitor-trial',
      log_date: input.log_date,
      moods: input.moods || [],
      sleep_duration_minutes: input.sleep_duration_minutes ?? null,
      sleep_quality: input.sleep_quality ?? null,
      energy_level: input.energy_level ?? null,
      intimacy_logged: Boolean(input.intimacy_logged),
      intimacy_notes: input.intimacy_notes?.trim() || null,
      notes: input.notes?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      symptoms: (input.symptoms || []).map((s, idx) => ({
        id: `demo-symp-${Date.now()}-${idx}`,
        daily_log_id: `demo-log-${Date.now()}`,
        user_id: 'demo-visitor-trial',
        symptom_name: s.symptom_name,
        severity: s.severity,
        notes: s.notes || null,
      })),
    };

    setDemoDailyLogs((prev) => {
      const filtered = prev.filter((l) => l.log_date !== input.log_date);
      return [demoLog, ...filtered].sort((a, b) => b.log_date.localeCompare(a.log_date));
    });
    showToast(`Daily wellness recorded in demo trial for ${input.log_date}`);
    return { success: true };
  };

  const removeDailyWellness = async (logId: string): Promise<{ success: boolean; error?: string }> => {
    if (user && !isDemoMode) {
      try {
        await deleteDailyLog(supabase, user.id, logId);
        setUserDailyLogs((prev) => prev.filter((l) => l.id !== logId));
        showToast('Daily log entry removed');
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to delete daily log';
        return { success: false, error: msg };
      }
    }

    setDemoDailyLogs((prev) => prev.filter((l) => l.id !== logId));
    showToast('Daily entry removed in demo trial');
    return { success: true };
  };

  const getDailyLog = useCallback(
    (dateStr: string): DailyLogRecord | undefined => {
      return activeDailyLogs.find((l) => l.log_date === dateStr);
    },
    [activeDailyLogs]
  );

  const addCustomSymptomName = async (name: string): Promise<void> => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) return;

    if (user && !isDemoMode) {
      await addCustomSymptom(supabase, user.id, trimmed);
      setCustomSymptomsList((prev) => Array.from(new Set([...prev, trimmed])));
    } else {
      setCustomSymptomsList((prev) => Array.from(new Set([...prev, trimmed])));
    }
  };

  // -------------------------------------------------------------
  // Backward Compatibility Helpers (Mapping DailyLogRecord -> DailyLogEntry)
  // -------------------------------------------------------------
  const mappedLegacyEntries = useMemo<DailyLogEntry[]>(() => {
    return activeDailyLogs.map((log) => {
      // Find matching period flow for this date if recorded
      const matchingPeriod = activeCycleRecords.find((p) => {
        const start = p.period_start;
        const end = p.period_end || p.period_start;
        return log.log_date >= start && log.log_date <= end;
      });

      let flow: 'none' | 'spotting' | 'light' | 'medium' | 'heavy' = 'none';
      if (matchingPeriod?.flow_intensity) {
        flow = matchingPeriod.flow_intensity;
      }

      let legacyEnergy: EnergyLevel = 'moderate';
      if (log.energy_level) {
        if (log.energy_level <= 2) legacyEnergy = 'low';
        else if (log.energy_level >= 4) legacyEnergy = 'high';
      }

      return {
        id: log.id,
        date: log.log_date,
        flow,
        symptoms: (log.symptoms || []).map((s) => s.symptom_name),
        moods: log.moods,
        sleepHours: log.sleep_duration_minutes ? Math.round((log.sleep_duration_minutes / 60) * 10) / 10 : undefined,
        energy: legacyEnergy,
        notes: log.notes || undefined,
        isPrototypeSample: isDemoMode,
        createdAt: log.created_at,
      };
    });
  }, [activeDailyLogs, activeCycleRecords, isDemoMode]);

  const addLogEntry = (legacyEntry: Omit<DailyLogEntry, 'id' | 'createdAt'>) => {
    // Convert to saveDailyWellness
    saveDailyWellness({
      log_date: legacyEntry.date,
      moods: legacyEntry.moods,
      sleep_duration_minutes: legacyEntry.sleepHours ? Math.round(legacyEntry.sleepHours * 60) : null,
      energy_level: legacyEntry.energy === 'low' ? 2 : legacyEntry.energy === 'high' ? 4 : 3,
      notes: legacyEntry.notes || null,
      symptoms: (legacyEntry.symptoms || []).map((s) => ({
        symptom_name: s,
        severity: 'moderate',
      })),
    });
  };

  const getEntryForDate = (date: string): DailyLogEntry | undefined => {
    return mappedLegacyEntries.find((e) => e.date === date);
  };

  const clearTemporaryData = () => {
    if (isDemoMode) {
      setDemoCycleRecords([]);
      setDemoDailyLogs([]);
      showToast('Demo trial data cleared');
    }
  };

  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...newPrefs }));
    showToast('Preferences updated');
  };

  return (
    <CycleDataContext.Provider
      value={{
        // Demo Trial status & controls
        isDemoMode,
        enterDemo,
        exitDemo,
        demoMode: isDemoMode,
        setDemoMode: (enabled) => (enabled ? enterDemo() : exitDemo()),

        // Toast feedback
        toastMessage,
        showToast,
        hideToast,

        // Preferences
        preferences,
        updatePreferences,

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

        // Daily Wellness Tracking (Phase 4)
        dailyLogs: activeDailyLogs,
        isLoadingDailyLogs,
        customSymptoms: customSymptomsList,
        refreshDailyLogs: fetchUserDailyLogs,
        saveDailyWellness,
        removeDailyWellness,
        getDailyLog,
        addCustomSymptomName,

        // Legacy compatibility
        entries: mappedLegacyEntries,
        addLogEntry,
        getEntryForDate,
        clearTemporaryData,
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
