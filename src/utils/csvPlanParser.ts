import { TrainingWeek, DaySchedule, WorkoutType } from '../types';
import { calculatePacePerKm, parseDurationToSeconds } from './paceCalculations';

export const CSV_TEMPLATE_HEADER =
  'Week,Phase,Date_Mon,Mon_Type,Mon_Km,Mon_Desc,Tue_Type,Tue_Km,Tue_Desc,Wed_Type,Wed_Km,Wed_Desc,Thu_Type,Thu_Km,Thu_Desc,Fri_Type,Fri_Km,Fri_Desc,Sat_Type,Sat_Km,Sat_Desc,Sun_Type,Sun_Km,Sun_Desc,Notes';

/**
 * Generate a clean, well-commented CSV template ready for Excel / Google Sheets / Numbers.
 */
export const generateSampleCsvTemplate = (): string => {
  const rows: string[] = [
    '# Marathon & Running Training Plan CSV Template',
    '# INSTRUCTIONS:',
    '# 1. Workout types supported: recovery, aerobic, quality, easy, long_run, rest',
    '# 2. Enter planned distance in km (numbers only, e.g. 8 or 12.5; use 0 for Rest)',
    '# 3. Add descriptions, target paces (e.g. "6x800m @ 5:00/km" or "GMP 5:40/km"), or notes inside quotes',
    '# 4. You can have any number of weeks (e.g., 8, 12, 16, 18, 24 weeks)',
    CSV_TEMPLATE_HEADER,
    '1,Base & Aerobic Build,Oct 12,recovery,6,"Recovery jog 6:45–7:00/km",aerobic,10,"Steady aerobic volume",rest,0,"Rest & stretch",quality,8,"6x400m intervals @ 4:50/km",easy,5,"Shakeout jog 6:30/km",rest,0,"Rest",long_run,16,"Easy long run 6:15/km","Week 1 baseline build"',
    '2,Base & Aerobic Build,Oct 19,recovery,7,"Recovery jog",aerobic,11,"Aerobic base run",rest,0,"Rest",quality,10,"4x1km repeats @ 5:05/km",easy,6,"Light shakeout",rest,0,"Rest",long_run,18,"Progressive long run","Building aerobic base"',
    '3,Base & Aerobic Build,Oct 26,recovery,8,"Recovery jog",aerobic,12,"Steady aerobic run",rest,0,"Rest",quality,10,"5km tempo @ 5:20/km",easy,6,"Light jog",rest,0,"Rest",long_run,20,"Long run with 4km GMP","First 20km milestone"',
    '4,Threshold & Volume,Nov 02,recovery,8,"Recovery jog",aerobic,12,"Aerobic volume",rest,0,"Rest",quality,11,"6x800m repeats @ 5:00/km",easy,6,"Light jog",rest,0,"Rest",long_run,22,"Long run steady 6:15/km","Consistent volume"',
    '5,Threshold & Volume,Nov 09,recovery,8,"Recovery jog",aerobic,13,"Aerobic mid-long",rest,0,"Rest",quality,12,"6km tempo @ 5:20/km",easy,6,"Light jog",rest,0,"Rest",long_run,24,"Time on feet long run","Solid threshold week"',
    '6,Threshold & Volume,Nov 16,recovery,6,"Recovery cutback",aerobic,10,"Easy aerobic",rest,0,"Rest",quality,8,"4x1km @ 5:05/km",easy,5,"Light jog",rest,0,"Rest",long_run,18,"Cutback recovery long run","Down week for adaptation"',
    '7,Threshold & Volume,Nov 23,recovery,8,"Recovery jog",aerobic,14,"Aerobic mid-long",rest,0,"Rest",quality,12,"8x400m fast repeats",easy,6,"Light jog",rest,0,"Rest",long_run,26,"Long run with 6km GMP","Peak threshold phase"',
    '8,Peak & Specificity,Nov 30,recovery,9,"Recovery jog",aerobic,14,"Aerobic volume",rest,0,"Rest",quality,13,"7km tempo @ 5:20/km",easy,6,"Light jog",rest,0,"Rest",long_run,28,"Long run steady","Endurance peak"',
    '9,Peak & Specificity,Dec 07,recovery,9,"Recovery jog",aerobic,15,"Aerobic mid-long",rest,0,"Rest",quality,14,"5x1.6km repeats",easy,7,"Light jog",rest,0,"Rest",long_run,30,"Key 30km Long Run","30km milestone!"',
    '10,Peak & Specificity,Dec 14,recovery,7,"Recovery cutback",aerobic,11,"Easy aerobic",rest,0,"Rest",quality,10,"4x1km repeats",easy,5,"Light jog",rest,0,"Rest",long_run,20,"Down week long run","Mid-phase recovery"',
    '11,Peak & Specificity,Dec 21,recovery,9,"Recovery jog",aerobic,15,"Aerobic volume",rest,0,"Rest",quality,14,"8km tempo @ 5:20/km",easy,7,"Light jog",rest,0,"Rest",long_run,32,"Peak 32km Long Run (10k GMP)","Crucial race simulation"',
    '12,Peak & Specificity,Dec 28,recovery,10,"Recovery jog",aerobic,16,"Aerobic mid-long",rest,0,"Rest",quality,14,"4x2km tempo intervals",easy,7,"Light jog",rest,0,"Rest",long_run,34,"Highest Volume 34km Long Run","Peak mileage week"',
    '13,Peak & Specificity,Jan 04,recovery,8,"Recovery jog",aerobic,13,"Aerobic base",rest,0,"Rest",quality,11,"6x1km repeats",easy,6,"Light jog",rest,0,"Rest",long_run,26,"Steady long run","Consolidating fitness"',
    '14,Peak & Specificity,Jan 11,recovery,9,"Recovery jog",aerobic,14,"Aerobic volume",rest,0,"Rest",quality,13,"10km GMP continuous",easy,6,"Light jog",rest,0,"Rest",long_run,30,"Final 30km with 12km GMP","Final peak long run"',
    '15,Taper & Race,Jan 18,recovery,8,"Recovery jog",aerobic,12,"Aerobic easy",rest,0,"Rest",quality,10,"4x1.2km @ 5:10/km",easy,5,"Light jog",rest,0,"Rest",long_run,22,"Taper week 1 long run","Taper Phase 1 - 75% volume"',
    '16,Taper & Race,Jan 25,recovery,7,"Recovery jog",aerobic,10,"Aerobic light",rest,0,"Rest",quality,8,"5km tempo @ 5:20/km",easy,5,"Light jog",rest,0,"Rest",long_run,16,"Taper week 2 long run","Taper Phase 2 - 50% volume"',
    '17,Taper & Race,Feb 01,recovery,6,"Recovery jog",aerobic,8,"Aerobic easy",rest,0,"Rest",quality,6,"4x400m sharpeners",easy,4,"Shakeout jog",rest,0,"Rest",long_run,12,"Sharpening long run","Final tune-up week"',
    '18,Taper & Race,Feb 08,recovery,5,"Recovery jog",aerobic,6,"Light aerobic",rest,0,"Rest",quality,5,"2km GMP strides",easy,3,"Pre-race shakeout",rest,0,"Rest",long_run,42.2,"MARATHON RACE DAY 42.2km","RACE DAY! Trust your training"',
  ];

  return rows.join('\n');
};

