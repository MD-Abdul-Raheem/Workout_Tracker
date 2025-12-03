
export enum MuscleGroup {
  Chest = 'Chest',
  Back = 'Back',
  Legs = 'Legs',
  Shoulders = 'Shoulders',
  Arms = 'Arms',
  Core = 'Core',
  Cardio = 'Cardio',
  FullBody = 'Full Body',
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string; // Changed to string to allow detailed focus like "Upper Chest"
  sets: number;
  reps: string[]; // per-set tracking
  weight: string[]; // per-set tracking
  notes: string;
  completed: boolean;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface WeeklyPlan {
  [key: string]: Exercise[]; // Key is DayOfWeek
}

export interface WeeklyStats {
  totalExercises: number;
  totalSets: number;
  totalVolume: number;
  topMuscle: string;
}

export interface HistoryEntry {
  id: string;
  weekLabel: string; // e.g., "Oct 23 - Oct 29"
  dateArchived: string;
  startDate?: string; // ISO string of the Monday of that week
  plan: WeeklyPlan;
  stats: WeeklyStats;
}

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
