export type WorkoutType =
  | 'recovery'
  | 'aerobic'
  | 'rest'
  | 'quality'
  | 'easy'
  | 'long_run'
  | 'race';

export interface LoggedWorkoutData {
  actualKm: number;
  duration: string; // "HH:MM:SS" or "MM:SS"
  avgPace: string; // "M:SS /km"
  rpe?: number; // 1 - 10
  notes?: string;
  loggedAt: string; // ISO date string
}

export interface DaySchedule {
  dayName: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  dateStr: string; // e.g. "Oct 12"
  fullDate?: string; // YYYY-MM-DD
  type: WorkoutType;
  rawType?: string; // e.g. "Quality Workout (Easy Fartlek)" or "Long Run (Time on Feet)"
  subtype?: string; // e.g. "Easy Fartlek", "Time on Feet", "Fast Finish 3k GMP"
  title: string;
  plannedKm: number;
  details?: string;
  targetPace?: string; // e.g. "6:45–7:00/km" or "5:20/km"
  completed: boolean;
  loggedData?: LoggedWorkoutData;
}

export interface TrainingWeek {
  weekNumber: number;
  dateMon: string; // e.g. "Oct 12"
  plannedDist: number;
  actualDist?: number;
  totalDuration?: string;
  avgPace?: string;
  notes?: string;
  phase: 'Base & Aerobic Build' | 'Threshold & Volume' | 'Peak & Specificity' | 'Taper & Race';
  days: {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
  };
}

export interface PacingZone {
  name: string;
  purpose: string;
  paceRange: string;
  effortRpe: string;
  color: string;
  description: string;
}

export interface GoldenRule {
  id: number;
  title: string;
  content: string;
  icon: string;
}

export interface GoogleSheetSyncState {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  lastSyncedAt: string | null;
  isSyncing: boolean;
  autoSync: boolean;
  error: string | null;
}