/**
 * Robust CSV line splitter that handles commas inside double quotes.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Normalizes workout type string.
 */
function normalizeWorkoutType(rawType: string, distance: number): WorkoutType {
  const t = (rawType || '').toLowerCase().trim();
  if (distance === 0 || t === 'rest' || t.startsWith('rest')) return 'rest';
  if (t.includes('recov')) return 'recovery';
  if (t.includes('aerob') || t.includes('mid-long') || t.includes('base')) return 'aerobic';
  if (t.includes('qual') || t.includes('tempo') || t.includes('interval') || t.includes('speed') || t.includes('repeat') || t.includes('threshold') || t.includes('fartlek')) return 'quality';
  if (t.includes('long') || t.includes('marathon') || t.includes('race')) return 'long_run';
  if (t.includes('easy') || t.includes('shake')) return 'easy';
  
  // Default based on distance heuristics
  if (distance >= 16) return 'long_run';
  if (distance <= 6) return 'recovery';
  return 'aerobic';
}

/**
 * Extracts specific workout subtype, e.g. "(Easy Fartlek)" -> "Easy Fartlek", "(Time on Feet)" -> "Time on Feet".
 */
function extractSubtype(rawType: string): string | undefined {
  if (!rawType) return undefined;
  const parenMatch = rawType.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1].trim()) {
    return parenMatch[1].trim();
  }
  const clean = rawType.trim();
  if (/test\s*race/i.test(clean)) return 'Test Race';
  if (/race\s*day/i.test(clean)) return 'Goal Race';
  if (/shakeout/i.test(clean)) return 'Shakeout';
  if (/fartlek/i.test(clean)) return 'Fartlek';
  if (/tempo/i.test(clean)) return 'Tempo';
  if (/interval/i.test(clean)) return 'Intervals';
  return undefined;
}

