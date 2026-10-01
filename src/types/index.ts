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
  | 'insomnia';

export type MoodType = 
  | 'calm'
  | 'balanced'
  | 'happy'
  | 'sensitive'
  | 'low_energy'
  | 'anxious'
  | 'irritable';

export type EnergyLevel = 'low' | 'moderate' | 'high';

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


