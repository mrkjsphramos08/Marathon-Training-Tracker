/**
 * Race Prediction & Fitness Calibration Utilities
 * Uses Peter Riegel's endurance performance formula:
 * T2 = T1 * (D2 / D1)^1.06
 * The standard in exercise physiology for predicting race times across distances.
 */

export interface RaceDistance {
  id: string;
  name: string;
  distanceKm: number;
}

export const STANDARD_DISTANCES: RaceDistance[] = [
  { id: '5k', name: '5K (5.0 km)', distanceKm: 5.0 },
  { id: '10k', name: '10K (10.0 km)', distanceKm: 10.0 },
  { id: 'half_marathon', name: 'Half Marathon (21.1 km)', distanceKm: 21.0975 },
  { id: 'marathon', name: 'Full Marathon (42.2 km)', distanceKm: 42.195 },
];

export function parseTimeToSeconds(hours: number, minutes: number, seconds: number): number {
  return (Math.max(0, hours) * 3600) + (Math.max(0, minutes) * 60) + Math.max(0, seconds);
}

export function formatSecondsToHms(totalSeconds: number): {
  hours: number;
  minutes: number;
  seconds: number;
  formattedTime: string;
  pacePerKm: string;
} {
  const rounded = Math.round(totalSeconds);
  const h = Math.floor(rounded / 3600);
  const m = Math.floor((rounded % 3600) / 60);
  const s = rounded % 60;

  let formattedTime = '';
  if (h > 0) {
    formattedTime = `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  } else {
    formattedTime = `${m}:${s.toString().padStart(2, '0')}`;
  }

  return {
    hours: h,
    minutes: m,
    seconds: s,
    formattedTime,
    pacePerKm: '',
  };
}

export function calculatePace(totalSeconds: number, distanceKm: number): string {
  if (distanceKm <= 0 || totalSeconds <= 0) return '0:00/km';
  const paceSeconds = Math.round(totalSeconds / distanceKm);
  const pMin = Math.floor(paceSeconds / 60);
  const pSec = paceSeconds % 60;
  return `${pMin}:${pSec.toString().padStart(2, '0')}/km`;
}

/**
 * Predict race time given a previous race result
 */
export function predictRaceTime(
  sourceDistKm: number,
  sourceTimeSeconds: number,
  targetDistKm: number,
  fatigueExponent: number = 1.06
): {
  predictedSeconds: number;
  formattedTime: string;
  pacePerKm: string;
  hours: number;
  minutes: number;
  seconds: number;
} {
  if (sourceDistKm <= 0 || sourceTimeSeconds <= 0 || targetDistKm <= 0) {
    return {
      predictedSeconds: 0,
      formattedTime: '0:00:00',
      pacePerKm: '0:00/km',
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  // Riegel's Formula: T2 = T1 * (D2 / D1)^1.06
  const predictedSeconds = Math.round(
    sourceTimeSeconds * Math.pow(targetDistKm / sourceDistKm, fatigueExponent)
  );

  const hms = formatSecondsToHms(predictedSeconds);
  const pace = calculatePace(predictedSeconds, targetDistKm);

  return {
    predictedSeconds,
    formattedTime: hms.formattedTime,
    pacePerKm: pace,
    hours: hms.hours,
    minutes: hms.minutes,
    seconds: hms.seconds,
  };
}

/**
 * Predict times across all standard distances given a single benchmark race
 */
export function predictAllDistances(sourceDistKm: number, sourceTimeSeconds: number) {
  return STANDARD_DISTANCES.map((target) => {
    const prediction = predictRaceTime(sourceDistKm, sourceTimeSeconds, target.distanceKm);
    return {
      id: target.id,
      name: target.name,
      distanceKm: target.distanceKm,
      ...prediction,
    };
  });
}

/**
 * Estimate VO2max / VDOT from 5k or 10k or Marathon
 */
export function estimateVDOT(distanceKm: number, timeSeconds: number): number {
  if (distanceKm <= 0 || timeSeconds <= 0) return 0;
  const timeMinutes = timeSeconds / 60;
  const velocityMpm = (distanceKm * 1000) / timeMinutes; // meters per minute
  
  // Daniels VO2 formula
  const vo2Cost = -4.60 + 0.182258 * velocityMpm + 0.000104 * Math.pow(velocityMpm, 2);
  const percentMax = 0.8 + 0.1894393 * Math.exp(-0.012778 * timeMinutes) + 0.2989558 * Math.exp(-0.1932605 * timeMinutes);
  const vdot = vo2Cost / percentMax;
  
  return Math.round(vdot * 10) / 10;
}
