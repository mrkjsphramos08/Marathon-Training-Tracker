export const parseDurationToSeconds = (durationStr: string): number => {
  if (!durationStr) return 0;
  const parts = durationStr.split(':').map((p) => parseInt(p.trim(), 10) || 0);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0] * 60;
  }
  return 0;
};

export const formatSecondsToDuration = (totalSeconds: number): string => {
  if (!totalSeconds || totalSeconds <= 0) return '00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
};

export const calculatePacePerKm = (km: number, seconds: number): string => {
  if (!km || km <= 0 || !seconds || seconds <= 0) return '-:-- /km';
  const secondsPerKm = seconds / km;
  const paceMinutes = Math.floor(secondsPerKm / 60);
  const paceSeconds = Math.round(secondsPerKm % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${paceMinutes}:${pad(paceSeconds)} /km`;
};

export const paceToSecondsPerKm = (paceStr: string): number => {
  const match = paceStr.match(/(\d+):(\d+)/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
};

export interface PaceZoneCalculated {
  name: string;
  paceStr: string;
  minPaceSec: number;
  maxPaceSec: number;
  description: string;
}

export const calculateZonesForGoalTime = (hours: number, minutes: number): PaceZoneCalculated[] => {
  const totalMarathonSeconds = hours * 3600 + minutes * 60;
  const gmpSeconds = totalMarathonSeconds / 42.195;

  const fmtPace = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')} /km`;
  };

  const recoveryMin = gmpSeconds + 60;
  const recoveryMax = gmpSeconds + 80;

  const aerobicMin = gmpSeconds + 35;
  const aerobicMax = gmpSeconds + 50;

  const easySec = gmpSeconds + 50;

  const tempoSec = gmpSeconds - 20;

  const intervalMin = gmpSeconds - 50;
  const intervalMax = gmpSeconds - 30;

  return [
    {
      name: 'Recovery',
      paceStr: `${fmtPace(recoveryMin)} – ${fmtPace(recoveryMax)}`,
      minPaceSec: recoveryMin,
      maxPaceSec: recoveryMax,
      description: 'Slow, conversational flush run',
    },
    {
      name: 'Aerobic / Mid-Long',
      paceStr: `${fmtPace(aerobicMin)} – ${fmtPace(aerobicMax)}`,
      minPaceSec: aerobicMin,
      maxPaceSec: aerobicMax,
      description: 'Aerobic base building',
    },
    {
      name: 'Easy Jog',
      paceStr: fmtPace(easySec),
      minPaceSec: easySec - 10,
      maxPaceSec: easySec + 10,
      description: 'Light shakeout',
    },
    {
      name: 'Goal Marathon Pace (GMP)',
      paceStr: fmtPace(gmpSeconds),
      minPaceSec: gmpSeconds - 5,
      maxPaceSec: gmpSeconds + 5,
      description: 'Exact race day target pace',
    },
    {
      name: 'Tempo / Threshold',
      paceStr: fmtPace(tempoSec),
      minPaceSec: tempoSec - 10,
      maxPaceSec: tempoSec + 10,
      description: 'Comfortably hard sustained threshold',
    },
    {
      name: 'Intervals (VO2 Max)',
      paceStr: `${fmtPace(intervalMin)} – ${fmtPace(intervalMax)}`,
      minPaceSec: intervalMin,
      maxPaceSec: intervalMax,
      description: '400m - 1.6km repeat reps',
    },
  ];
};

/**
 * Splits raw workout title into clean main title and short description badge.
 * e.g. "Quality Workout (Easy Fartlek)" -> mainTitle: "Quality Workout", badge: "Easy Fartlek"
 * e.g. "Long Run (Time on Feet)" -> mainTitle: "Long Run", badge: "Time on Feet"
 */
export const formatWorkoutDisplay = (
  title: string,
  subtype?: string
): { mainTitle: string; badge?: string } => {
  if (!title) return { mainTitle: '', badge: subtype };

  // If subtype already provided, strip it from title if present
  if (subtype) {
    const escaped = subtype.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const clean = title.replace(new RegExp(`\\s*\\(${escaped}\\)\\s*$`, 'i'), '').trim();
    return { mainTitle: clean || title, badge: subtype };
  }

  // If no subtype, try extracting parenthetical from title
  const match = title.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (match && match[1].trim() && match[2].trim()) {
    return { mainTitle: match[1].trim(), badge: match[2].trim() };
  }

  return { mainTitle: title, badge: undefined };
};
