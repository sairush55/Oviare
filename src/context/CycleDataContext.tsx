'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DailyLogEntry, DayEvent, UserPreferences } from '@/types';

// Sample demonstration records (explicitly tagged as sample data)
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

interface CycleDataContextType {
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
  const [entries, setEntries] = useState<DailyLogEntry[]>(INITIAL_SAMPLE_ENTRIES);
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const hideToast = () => {
    setToastMessage(null);
  };

  const addLogEntry = (newEntryData: Omit<DailyLogEntry, 'id' | 'createdAt'>) => {
    const newEntry: DailyLogEntry = {
      ...newEntryData,
      id: `session-log-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isPrototypeSample: false, // User logged during this session
    };

    setEntries((prev) => {
      // Replace existing entry for same date if exists, or prepend
      const filtered = prev.filter((item) => item.date !== newEntry.date);
      return [newEntry, ...filtered];
    });

    showToast(`Logged symptoms for ${newEntry.date} (session state only)`);
  };

  const getEntryForDate = (date: string): DailyLogEntry | undefined => {
    // If demo mode is turned off, filter out sample entries
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
