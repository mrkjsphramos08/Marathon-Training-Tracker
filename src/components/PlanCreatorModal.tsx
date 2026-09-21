import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  Sparkles,
  Trophy,
  Activity,
  Layers,
  MapPin,
  TrendingUp,
  Info,
  ChevronDown,
  ShieldCheck,
  Calculator,
  ArrowRight,
  Check,
  Plus,
  Minus,
  CheckCircle2,
  RefreshCw,
  Flag,
} from 'lucide-react';
import { TrainingWeek, DaySchedule } from '../types';
import { generateCustomPlan, PlanGeneratorOptions } from '../utils/planGenerator';
import {
  STANDARD_DISTANCES,
  predictRaceTime,
  parseTimeToSeconds,
} from '../utils/racePredictor';
import {
  getUpcomingMonday,
  calculateRaceDateFromStart,
  calculateStartDateFromRace,
  calculateWeeksBetween,
  formatPrettyDate,
} from '../utils/datePlanSync';

interface PlanCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPlan: (
    newPlan: TrainingWeek[],
    meta: {
      title: string;
      goalPace: string;
      eventName: string;
      startDate?: string;
      raceDate?: string;
    }
  ) => void;
  initialEvent?: 'marathon' | 'half_marathon' | '10k' | '5k';
  initialHours?: number;
  initialMinutes?: number;
}