/**
 * Derives a clean, descriptive display title for the workout.
 */
function deriveWorkoutTitle(rawType: string, type: WorkoutType, km: number, subtype?: string): string {
  const trimmed = (rawType || '').trim();
  if (trimmed) {
    if (trimmed.toLowerCase() === 'rest') return 'Rest Day';
    return trimmed;
  }
  if (km === 0 || type === 'rest') return 'Rest Day';
  if (subtype) return `${type === 'quality' ? 'Quality' : type === 'long_run' ? 'Long Run' : type}: ${subtype}`;
  return `${km} km ${type.replace('_', ' ')}`;
}

/**
 * Formats individual dates for each day of the week from the Monday starting date string.
 */
function getDayDate(mondayStr: string, dayIndex: number): { dateStr: string; fullDate?: string } {
  if (!mondayStr) return { dateStr: '' };
  const trimmed = mondayStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d + dayIndex));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthStr = months[date.getUTCMonth()];
    const dayNum = date.getUTCDate();
    const iso = date.toISOString().split('T')[0];
    return {
      dateStr: `${monthStr} ${dayNum}`,
      fullDate: iso,
    };
  }
  return {
    dateStr: trimmed,
  };
}

/**
 * Attempts to extract target pace from description or type text (e.g. "5:40/km", "6:15-6:30/km", "@ 5:20", "GMP").
 */
function extractTargetPace(desc: string, rawType?: string): string | undefined {
  const combined = `${desc || ''} ${rawType || ''}`;
  if (!combined.trim()) return undefined;
  
  // Check range first (e.g. 6:15-6:30/km, 6:30–7:00 /km)
  const matchRange = combined.match(/(\d+:\d+)\s*(?:–|-|to)\s*(\d+:\d+)\s*(?:\/km)?/i);
  if (matchRange) {
    return `${matchRange[1]}–${matchRange[2]}/km`;
  }
  // Check single pace (e.g. 5:40/km, @ 5:20)
  const matchSingle = combined.match(/(?:@\s*|pace\s*:?\s*|into\s*(?:your)?\s*)?(\d+:\d+)\s*(?:\/km)?/i);
  if (matchSingle) {
    return `${matchSingle[1]}/km`;
  }
  // Check Goal Marathon Pace mentions
  if (/gmp|goal\s*marathon\s*pace/i.test(combined)) {
    return '5:40/km (GMP)';
  }
  return undefined;
}

export interface ParseResult {
  success: boolean;
  plan?: TrainingWeek[];
  error?: string;
  warning?: string;
  weeksCount?: number;
  totalKm?: number;
}

/**
 * Parse any CSV content into TrainingWeek[] structure.
 */
