/**
 * Date and Training Plan Synchronization Utilities
 * Handles two-way sync between Start Date, Race Date, and Plan Duration (Weeks).
 * Ensures race plans always tally precisely with calendar weeks (including 19, 21, etc.).
 */

export function parseLocalDate(str: string): Date {
  if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatToDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Get upcoming Monday as default start date
 */
export function getUpcomingMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = (day === 0 ? 1 : 8 - day);
  d.setDate(d.getDate() + diff);
  return formatToDateInput(d);
}

/**
 * Find the Monday of the given date's week
 */
export function getMondayOfWeek(d: Date): Date {
  const day = d.getDay(); // 0 is Sun, 1 is Mon, 6 is Sat
  const diff = (day === 0 ? -6 : 1 - day);
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return monday;
}

/**
 * Calculate Race Date given Start Date (Monday) and Weeks Count
 */
export function calculateRaceDateFromStart(
  startDateStr: string,
  weeksCount: number,
  longRunDay: 'sunday' | 'saturday' = 'sunday'
): string {
  const start = parseLocalDate(startDateStr);
  // Ensure start is treated as Monday; week N race day is (N-1)*7 + 6 (for Sun) or + 5 (for Sat)
  const daysOffset = (weeksCount - 1) * 7 + (longRunDay === 'saturday' ? 5 : 6);
  const raceDate = new Date(start);
  raceDate.setDate(start.getDate() + daysOffset);
  return formatToDateInput(raceDate);
}

/**
 * Calculate Start Date (Monday) given Race Date and Weeks Count
 */
export function calculateStartDateFromRace(
  raceDateStr: string,
  weeksCount: number,
  longRunDay: 'sunday' | 'saturday' = 'sunday'
): string {
  const raceDate = parseLocalDate(raceDateStr);
  const dayOfWeek = raceDate.getDay();
  // Offset from Monday of the race week: Mon = 0, Sun = 6
  const offsetFromMonday = (dayOfWeek + 6) % 7;
  const raceWeekMonday = new Date(raceDate);
  raceWeekMonday.setDate(raceDate.getDate() - offsetFromMonday);

  // Start date is Monday of Week 1, which is (weeksCount - 1) * 7 days earlier
  const startMonday = new Date(raceWeekMonday);
  startMonday.setDate(raceWeekMonday.getDate() - (weeksCount - 1) * 7);
  return formatToDateInput(startMonday);
}

/**
 * Calculate exact weeks count between Start Date and Race Date
 * Enables auto-adjusting to 19, 21, or any custom duration!
 */
export function calculateWeeksBetween(
  startDateStr: string,
  raceDateStr: string
): {
  exactWeeks: number;
  calendarDays: number;
  isExactMultiple: boolean;
  startDateAligned: string;
} {
  const start = parseLocalDate(startDateStr);
  const race = parseLocalDate(raceDateStr);
  const diffTime = race.getTime() - start.getTime();
  const calendarDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // Calendar days from Monday of Week 1 to Sunday of Week N is (N * 7 - 1)
  // Adding 1 gives N * 7
  const rawWeeks = (calendarDays + 1) / 7;
  const clampedWeeks = Math.max(4, Math.min(36, Math.round(rawWeeks)));
  const isExactMultiple = Math.abs(rawWeeks - clampedWeeks) < 0.2;

  return {
    exactWeeks: clampedWeeks,
    calendarDays,
    isExactMultiple,
    startDateAligned: formatToDateInput(getMondayOfWeek(start)),
  };
}

/**
 * Format readable string for display: "Sun, Oct 18, 2026"
 */
export function formatPrettyDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}