export const PlanCreatorModal: React.FC<PlanCreatorModalProps> = ({
  isOpen,
  onClose,
  onApplyPlan,
  initialEvent = 'marathon',
  initialHours,
  initialMinutes,
}) => {
  // Plan Parameters
  const [event, setEvent] = useState<'marathon' | 'half_marathon' | '10k' | '5k'>(initialEvent);
  const [weeksCount, setWeeksCount] = useState<number>(18);
  const [goalHours, setGoalHours] = useState<number>(initialHours !== undefined ? initialHours : 3);
  const [goalMinutes, setGoalMinutes] = useState<number>(initialMinutes !== undefined ? initialMinutes : 45);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [daysPerWeek, setDaysPerWeek] = useState<3 | 4 | 5 | 6>(5);
  const [longRunDay, setLongRunDay] = useState<'sunday' | 'saturday'>('sunday');

  // Race Predictor Quick Input State
  const [showPredictorBar, setShowPredictorBar] = useState<boolean>(false);
  const [prevDistanceId, setPrevDistanceId] = useState<string>('5k');
  const [prevHours, setPrevHours] = useState<number>(0);
  const [prevMinutes, setPrevMinutes] = useState<number>(24);
  const [prevSeconds, setPrevSeconds] = useState<number>(0);
  const [appliedPredictionNotice, setAppliedPredictionNotice] = useState<string | null>(null);

  // Start Date (Monday) and Race Date (Sunday / Saturday of final week)
  const [startDateStr, setStartDateStr] = useState<string>(getUpcomingMonday());
  const [raceDateStr, setRaceDateStr] = useState<string>(() =>
    calculateRaceDateFromStart(getUpcomingMonday(), 18, 'sunday')
  );
  const [dateSyncNotice, setDateSyncNotice] = useState<string | null>(null);

  // Sync when start date changes
  const handleStartDateChange = (newStart: string) => {
    setStartDateStr(newStart);
    if (!newStart) return;
    const newRace = calculateRaceDateFromStart(newStart, weeksCount, longRunDay);
    setRaceDateStr(newRace);
    setDateSyncNotice(`Race day moved to ${formatPrettyDate(newRace)} (${weeksCount}w plan).`);
  };

  // Sync when race date changes: auto-adjust weeks count (e.g. 19 or 21 weeks) and align start date
  const handleRaceDateChange = (newRace: string) => {
    setRaceDateStr(newRace);
    if (!newRace) return;
    const { exactWeeks, calendarDays } = calculateWeeksBetween(startDateStr, newRace);
    setWeeksCount(exactWeeks);
    const alignedStart = calculateStartDateFromRace(newRace, exactWeeks, longRunDay);
    setStartDateStr(alignedStart);
    setDateSyncNotice(
      `✓ Builder auto-adjusted plan to ${exactWeeks} weeks (${calendarDays} days)! Start: ${formatPrettyDate(alignedStart)} → Race: ${formatPrettyDate(newRace)}`
    );
  };

  // Sync when weeks count changes: recalculate race date so everything tallies
  const handleWeeksCountChange = (newWeeks: number) => {
    const clamped = Math.max(4, Math.min(36, newWeeks));
    setWeeksCount(clamped);
    const newRace = calculateRaceDateFromStart(startDateStr, clamped, longRunDay);
    setRaceDateStr(newRace);
    setDateSyncNotice(`✓ Tallies: ${clamped} Weeks (Race: ${formatPrettyDate(newRace)})`);
  };

  // Sync when long run day changes
  const handleLongRunDayChange = (newLongRunDay: 'sunday' | 'saturday') => {
    setLongRunDay(newLongRunDay);
    const newRace = calculateRaceDateFromStart(startDateStr, weeksCount, newLongRunDay);
    setRaceDateStr(newRace);
  };

  // Default finish times per event
  const handleSelectEvent = (newEvent: 'marathon' | 'half_marathon' | '10k' | '5k') => {
    setEvent(newEvent);
    let newWeeks = 18;
    if (newEvent === 'marathon') {
      setGoalHours(3);
      setGoalMinutes(45);
      newWeeks = 18;
    } else if (newEvent === 'half_marathon') {
      setGoalHours(1);
      setGoalMinutes(45);
      newWeeks = 14;
    } else if (newEvent === '10k') {
      setGoalHours(0);
      setGoalMinutes(48);
      newWeeks = 10;
    } else if (newEvent === '5k') {
      setGoalHours(0);
      setGoalMinutes(23);
      newWeeks = 8;
    }
    setWeeksCount(newWeeks);
    const newRace = calculateRaceDateFromStart(startDateStr, newWeeks, longRunDay);
    setRaceDateStr(newRace);
  };

  // Event distance
  const targetKm = useMemo(() => {
    if (event === 'marathon') return 42.195;
    if (event === 'half_marathon') return 21.0975;
    if (event === '10k') return 10.0;
    return 5.0;
  }, [event]);

  // Goal Pace Calculation
  const totalGoalSeconds = goalHours * 3600 + goalMinutes * 60;
  const calculatedPaceSec = totalGoalSeconds > 0 ? Math.round(totalGoalSeconds / targetKm) : 340;
  const paceMin = Math.floor(calculatedPaceSec / 60);
  const paceSecRemainder = calculatedPaceSec % 60;
  const goalPaceStr = `${paceMin}:${paceSecRemainder.toString().padStart(2, '0')}/km`;

  // Dynamic Pacing Zones
  const formatPaceFromSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}/km`;
  };
  const recoveryPaceStr = `${formatPaceFromSec(calculatedPaceSec + 60)}–${formatPaceFromSec(calculatedPaceSec + 80)}`;
  const aerobicPaceStr = `${formatPaceFromSec(calculatedPaceSec + 35)}–${formatPaceFromSec(calculatedPaceSec + 50)}`;
  const tempoPaceStr = formatPaceFromSec(calculatedPaceSec - 20);
  const intervalPaceStr = `${formatPaceFromSec(calculatedPaceSec - 50)}–${formatPaceFromSec(calculatedPaceSec - 30)}`;

  // Quick Apply from Race Predictor
  const handleApplyPredictedTime = () => {
    const sourceObj = STANDARD_DISTANCES.find((d) => d.id === prevDistanceId) || STANDARD_DISTANCES[0];
    const sourceSec = parseTimeToSeconds(prevHours, prevMinutes, prevSeconds);
    if (sourceSec <= 0) return;

    const prediction = predictRaceTime(sourceObj.distanceKm, sourceSec, targetKm);
    setGoalHours(prediction.hours);
    setGoalMinutes(prediction.minutes);
    setAppliedPredictionNotice(
      `Predicted from your ${sourceObj.name.split(' ')[0]} (${prevHours > 0 ? `${prevHours}h ` : ''}${prevMinutes}m): ${prediction.formattedTime} (${prediction.pacePerKm})`
    );
    setTimeout(() => setAppliedPredictionNotice(null), 6000);
  };

  // Generate preview
  const previewPlan = useMemo(() => {
    const options: PlanGeneratorOptions = {
      event,
      targetDistanceKm: targetKm,
      weeksCount,
      goalHours,
      goalMinutes,
      level,
      daysPerWeek,
      longRunDay,
      startDateStr,
    };
    return generateCustomPlan(options);
  }, [event, targetKm, weeksCount, goalHours, goalMinutes, level, daysPerWeek, longRunDay, startDateStr]);

  const totalPlanDistance = useMemo(() => {
    return Math.round(previewPlan.reduce((sum, w) => sum + w.plannedDist, 0));
  }, [previewPlan]);

  const peakLongRunKm = useMemo(() => {
    let peak = 0;
    previewPlan.forEach((w) => {
      (Object.values(w.days) as DaySchedule[]).forEach((d) => {
        if (d.plannedKm > peak) peak = d.plannedKm;
      });
    });
    return peak;
  }, [previewPlan]);

  const handleGenerateAndApply = () => {
    const eventTitles: Record<string, string> = {
      marathon: 'Full Marathon (42.2k)',
      half_marathon: 'Half Marathon (21.1k)',
      '10k': '10K Race',
      '5k': '5K Race',
    };

    const title = `${weeksCount}-Week ${eventTitles[event]}`;
    onApplyPlan(previewPlan, {
      title,
      goalPace: goalPaceStr,
      eventName: eventTitles[event],
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="plan-creator-modal-container"
        className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-6xl shadow-2xl text-stone-100 flex flex-col max-h-[96vh] overflow-hidden"
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-stone-800 flex items-center justify-between flex-shrink-0 bg-stone-900/95">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 leading-none">
                <span>Training Plan Builder & Periodizer</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Evidence-Based 80/20
                </span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Build a tailored, periodized schedule calibrated to your current fitness and target finish time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-toggle-race-predictor-bar"
              type="button"
              onClick={() => setShowPredictorBar(!showPredictorBar)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                showPredictorBar
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{showPredictorBar ? 'Hide Race Predictor' : 'Use Race Predictor'}</span>
            </button>

            <button
              id="btn-close-plan-creator"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Collapsible Inline Fitness Predictor */}
        {showPredictorBar && (
          <div className="bg-stone-950 px-5 py-3 border-b border-stone-800 flex-shrink-0 animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="font-bold text-stone-200">Recent Benchmark Race:</span>
                <select
                  id="pred-select-dist"
                  value={prevDistanceId}
                  onChange={(e) => setPrevDistanceId(e.target.value)}
                  className="bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-xs text-stone-200 focus:outline-none"
                >
                  <option value="5k">5K Race</option>
                  <option value="10k">10K Race</option>
                  <option value="half_marathon">Half Marathon</option>
                  <option value="marathon">Full Marathon</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-700">
                <input
                  id="pred-input-h"
                  type="number"
                  min="0"
                  max="10"
                  value={prevHours}
                  onChange={(e) => setPrevHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-10 bg-stone-800 text-center text-xs text-white rounded py-0.5 outline-none font-mono"
                />
                <span className="text-[10px] text-stone-400">h</span>
                <input
                  id="pred-input-m"
                  type="number"
                  min="0"
                  max="59"
                  value={prevMinutes}
                  onChange={(e) => setPrevMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-10 bg-stone-800 text-center text-xs text-white rounded py-0.5 outline-none font-mono"
                />
                <span className="text-[10px] text-stone-400">m</span>
                <input
                  id="pred-input-s"
                  type="number"
                  min="0"
                  max="59"
                  value={prevSeconds}
                  onChange={(e) => setPrevSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-10 bg-stone-800 text-center text-xs text-white rounded py-0.5 outline-none font-mono"
                />
                <span className="text-[10px] text-stone-400">s</span>
              </div>

              <button
                id="btn-apply-prediction-to-plan"
                type="button"
                onClick={handleApplyPredictedTime}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <span>Apply Predicted Pacing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {appliedPredictionNotice && (
              <div className="mt-2 text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{appliedPredictionNotice}</span>
              </div>
            )}
          </div>
        )}

        {/* 2-Column Balanced Dashboard Content (No Unnecessary Scroll on Desktop) */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto lg:overflow-visible">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
            {/* Left Column: Target Event, Time, Weeks, Start Date (6 cols) */}
            <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
              {/* Step 1: Target Race Distance */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>1. Target Race Event</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'marathon', label: 'Marathon', dist: '42.2 km' },
                    { id: 'half_marathon', label: 'Half', dist: '21.1 km' },
                    { id: '10k', label: '10K', dist: '10.0 km' },
                    { id: '5k', label: '5K', dist: '5.0 km' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      id={`plan-event-${item.id}`}
                      type="button"
                      onClick={() => handleSelectEvent(item.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        event === item.id
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                          : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:bg-stone-800/70'
                      }`}
                    >
                      <div className="font-bold text-xs">{item.label}</div>
                      <div className="text-[10px] text-stone-400 font-mono mt-0.5">{item.dist}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Target Finish Time & Pace */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    <span>2. Target Finish Time & Pace</span>
                  </label>
                  <span className="text-xs text-stone-400">
                    Goal Pace: <strong className="text-amber-400 font-mono">{goalPaceStr}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-6 flex items-center gap-2 bg-stone-950/80 px-3 py-2 rounded-xl border border-stone-700/80">
                    <input
                      id="input-goal-hours"
                      type="number"
                      min="0"
                      max="10"
                      value={goalHours}
                      onChange={(e) => setGoalHours(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-12 bg-stone-800 text-center text-sm font-bold text-white rounded py-1 outline-none font-mono focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-xs text-stone-400">hours</span>
                    <input
                      id="input-goal-minutes"
                      type="number"
                      min="0"
                      max="59"
                      value={goalMinutes}
                      onChange={(e) => setGoalMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-12 bg-stone-800 text-center text-sm font-bold text-white rounded py-1 outline-none font-mono focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-xs text-stone-400">mins</span>
                  </div>

                  <div className="col-span-6 flex items-center justify-center p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase font-medium">Race Pace</span>
                      <span className="text-sm font-extrabold text-amber-300 font-mono">{goalPaceStr}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Plan Duration & Custom Weeks */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>3. Plan Duration</span>
                  </label>
                  <div className="flex items-center gap-1.5 bg-stone-950/80 px-2 py-0.5 rounded-lg border border-stone-800">
                    <button
                      type="button"
                      id="btn-decrement-weeks"
                      onClick={() => handleWeeksCountChange(weeksCount - 1)}
                      className="p-1 rounded text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                      title="Decrease weeks"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      id="input-custom-weeks"
                      type="number"
                      min="4"
                      max="36"
                      value={weeksCount}
                      onChange={(e) => handleWeeksCountChange(parseInt(e.target.value) || 12)}
                      className="w-8 text-center text-xs font-bold text-amber-400 bg-transparent font-mono outline-none"
                    />
                    <span className="text-[11px] text-stone-400">wks</span>
                    <button
                      type="button"
                      id="btn-increment-weeks"
                      onClick={() => handleWeeksCountChange(weeksCount + 1)}
                      className="p-1 rounded text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                      title="Increase weeks"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
                  {[8, 10, 12, 14, 16, 18, 19, 20, 21, 24].map((num) => (
                    <button
                      key={num}
                      id={`plan-weeks-${num}`}
                      type="button"
                      onClick={() => handleWeeksCountChange(num)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        weeksCount === num
                          ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm'
                          : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      {num}w
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Coordinated Start Date & Race Date (Full Calendar Sync) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>4. Start Date & Race Date</span>
                  </label>
                  <span className="text-[11px] text-stone-400">
                    Long run day:{' '}
                    <select
                      id="select-long-run-day"
                      value={longRunDay}
                      onChange={(e) => handleLongRunDayChange(e.target.value as any)}
                      className="bg-stone-900 border border-stone-700/80 rounded px-1.5 py-0.5 text-[11px] text-amber-400 font-semibold focus:outline-none"
                    >
                      <option value="sunday">Sunday (Race)</option>
                      <option value="saturday">Saturday (Race)</option>
                    </select>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-stone-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      <span>Start Date (Week 1 Mon)</span>
                    </div>
                    <input
                      id="input-start-date"
                      type="date"
                      value={startDateStr}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="w-full bg-stone-950/80 border border-stone-700/80 rounded-xl px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none font-mono focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span>Race Date (Goal Event)</span>
                    </div>
                    <input
                      id="input-race-date"
                      type="date"
                      value={raceDateStr}
                      onChange={(e) => handleRaceDateChange(e.target.value)}
                      className="w-full bg-stone-950/80 border border-amber-500/40 rounded-xl px-2.5 py-1.5 text-xs text-amber-300 focus:outline-none font-mono focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Live Synchronization & Tallying Status */}
                <div className="p-2 rounded-xl bg-stone-950/90 border border-stone-800 text-[11px] space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 text-stone-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>
                        <strong className="text-emerald-400 font-semibold">{weeksCount} Weeks</strong> tallies:{' '}
                        <span className="text-white font-mono">{formatPrettyDate(startDateStr)}</span> →{' '}
                        <span className="text-amber-400 font-mono font-semibold">{formatPrettyDate(raceDateStr)}</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      id="btn-sync-to-race"
                      onClick={() => {
                        const alignedStart = calculateStartDateFromRace(raceDateStr, weeksCount, longRunDay);
                        setStartDateStr(alignedStart);
                        setDateSyncNotice(`Start date aligned to ${weeksCount}w before race day (${formatPrettyDate(alignedStart)}).`);
                      }}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-medium underline flex items-center gap-1 shrink-0"
                      title="Keep race date and recalculate start date"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      Sync Start to Race
                    </button>
                  </div>
                  {dateSyncNotice && (
                    <div className="text-[10px] text-amber-300/90 font-mono flex items-center justify-between pt-0.5 border-t border-stone-800/60">
                      <span>{dateSyncNotice}</span>
                      <button type="button" onClick={() => setDateSyncNotice(null)} className="text-stone-400 hover:text-white ml-2">✕</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 5: Runner Level & Frequency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
                    5. Experience Level
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        id={`plan-level-${lvl}`}
                        type="button"
                        onClick={() => setLevel(lvl)}
                        className={`py-1.5 rounded-lg text-xs font-bold capitalize border transition-all text-center ${
                          level === lvl
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:bg-stone-800'
                        }`}
                      >
                        {lvl.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
                    6. Runs per Week
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {([3, 4, 5, 6] as const).map((days) => (
                      <button
                        key={days}
                        id={`plan-days-${days}`}
                        type="button"
                        onClick={() => setDaysPerWeek(days)}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-all text-center ${
                          daysPerWeek === days
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:bg-stone-800'
                        }`}
                      >
                        {days} d/wk
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Calculated Pacing Matrix & Periodization Snapshot (6 cols) */}
            <div className="lg:col-span-6 space-y-4 flex flex-col justify-between bg-stone-950/50 p-4 rounded-xl border border-stone-800/80">
              {/* Calculated Training Zones */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Calibrated Training Zones</span>
                  </span>
                  <span className="text-[10px] text-stone-400">80% Easy / 20% Quality</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
                    <div className="text-[10px] text-stone-400 uppercase font-semibold">Easy / Base</div>
                    <div className="text-xs font-mono font-bold text-blue-300 mt-0.5">{aerobicPaceStr}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
                    <div className="text-[10px] text-stone-400 uppercase font-semibold">Recovery</div>
                    <div className="text-xs font-mono font-bold text-stone-300 mt-0.5">{recoveryPaceStr}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
                    <div className="text-[10px] text-stone-400 uppercase font-semibold">Threshold</div>
                    <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">{tempoPaceStr}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
                    <div className="text-[10px] text-stone-400 uppercase font-semibold">Intervals</div>
                    <div className="text-xs font-mono font-bold text-rose-400 mt-0.5">{intervalPaceStr}</div>
                  </div>
                </div>
              </div>

              {/* Plan Volume & Anatomy Highlights */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 text-center">
                  <span className="text-[10px] uppercase font-semibold text-stone-400 block">Total Volume</span>
                  <span className="text-base font-extrabold text-white font-mono">{totalPlanDistance} km</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 text-center">
                  <span className="text-[10px] uppercase font-semibold text-stone-400 block">Peak Long Run</span>
                  <span className="text-base font-extrabold text-amber-400 font-mono">{peakLongRunKm} km</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 text-center">
                  <span className="text-[10px] uppercase font-semibold text-stone-400 block">Adaptation</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">3:1 Cycles</span>
                </div>
              </div>

              {/* Schedule Timeline Highlight */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-stone-400 block">Kickoff (Week 1)</span>
                  <span className="text-white font-mono font-bold text-xs">{formatPrettyDate(startDateStr)}</span>
                </div>
                <div className="text-center px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold font-mono text-xs">
                  {weeksCount} Weeks
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-stone-400 block">Race Day (Week {weeksCount})</span>
                  <span className="text-amber-400 font-mono font-bold text-xs">{formatPrettyDate(raceDateStr)}</span>
                </div>
              </div>

              {/* Periodization Timeline Visualizer */}
              <div className="p-3 rounded-xl bg-stone-900/70 border border-stone-800/80 space-y-1.5">
                <span className="text-[11px] font-semibold text-stone-300 block">
                  Periodized Training Flow ({weeksCount} Weeks)
                </span>
                <div className="flex items-center gap-1 text-[11px] font-mono">
                  <div className="flex-1 p-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 text-center">
                    🌱 Base ({Math.round(weeksCount * 0.35)}w)
                  </div>
                  <div className="flex-1 p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-center">
                    ⚡ Build ({Math.round(weeksCount * 0.3)}w)
                  </div>
                  <div className="flex-1 p-1.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-center">
                    🔥 Peak ({Math.max(1, weeksCount - Math.round(weeksCount * 0.35) - Math.round(weeksCount * 0.3) - (weeksCount >= 16 ? 3 : weeksCount >= 10 ? 2 : 1))}w)
                  </div>
                  <div className="flex-1 p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-center">
                    🏁 Taper ({weeksCount >= 16 ? 3 : weeksCount >= 10 ? 2 : 1}w)
                  </div>
                </div>
                <p className="text-[10px] text-stone-400 leading-tight pt-0.5">
                  Includes scheduled 20% cutback weeks every 4 weeks to absorb training adaptation and avoid injury.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-800">
                <button
                  id="btn-cancel-plan-creator"
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>

                <button
                  id="btn-apply-plan-creator"
                  type="button"
                  onClick={handleGenerateAndApply}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate & Apply Plan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