export const parseCsvToPlan = (csvContent: string): ParseResult => {
  if (!csvContent || typeof csvContent !== 'string') {
    return { success: false, error: 'Empty or invalid CSV content provided.' };
  }

  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  if (lines.length === 0) {
    return { success: false, error: 'CSV file contains no data rows.' };
  }

  // Find header index
  let headerIndex = -1;
  let isStandardFormat = false;

  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const l = lines[i].toLowerCase();
    if (l.includes('week') && (l.includes('mon') || l.includes('date'))) {
      headerIndex = i;
      isStandardFormat = true;
      break;
    }
  }

  if (headerIndex === -1) {
    // If no explicit header, assume first line is header if it contains non-numbers
    const firstCols = parseCsvLine(lines[0]);
    if (isNaN(Number(firstCols[0]))) {
      headerIndex = 0;
    }
  }

  const dataLines = headerIndex >= 0 ? lines.slice(headerIndex + 1) : lines;
  if (dataLines.length === 0) {
    return { success: false, error: 'No data rows found below CSV header.' };
  }

  const parsedWeeks: TrainingWeek[] = [];

  for (let idx = 0; idx < dataLines.length; idx++) {
    const rawLine = dataLines[idx];
    if (rawLine.startsWith('#') || rawLine.replace(/,/g, '').trim() === '') continue;

    const cols = parseCsvLine(rawLine);
    if (cols.length < 5) continue;

    const weekNumber = parseInt(cols[0], 10) || parsedWeeks.length + 1;
    let phaseStr = cols[1] || 'Base & Aerobic Build';
    let dateMon = cols[2] || `Week ${weekNumber}`;

    // Normalize phase
    let phase: TrainingWeek['phase'] = 'Base & Aerobic Build';
    const pl = phaseStr.toLowerCase().trim();
    if (pl.includes('taper') || pl.includes('race')) phase = 'Taper & Race';
    else if (pl.includes('peak') || pl.includes('specif')) phase = 'Peak & Specificity';
    else if (pl.includes('thresh') || pl.includes('volume') || pl === 'build' || (pl.includes('build') && !pl.includes('base') && !pl.includes('aerob'))) phase = 'Threshold & Volume';
    else phase = 'Base & Aerobic Build';

    // Formatted week header date display (e.g. "Sep 21 – Sep 27" if YYYY-MM-DD)
    let displayWeekDate = dateMon;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateMon.trim())) {
      const monDate = getDayDate(dateMon, 0).dateStr;
      const sunDate = getDayDate(dateMon, 6).dateStr;
      displayWeekDate = `${monDate} – ${sunDate}`;
    }

    // Handle columns mapping:
    // Format A: Mon_Type, Mon_Km, Mon_Desc, Tue_Type, Tue_Km, Tue_Desc, ... (3 cols per day)
    // Format B: Monday (Recovery), Tuesday (Aerobic), Wednesday (Rest), Thursday (Quality), ... (simpler layout)
    
    let days: TrainingWeek['days'];

    if (cols.length >= 23) {
      // Standard 24-col format: Week(0), Phase(1), Date_Mon(2), Mon(3,4,5), Tue(6,7,8), Wed(9,10,11), Thu(12,13,14), Fri(15,16,17), Sat(18,19,20), Sun(21,22,23), Notes(24)
      const parseDay = (
        dayName: DaySchedule['dayName'],
        dayIndex: number,
        typeCol: string,
        kmCol: string,
        descCol: string
      ): DaySchedule => {
        const km = parseFloat(kmCol) || 0;
        const type = normalizeWorkoutType(typeCol, km);
        const subtype = extractSubtype(typeCol);
        const title = deriveWorkoutTitle(typeCol, type, km, subtype);
        const details = (descCol || '').trim() || (km > 0 ? `${km} km ${type.replace('_', ' ')}` : 'Rest and recover');
        const targetPace = extractTargetPace(details, typeCol);
        const { dateStr, fullDate } = getDayDate(dateMon, dayIndex);

        return {
          dayName,
          dateStr: dateStr || dateMon,
          fullDate,
          type,
          rawType: (typeCol || '').trim(),
          subtype,
          title,
          plannedKm: km,
          details,
          targetPace,
          completed: false,
        };
      };

      days = {
        monday: parseDay('Monday', 0, cols[3], cols[4], cols[5]),
        tuesday: parseDay('Tuesday', 1, cols[6], cols[7], cols[8]),
        wednesday: parseDay('Wednesday', 2, cols[9], cols[10], cols[11]),
        thursday: parseDay('Thursday', 3, cols[12], cols[13], cols[14]),
        friday: parseDay('Friday', 4, cols[15], cols[16], cols[17]),
        saturday: parseDay('Saturday', 5, cols[18], cols[19], cols[20]),
        sunday: parseDay('Sunday', 6, cols[21], cols[22], cols[23]),
      };
    } else {
      // Simpler columns fallback (e.g. Week, Date, Mon_Km, Tue_Km, Wed_Km, Thu_Km, Fri_Km, Sat_Km, Sun_Km, Notes)
      const parseSimpleDay = (
        dayName: DaySchedule['dayName'],
        dayIndex: number,
        rawVal: string,
        fallbackType: WorkoutType
      ): DaySchedule => {
        const numMatch = (rawVal || '').match(/(\d+(?:\.\d+)?)/);
        const km = numMatch ? parseFloat(numMatch[1]) : 0;
        const type = km === 0 ? 'rest' : normalizeWorkoutType(rawVal, km) || fallbackType;
        const subtype = extractSubtype(rawVal);
        const title = deriveWorkoutTitle(rawVal, type, km, subtype);
        const details = rawVal || (km > 0 ? `${km} km workout` : 'Rest and recover');
        const targetPace = extractTargetPace(details, rawVal);
        const { dateStr, fullDate } = getDayDate(dateMon, dayIndex);

        return {
          dayName,
          dateStr: dateStr || dateMon,
          fullDate,
          type,
          rawType: (rawVal || '').trim(),
          subtype,
          title,
          plannedKm: km,
          details,
          targetPace,
          completed: false,
        };
      };

      days = {
        monday: parseSimpleDay('Monday', 0, cols[2] || cols[3] || '', 'recovery'),
        tuesday: parseSimpleDay('Tuesday', 1, cols[3] || cols[4] || '', 'aerobic'),
        wednesday: parseSimpleDay('Wednesday', 2, cols[4] || cols[5] || '', 'rest'),
        thursday: parseSimpleDay('Thursday', 3, cols[5] || cols[6] || '', 'quality'),
        friday: parseSimpleDay('Friday', 4, cols[6] || cols[7] || '', 'easy'),
        saturday: parseSimpleDay('Saturday', 5, cols[7] || cols[8] || '', 'rest'),
        sunday: parseSimpleDay('Sunday', 6, cols[8] || cols[9] || '', 'long_run'),
      };
    }

    const plannedDist = Math.round(
      (Object.values(days) as DaySchedule[]).reduce((sum, d) => sum + d.plannedKm, 0) * 10
    ) / 10;

    const notes = cols[24] || cols[cols.length - 1] || '';

    parsedWeeks.push({
      weekNumber,
      dateMon: displayWeekDate,
      plannedDist,
      phase,
      notes: notes.startsWith('Week') || notes.startsWith('#') ? '' : notes,
      days,
    });
  }

  if (parsedWeeks.length === 0) {
    return { success: false, error: 'Could not extract valid training weeks from CSV.' };
  }

  const totalKm = Math.round(parsedWeeks.reduce((s, w) => s + w.plannedDist, 0) * 10) / 10;

  return {
    success: true,
    plan: parsedWeeks,
    weeksCount: parsedWeeks.length,
    totalKm,
  };
};

