import { CycleRecord, DailyLogRecord } from '@/types';

/**
 * Fictional synthetic demo fixtures for the visitor "Try Demo" experience.
 * These records are strictly isolated from real user data and are never
 * written to Supabase tables.
 */

export const DEMO_CYCLE_RECORDS: CycleRecord[] = [
  {
    id: 'demo-cycle-1',
    user_id: 'demo-visitor-trial',
    period_start: '2026-07-16',
    period_end: '2026-07-20',
    flow_intensity: 'medium',
    notes: 'Synthetic sample period record',
    created_at: '2026-07-16T08:00:00Z',
    updated_at: '2026-07-20T08:00:00Z',
  },
  {
    id: 'demo-cycle-2',
    user_id: 'demo-visitor-trial',
    period_start: '2026-08-13',
    period_end: '2026-08-17',
    flow_intensity: 'heavy',
    notes: '28-day sample interval, typical flow',
    created_at: '2026-08-13T08:00:00Z',
    updated_at: '2026-08-17T08:00:00Z',
  },
  {
    id: 'demo-cycle-3',
    user_id: 'demo-visitor-trial',
    period_start: '2026-09-08',
    period_end: '2026-09-12',
    flow_intensity: 'medium',
    notes: '26-day sample interval, regular transition',
    created_at: '2026-09-08T08:00:00Z',
    updated_at: '2026-09-12T08:00:00Z',
  },
];

export const DEMO_DAILY_LOGS: DailyLogRecord[] = [
  {
    id: 'demo-log-1',
    user_id: 'demo-visitor-trial',
    log_date: '2026-09-08',
    moods: ['sensitive', 'low_energy'],
    sleep_duration_minutes: 420, // 7.0 hours
    sleep_quality: 'fair',
    energy_level: 2, // Low
    intimacy_logged: false,
    notes: 'Sample note: mild morning pelvic fullness.',
    created_at: '2026-09-08T08:00:00Z',
    updated_at: '2026-09-08T08:00:00Z',
    symptoms: [
      {
        id: 'demo-symp-1',
        daily_log_id: 'demo-log-1',
        user_id: 'demo-visitor-trial',
        symptom_name: 'cramps',
        severity: 'moderate',
        notes: 'Pelvic area',
      },
      {
        id: 'demo-symp-2',
        daily_log_id: 'demo-log-1',
        user_id: 'demo-visitor-trial',
        symptom_name: 'fatigue',
        severity: 'mild',
        notes: null,
      },
    ],
  },
  {
    id: 'demo-log-2',
    user_id: 'demo-visitor-trial',
    log_date: '2026-09-09',
    moods: ['low_energy', 'calm'],
    sleep_duration_minutes: 390, // 6.5 hours
    sleep_quality: 'fair',
    energy_level: 2,
    intimacy_logged: false,
    notes: 'Sample note: heavy flow day.',
    created_at: '2026-09-09T08:00:00Z',
    updated_at: '2026-09-09T08:00:00Z',
    symptoms: [
      {
        id: 'demo-symp-3',
        daily_log_id: 'demo-log-2',
        user_id: 'demo-visitor-trial',
        symptom_name: 'cramps',
        severity: 'severe',
        notes: null,
      },
      {
        id: 'demo-symp-4',
        daily_log_id: 'demo-log-2',
        user_id: 'demo-visitor-trial',
        symptom_name: 'bloating',
        severity: 'moderate',
        notes: null,
      },
    ],
  },
  {
    id: 'demo-log-3',
    user_id: 'demo-visitor-trial',
    log_date: '2026-09-10',
    moods: ['balanced'],
    sleep_duration_minutes: 480, // 8.0 hours
    sleep_quality: 'good',
    energy_level: 3, // Moderate
    intimacy_logged: false,
    notes: null,
    created_at: '2026-09-10T08:00:00Z',
    updated_at: '2026-09-10T08:00:00Z',
    symptoms: [
      {
        id: 'demo-symp-5',
        daily_log_id: 'demo-log-3',
        user_id: 'demo-visitor-trial',
        symptom_name: 'tender_breasts',
        severity: 'mild',
        notes: null,
      },
    ],
  },
  {
    id: 'demo-log-4',
    user_id: 'demo-visitor-trial',
    log_date: '2026-09-11',
    moods: ['calm', 'happy'],
    sleep_duration_minutes: 480,
    sleep_quality: 'good',
    energy_level: 3,
    intimacy_logged: false,
    notes: 'Easing flow and steady mood.',
    created_at: '2026-09-11T08:00:00Z',
    updated_at: '2026-09-11T08:00:00Z',
    symptoms: [],
  },
  {
    id: 'demo-log-5',
    user_id: 'demo-visitor-trial',
    log_date: '2026-09-12',
    moods: ['happy'],
    sleep_duration_minutes: 510, // 8.5 hours
    sleep_quality: 'excellent',
    energy_level: 4, // High
    intimacy_logged: false,
    notes: 'Period ended. Energy restored.',
    created_at: '2026-09-12T08:00:00Z',
    updated_at: '2026-09-12T08:00:00Z',
    symptoms: [],
  },
  {
    id: 'demo-log-6',
    user_id: 'demo-visitor-trial',
    log_date: '2026-09-22',
    moods: ['happy', 'calm'],
    sleep_duration_minutes: 480,
    sleep_quality: 'good',
    energy_level: 4,
    intimacy_logged: true,
    intimacy_notes: 'Protected intimacy.',
    notes: null,
    created_at: '2026-09-22T08:00:00Z',
    updated_at: '2026-09-22T08:00:00Z',
    symptoms: [],
  },
];
