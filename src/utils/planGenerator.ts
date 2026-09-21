import { TrainingWeek, DaySchedule, WorkoutType } from '../types';

export interface PlanGeneratorOptions {
  event: 'marathon' | 'half_marathon' | '10k' | '5k' | 'custom';
  targetDistanceKm: number;
  weeksCount: number;
  goalHours: number;
  goalMinutes: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: 3 | 4 | 5 | 6;
  longRunDay: 'sunday' | 'saturday';
  startDateStr: string; // YYYY-MM-DD
  planTitle?: string;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Format date as "Oct 12"
 */
function formatDateLabel(d: Date): string {
  const month = MONTH_NAMES[d.getMonth()];
  const day = d.getDate();
  return `${month} ${day < 10 ? '0' + day : day}`;
}

/**
 * Add days to date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Format seconds to M:SS /km
 */
function formatPace(secondsPerKm: number): string {
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.round(secondsPerKm % 60);
  return `${m}:${s.toString().padStart(2, '0')}/km`;
}

/**
 * Generate a complete, periodized custom running plan tailored to runner goals.
 */
export const generateCustomPlan = (opts: PlanGeneratorOptions): TrainingWeek[] => {
  const {
    event,
    targetDistanceKm,
    weeksCount,
    goalHours,
    goalMinutes,
    level,
    daysPerWeek,
    longRunDay,
    startDateStr,
  } = opts;

  // Calculate Goal Pace (GMP)
  const totalGoalSeconds = goalHours * 3600 + goalMinutes * 60;
  const gmpSeconds = totalGoalSeconds / targetDistanceKm;

  // Pacing zones derived from Goal Race Pace
  const recoveryPaceStr = `${formatPace(gmpSeconds + 60)}–${formatPace(gmpSeconds + 80)}`;
  const aerobicPaceStr = `${formatPace(gmpSeconds + 35)}–${formatPace(gmpSeconds + 50)}`;
  const easyPaceStr = formatPace(gmpSeconds + 50);
  const gmpPaceStr = formatPace(gmpSeconds);
  const tempoPaceStr = formatPace(gmpSeconds - 20);
  const intervalPaceStr = `${formatPace(gmpSeconds - 50)}–${formatPace(gmpSeconds - 30)}`;

  // Parse start date in local time to avoid UTC timezone off-by-one shifts
  let start: Date;
  if (startDateStr && /^\d{4}-\d{2}-\d{2}$/.test(startDateStr)) {
    const [y, m, d] = startDateStr.split('-').map(Number);
    start = new Date(y, m - 1, d);
  } else {
    const now = new Date();
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  // Taper length: 3 weeks for >= 16 weeks, 2 weeks for 10-14 weeks, 1 week for <= 8 weeks
  const taperWeeks = weeksCount >= 16 ? 3 : weeksCount >= 10 ? 2 : 1;
  const buildWeeks = weeksCount - taperWeeks;

  // Peak long run target based on event
  let peakLongRunKm = 32;
  let startLongRunKm = 14;
  if (event === 'marathon') {
    peakLongRunKm = level === 'advanced' ? 34 : level === 'intermediate' ? 32 : 28;
    startLongRunKm = level === 'advanced' ? 16 : level === 'intermediate' ? 14 : 12;
  } else if (event === 'half_marathon') {
    peakLongRunKm = level === 'advanced' ? 22 : level === 'intermediate' ? 20 : 17;
    startLongRunKm = level === 'advanced' ? 12 : level === 'intermediate' ? 10 : 8;
  } else if (event === '10k') {
    peakLongRunKm = level === 'advanced' ? 16 : level === 'intermediate' ? 14 : 12;
    startLongRunKm = 8;
  } else {
    // 5k
    peakLongRunKm = 12;
    startLongRunKm = 6;
  }

  const weeks: TrainingWeek[] = [];

  for (let w = 1; w <= weeksCount; w++) {
    const mondayDate = addDays(start, (w - 1) * 7);
    const dateMon = formatDateLabel(mondayDate);

    // Determine Phase
    let phase: TrainingWeek['phase'] = 'Base & Aerobic Build';
    if (w > weeksCount - taperWeeks) {
      phase = 'Taper & Race';
    } else if (w > Math.round(buildWeeks * 0.65)) {
      phase = 'Peak & Specificity';
    } else if (w > Math.round(buildWeeks * 0.35)) {
      phase = 'Threshold & Volume';
    } else {
      phase = 'Base & Aerobic Build';
    }

    const isCutbackWeek = w % 4 === 0 && w < weeksCount - taperWeeks;
    const isRaceWeek = w === weeksCount;

    // Calculate long run distance
    let longRunKm = 0;
    let longRunDetails = '';

    if (isRaceWeek) {
      longRunKm = targetDistanceKm;
      longRunDetails = `🎯 RACE DAY! Goal distance ${targetDistanceKm} km at target pace ${gmpPaceStr}. Trust your training, fuel every 5km, and finish strong!`;
    } else if (w > weeksCount - taperWeeks) {
      // Taper weeks
      const taperStep = weeksCount - w; // e.g. 2, 1
      if (taperStep === 2) {
        longRunKm = Math.round(peakLongRunKm * 0.7);
        longRunDetails = `Taper Long Run (${longRunKm} km) at comfortable aerobic pace (${aerobicPaceStr}). Feel fresh!`;
      } else if (taperStep === 1) {
        longRunKm = Math.round(peakLongRunKm * 0.5);
        longRunDetails = `Taper Shakeout Long Run (${longRunKm} km) with 2km at GMP (${gmpPaceStr}).`;
      } else {
        longRunKm = Math.round(peakLongRunKm * 0.35);
        longRunDetails = `Light pre-race run (${longRunKm} km). Keep legs awake.`;
      }
    } else if (isCutbackWeek) {
      // Down adaptation week
      longRunKm = Math.max(startLongRunKm, Math.round(startLongRunKm + ((peakLongRunKm - startLongRunKm) * ((w - 2) / buildWeeks)) * 0.7));
      longRunDetails = `Cutback recovery long run (${longRunKm} km) at ${aerobicPaceStr}. Prioritize recovery and tissue repair.`;
    } else {
      // Progressive build up to peak
      const progressRatio = Math.min(1, (w - 1) / (buildWeeks - 1));
      longRunKm = Math.round(startLongRunKm + (peakLongRunKm - startLongRunKm) * progressRatio);

      if (phase === 'Peak & Specificity' && w % 2 === 1) {
        const gmpBlockKm = Math.min(12, Math.round(longRunKm * 0.35));
        longRunDetails = `Progressive Long Run (${longRunKm} km): First ${longRunKm - gmpBlockKm} km aerobic (${aerobicPaceStr}), final ${gmpBlockKm} km @ Goal Pace (${gmpPaceStr}).`;
      } else {
        longRunDetails = `Steady endurance long run (${longRunKm} km) at smooth aerobic pace (${aerobicPaceStr}). Focus on hydration and fueling.`;
      }
    }

    // Mid-week distances based on level & daysPerWeek
    let recoveryKm = isRaceWeek ? 4 : isCutbackWeek ? 5 : level === 'advanced' ? 9 : level === 'intermediate' ? 7 : 5;
    let aerobicKm = isRaceWeek ? 5 : isCutbackWeek ? 8 : level === 'advanced' ? 14 : level === 'intermediate' ? 11 : 8;
    let qualityKm = isRaceWeek ? 4 : isCutbackWeek ? 7 : level === 'advanced' ? 13 : level === 'intermediate' ? 10 : 7;
    let easyKm = isRaceWeek ? 3 : isCutbackWeek ? 4 : level === 'advanced' ? 6 : level === 'intermediate' ? 5 : 4;

    // Quality Workout Details
    let qualityDetails = '';
    let qualityTitle = `${qualityKm} km Quality Workout`;

    if (isRaceWeek) {
      qualityTitle = '4 km Pre-Race Tune-up';
      qualityDetails = `1.5 km easy warm-up, 4x200m strides @ ${gmpPaceStr}, 1.5 km cool-down. Keep legs sharp and light.`;
    } else if (w % 2 === 1) {
      // Intervals
      if (w <= 4) {
        qualityTitle = `${qualityKm} km: 6x400m Repeats`;
        qualityDetails = `2 km warm-up (${aerobicPaceStr}), 6x400m fast repeats @ ${intervalPaceStr} (90s jog rest), 2 km cool-down.`;
      } else if (w <= 8) {
        qualityTitle = `${qualityKm} km: 5x800m Repeats`;
        qualityDetails = `2 km warm-up, 5x800m repeats @ ${intervalPaceStr} (2m jog rest), 2 km cool-down. Focus on smooth rhythm.`;
      } else if (w <= 12) {
        qualityTitle = `${qualityKm} km: 4x1.2km Repeats`;
        qualityDetails = `2 km warm-up, 4x1.2km repeats @ ${intervalPaceStr} (2m30s rest), 2 km cool-down. Strong aerobic power.`;
      } else {
        qualityTitle = `${qualityKm} km: 4x1.6km Repeats`;
        qualityDetails = `2 km warm-up, 4x1.6km threshold repeats @ ${tempoPaceStr} (2m rest), 2 km cool-down.`;
      }
    } else {
      // Sustained Tempo / Threshold
      const tempoBlockKm = Math.max(4, qualityKm - 4);
      qualityTitle = `${qualityKm} km: ${tempoBlockKm} km Sustained Tempo`;
      qualityDetails = `2 km warm-up (${aerobicPaceStr}), ${tempoBlockKm} km continuous tempo at Lactate Threshold (${tempoPaceStr}), 2 km cool-down. Comfortably hard.`;
    }

    // Build day objects
    const makeDay = (
      dayName: DaySchedule['dayName'],
      dayOffset: number,
      type: WorkoutType,
      title: string,
      km: number,
      details: string,
      targetPace?: string
    ): DaySchedule => {
      const dDate = addDays(mondayDate, dayOffset);
      return {
        dayName,
        dateStr: formatDateLabel(dDate),
        fullDate: dDate.toISOString().split('T')[0],
        type,
        title,
        plannedKm: km,
        details,
        targetPace,
        completed: false,
      };
    };

    const makeRestDay = (dayName: DaySchedule['dayName'], dayOffset: number): DaySchedule => {
      const dDate = addDays(mondayDate, dayOffset);
      return {
        dayName,
        dateStr: formatDateLabel(dDate),
        fullDate: dDate.toISOString().split('T')[0],
        type: 'rest',
        title: 'Rest & Recovery',
        plannedKm: 0,
        details: 'Full rest day. Foam roll, stretch, hydrate, and get quality sleep.',
        completed: false,
      };
    };

    // Assign workouts across week based on frequency & preferred long run day
    let monday: DaySchedule;
    let tuesday: DaySchedule;
    let wednesday: DaySchedule;
    let thursday: DaySchedule;
    let friday: DaySchedule;
    let saturday: DaySchedule;
    let sunday: DaySchedule;

    const isLongRunSat = longRunDay === 'saturday';

    if (daysPerWeek === 3) {
      // 3 days: Tue (Aerobic), Thu (Quality), Weekend (Long Run)
      monday = makeRestDay('Monday', 0);
      tuesday = makeDay('Tuesday', 1, 'aerobic', `${aerobicKm} km Aerobic Run`, aerobicKm, `Steady aerobic base run at ${aerobicPaceStr}.`, aerobicPaceStr);
      wednesday = makeRestDay('Wednesday', 2);
      thursday = makeDay('Thursday', 3, 'quality', qualityTitle, qualityKm, qualityDetails, tempoPaceStr);
      friday = makeRestDay('Friday', 4);
      saturday = isLongRunSat
        ? makeDay('Saturday', 5, 'long_run', `${longRunKm} km Long Run`, longRunKm, longRunDetails, isRaceWeek ? gmpPaceStr : aerobicPaceStr)
        : makeRestDay('Saturday', 5);
      sunday = !isLongRunSat
        ? makeDay('Sunday', 6, 'long_run', `${longRunKm} km Long Run`, longRunKm, longRunDetails, isRaceWeek ? gmpPaceStr : aerobicPaceStr)
        : makeRestDay('Sunday', 6);
    } else if (daysPerWeek === 4) {
      // 4 days: Mon (Recovery), Tue (Aerobic), Thu (Quality), Weekend (Long Run)
      monday = makeDay('Monday', 0, 'recovery', `${recoveryKm} km Recovery Jog`, recoveryKm, `Flush out legs at very easy pace (${recoveryPaceStr}). Keep effort minimal.`, recoveryPaceStr);
      tuesday = makeDay('Tuesday', 1, 'aerobic', `${aerobicKm} km Aerobic Volume`, aerobicKm, `Smooth easy aerobic run at ${aerobicPaceStr}. Accumulate volume.`, aerobicPaceStr);
      wednesday = makeRestDay('Wednesday', 2);
      thursday = makeDay('Thursday', 3, 'quality', qualityTitle, qualityKm, qualityDetails, tempoPaceStr);
      friday = makeRestDay('Friday', 4);
      saturday = isLongRunSat
        ? makeDay('Saturday', 5, 'long_run', `${longRunKm} km Long Run`, longRunKm, longRunDetails, isRaceWeek ? gmpPaceStr : aerobicPaceStr)
        : makeRestDay('Saturday', 5);
      sunday = !isLongRunSat
        ? makeDay('Sunday', 6, 'long_run', `${longRunKm} km Long Run`, longRunKm, longRunDetails, isRaceWeek ? gmpPaceStr : aerobicPaceStr)
        : makeRestDay('Sunday', 6);
    } else if (daysPerWeek === 5) {
      // 5 days: Mon (Recovery), Tue (Aerobic), Wed (Rest), Thu (Quality), Fri (Easy), Weekend (Long Run)
      monday = makeDay('Monday', 0, 'recovery', `${recoveryKm} km Recovery Run`, recoveryKm, `Slow conversational flush run (${recoveryPaceStr}).`, recoveryPaceStr);
      tuesday = makeDay('Tuesday', 1, 'aerobic', `${aerobicKm} km Aerobic Mid-Long`, aerobicKm, `Smooth continuous aerobic volume (${aerobicPaceStr}).`, aerobicPaceStr);
      wednesday = makeRestDay('Wednesday', 2);
      thursday = makeDay('Thursday', 3, 'quality', qualityTitle, qualityKm, qualityDetails, tempoPaceStr);
      friday = makeDay('Friday', 4, 'easy', `${easyKm} km Easy Shakeout`, easyKm, `Short light jog (${easyPaceStr}) to keep legs springy.`, easyPaceStr);
      saturday = isLongRunSat
        ? makeDay('Saturday', 5, 'long_run', `${longRunKm} km Long Run`, longRunKm, longRunDetails, isRaceWeek ? gmpPaceStr : aerobicPaceStr)
        : makeRestDay('Saturday', 5);
      sunday = !isLongRunSat
        ? makeDay('Sunday', 6, 'long_run', `${longRunKm} km Long Run`, longRunKm, longRunDetails, isRaceWeek ? gmpPaceStr : aerobicPaceStr)
        : makeRestDay('Sunday', 6);
    } else {
      // 6 days: Mon (Recovery), Tue (Aerobic), Wed (Easy/Aerobic), Thu (Quality), Fri (Easy), Weekend (Long Run)
      monday = makeDay('Monday', 0, 'recovery', `${recoveryKm} km Recovery Run`, recoveryKm, `Slow conversational recovery (${recoveryPaceStr}).`, recoveryPaceStr);
      tuesday = makeDay('Tuesday', 1, 'aerobic', `${aerobicKm} km Aerobic Volume`, aerobicKm, `Steady aerobic base run (${aerobicPaceStr}).`, aerobicPaceStr);
      wednesday = makeDay('Wednesday', 2, 'aerobic', `${Math.round(aerobicKm * 0.75)} km Aerobic Run`, Math.round(aerobicKm * 0.75), `Mid-week aerobic miles at ${aerobicPaceStr}.`, aerobicPaceStr);
      thursday = makeDay('Thursday', 3, 'quality', qualityTitle, qualityKm, qualityDetails, tempoPaceStr);
      friday = makeDay('Friday', 4, 'easy', `${easyKm} km Shakeout`, easyKm, `Light shakeout jog at ${easyPaceStr}.`, easyPaceStr);
      saturday = isLongRunSat
        ? makeDay('Saturday', 5, 'long_run', `${longRunKm} km Long Run`, longRunKm, longRunDetails, isRaceWeek ? gmpPaceStr : aerobicPaceStr)
        : makeRestDay('Saturday', 5);
      sunday = !isLongRunSat
        ? makeDay('Sunday', 6, 'long_run', `${longRunKm} km Long Run`, longRunKm, longRunDetails, isRaceWeek ? gmpPaceStr : aerobicPaceStr)
        : makeRestDay('Sunday', 6);
    }

    const days = {
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
    };

    const plannedDist = Math.round(
      (Object.values(days) as DaySchedule[]).reduce((sum, d) => sum + d.plannedKm, 0) * 10
    ) / 10;

    let notes = '';
    if (isRaceWeek) {
      notes = `Race week! Prioritize carbo-loading, hydration, sleep, and mental visualization.`;
    } else if (isCutbackWeek) {
      notes = `Scheduled cutback down-week for muscular adaptation and glycogen replenishment.`;
    } else if (phase === 'Peak & Specificity') {
      notes = `High specificity phase. Focus on race simulation and marathon pace lock-in.`;
    } else {
      notes = `Building consistent aerobic engine and aerobic capacity.`;
    }

    weeks.push({
      weekNumber: w,
      dateMon,
      plannedDist,
      phase,
      notes,
      days,
    });
  }

  return weeks;
};