/**
 * Export any active plan to standard importable CSV format.
 */
export const exportPlanToCsv = (plan: TrainingWeek[]): string => {
  const rows: string[] = [CSV_TEMPLATE_HEADER];

  plan.forEach((w) => {
    const d = w.days;
    const clean = (str?: string) => `"${(str || '').replace(/"/g, '""')}"`;

    const row = [
      w.weekNumber,
      clean(w.phase),
      clean(w.dateMon),
      clean(d.monday.rawType || d.monday.title || d.monday.type),
      d.monday.plannedKm,
      clean(d.monday.details || d.monday.title),
      clean(d.tuesday.rawType || d.tuesday.title || d.tuesday.type),
      d.tuesday.plannedKm,
      clean(d.tuesday.details || d.tuesday.title),
      clean(d.wednesday.rawType || d.wednesday.title || d.wednesday.type),
      d.wednesday.plannedKm,
      clean(d.wednesday.details || d.wednesday.title),
      clean(d.thursday.rawType || d.thursday.title || d.thursday.type),
      d.thursday.plannedKm,
      clean(d.thursday.details || d.thursday.title),
      clean(d.friday.rawType || d.friday.title || d.friday.type),
      d.friday.plannedKm,
      clean(d.friday.details || d.friday.title),
      clean(d.saturday.rawType || d.saturday.title || d.saturday.type),
      d.saturday.plannedKm,
      clean(d.saturday.details || d.saturday.title),
      clean(d.sunday.rawType || d.sunday.title || d.sunday.type),
      d.sunday.plannedKm,
      clean(d.sunday.details || d.sunday.title),
      clean(w.notes),
    ];
    rows.push(row.join(','));
  });

  return rows.join('\n');
};
