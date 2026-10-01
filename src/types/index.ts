export type FlowLevel = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export type SymptomCategory = 
  | 'cramps'
  | 'headache'
  | 'tender_breasts'
  | 'bloating'
  | 'fatigue'
  | 'acne'
  | 'backache'
  | 'nausea'
  | 'insomnia'
  | 'appetite_changes'
  | 'digestive_discomfort'
  | string;

export type SymptomSeverity = 'mild' | 'moderate' | 'severe';

export interface DailySymptom {
  id: string;
  daily_log_id: string;
  user_id: string;
  symptom_name: string;
  severity: SymptomSeverity;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type MoodType = 
  | 'happy'
  | 'calm'
  | 'neutral'
  | 'balanced'
  | 'sensitive'
  | 'low_energy'
  | 'anxious'
  | 'irritable'
  | 'sad'
  | 'stressed';

export type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent';

export type EnergyLevel = 'low' | 'moderate' | 'high'; // Phase 1 compatibility
export type EnergyScale = 1 | 2 | 3 | 4 | 5; // 1: Very low, 2: Low, 3: Moderate, 4: High, 5: Very high

export interface DailyLogRecord {
  id: string;
  user_id: string;
  log_date: string; // ISO format 'YYYY-MM-DD'
  moods: MoodType[];
  sleep_duration_minutes: number | null;
  sleep_quality: SleepQuality | null;
  energy_level: number | null; // 1-5
  intimacy_logged: boolean;
  intimacy_notes?: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  symptoms?: DailySymptom[];
}

export interface UpsertDailyLogInput {
  log_date: string;
  moods?: MoodType[];
  sleep_duration_minutes?: number | null;
  sleep_quality?: SleepQuality | null;
  energy_level?: number | null;
  intimacy_logged?: boolean;
  intimacy_notes?: string | null;
  notes?: string | null;
  symptoms?: {
    symptom_name: string;
    severity: SymptomSeverity;
    notes?: string | null;
  }[];
}

// Phase 1 legacy interface maintained for backward compatibility
export interface DailyLogEntry {
  id: string;
  date: string; // ISO format 'YYYY-MM-DD'
  flow: FlowLevel;
  symptoms: SymptomCategory[];
  moods: MoodType[];
  sleepHours?: number;
  energy?: EnergyLevel;
  notes?: string;
  isPrototypeSample?: boolean;
  createdAt: string;
}

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface DayEvent {
  date: string; // YYYY-MM-DD
  isPeriod?: boolean;
  isPredictedPeriod?: boolean;
  isOvulationEstimated?: boolean;
  isFertileWindowEstimated?: boolean;
  hasLog?: boolean;
  flow?: FlowLevel;
  symptomsCount?: number;
  isSampleData?: boolean;
}

export interface UserPreferences {
  averageCycleLength: number; // e.g. 28 days
  averagePeriodLength: number; // e.g. 5 days
  reminderNotifications: boolean;
  reminderDaysBefore: number;
  dataSharingConsent: boolean;
  anonymousAnalytics: boolean;
}

export interface CycleSummaryStats {
  averageCycleLength: number;
  averagePeriodLength: number;
  cycleVariationDays: number;
  lastCycleLength: number;
  recordedCyclesCount: number;
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  date_of_birth: string | null;
  language: string | null;
  timezone: string | null;
  onboarding_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CycleRecord {
  id: string;
  user_id: string;
  period_start: string; // ISO format 'YYYY-MM-DD'
  period_end: string | null; // ISO format 'YYYY-MM-DD' or null if ongoing
  flow_intensity?: 'light' | 'medium' | 'heavy' | 'spotting' | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateCycleRecordInput = Omit<CycleRecord, 'id' | 'created_at' | 'updated_at'>;
export type UpdateCycleRecordInput = Partial<Omit<CycleRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
