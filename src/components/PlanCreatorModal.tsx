import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  Gauge,
  Trophy,
  Flame,
  ArrowRight,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Layers,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { TrainingWeek } from '../types';
import { generateCustomPlan, PlanGeneratorOptions } from '../utils/planGenerator';

interface PlanCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPlan: (newPlan: TrainingWeek[], planMetadata: { title: string; goalPace: string; eventName: string }) => void;
}

export const PlanCreatorModal: React.FC<PlanCreatorModalProps> = ({
  isOpen,
  onClose,
  onApplyPlan,
}) => {
  const [event, setEvent] = useState<'marathon' | 'half_marathon' | '10k' | '5k'>('marathon');
  const [weeksCount, setWeeksCount] = useState<number>(18);
  const [goalHours, setGoalHours] = useState<number>(3);
  const [goalMinutes, setGoalMinutes] = useState<number>(59);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [daysPerWeek, setDaysPerWeek] = useState<3 | 4 | 5 | 6>(5);
  const [longRunDay, setLongRunDay] = useState<'sunday' | 'saturday'>('sunday');
  
  // Default start date: upcoming Monday
  const getNextMonday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() + (day === 0 ? 1 : (8 - day) % 7);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  const [startDateStr, setStartDateStr] = useState<string>(getNextMonday());

  if (!isOpen) return null;

  const eventDistanceKm =
    event === 'marathon' ? 42.195 : event === 'half_marathon' ? 21.0975 : event === '10k' ? 10 : 5;

  const totalGoalSeconds = goalHours * 3600 + goalMinutes * 60;
  const goalSecPerKm = totalGoalSeconds / eventDistanceKm;
  const goalPaceMin = Math.floor(goalSecPerKm / 60);
  const goalPaceSec = Math.round(goalSecPerKm % 60);
  const goalPaceStr = `${goalPaceMin}:${goalPaceSec.toString().padStart(2, '0')}/km`;

  // Quick preset goal times when event changes
  const handleSelectEvent = (selectedEvent: typeof event) => {
    setEvent(selectedEvent);
    if (selectedEvent === 'marathon') {
      setWeeksCount(18);
      setGoalHours(3);
      setGoalMinutes(59);
    } else if (selectedEvent === 'half_marathon') {
      setWeeksCount(14);
      setGoalHours(1);
      setGoalMinutes(45);
    } else if (selectedEvent === '10k') {
      setWeeksCount(10);
      setGoalHours(0);
      setGoalMinutes(48);
    } else {
      setWeeksCount(8);
      setGoalHours(0);
      setGoalMinutes(23);
    }
  };

  // Preview generated plan stats
  const previewPlan = generateCustomPlan({
    event,
    targetDistanceKm: eventDistanceKm,
    weeksCount,
    goalHours,
    goalMinutes,
    level,
    daysPerWeek,
    longRunDay,
    startDateStr,
  });

  const totalMileage = Math.round(previewPlan.reduce((s, w) => s + w.plannedDist, 0));
  const peakWeek = Math.max(...previewPlan.map((w) => w.plannedDist));
  const peakLongRun = Math.max(
    ...previewPlan.map((w) =>
      longRunDay === 'saturday' ? w.days.saturday.plannedKm : w.days.sunday.plannedKm
    )
  );

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="plan-creator-modal-container"
        className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl text-stone-100 flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 bg-stone-900/95 backdrop-blur px-6 py-4 border-b border-stone-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Create Custom Training Plan
              </h2>
              <p className="text-xs text-stone-400">
                Periodized schedule customized to your target event, goal time, and availability
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Form Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Step 1: Event Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Target Race / Event</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'marathon', label: 'Marathon', dist: '42.2 km' },
                { id: 'half_marathon', label: 'Half Marathon', dist: '21.1 km' },
                { id: '10k', label: '10K', dist: '10.0 km' },
                { id: '5k', label: '5K', dist: '5.0 km' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectEvent(item.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    event === item.id
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm'
                      : 'bg-stone-800/60 border-stone-700 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <div className="font-bold text-sm">{item.label}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{item.dist}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Duration & Goal Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Duration */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>2. Plan Length</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {[8, 10, 12, 14, 16, 18, 20, 24].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setWeeksCount(num)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      weeksCount === num
                        ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-sm'
                        : 'bg-stone-800/80 border-stone-700/80 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {num} Weeks
                  </button>
                ))}
              </div>
            </div>

            {/* Goal Finish Time */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. Target Finish Time & Pace</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-xl border border-stone-700">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={goalHours}
                    onChange={(e) => setGoalHours(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-10 bg-transparent text-center font-bold text-white text-sm focus:outline-none"
                  />
                  <span className="text-xs text-stone-400">h</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={goalMinutes}
                    onChange={(e) => setGoalMinutes(Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0)))}
                    className="w-10 bg-transparent text-center font-bold text-white text-sm focus:outline-none ml-2"
                  />
                  <span className="text-xs text-stone-400">m</span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                  <span className="text-stone-400 block text-[10px]">Target Pace</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">{goalPaceStr}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Runner Experience & Weekly Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-800">
            {/* Experience Level */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
                4. Experience Level
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold capitalize border transition-all text-center ${
                      level === lvl
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                        : 'bg-stone-800/80 border-stone-700/80 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Days per week */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
                5. Running Frequency
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {([3, 4, 5, 6] as const).map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDaysPerWeek(days)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                      daysPerWeek === days
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                        : 'bg-stone-800/80 border-stone-700/80 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {days} days
                  </button>
                ))}
              </div>
            </div>

            {/* Long Run Day & Start Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
                6. Long Run & Start Date
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={longRunDay}
                  onChange={(e) => setLongRunDay(e.target.value as any)}
                  className="bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none"
                >
                  <option value="sunday">Sunday Long Run</option>
                  <option value="saturday">Saturday Long Run</option>
                </select>

                <input
                  type="date"
                  value={startDateStr}
                  onChange={(e) => setStartDateStr(e.target.value)}
                  className="bg-stone-800 border border-stone-700 rounded-lg px-2 py-1 text-xs text-stone-200 focus:outline-none flex-1"
                />
              </div>
            </div>
          </div>

          {/* Live Plan Preview Card */}
          <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-700/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Plan Overview & Projected Volume
              </span>
              <span className="text-stone-400">
                {previewPlan[0]?.dateMon} – {previewPlan[previewPlan.length - 1]?.dateMon}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800">
                <span className="text-[11px] text-stone-400 block">Total Volume</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  {totalMileage} km
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800">
                <span className="text-[11px] text-stone-400 block">Peak Week</span>
                <span className="text-base font-extrabold text-amber-400 font-mono">
                  {peakWeek} km
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800">
                <span className="text-[11px] text-stone-400 block">Peak Long Run</span>
                <span className="text-base font-extrabold text-rose-400 font-mono">
                  {peakLongRun} km
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800">
                <span className="text-[11px] text-stone-400 block">Total Workouts</span>
                <span className="text-base font-extrabold text-blue-400 font-mono">
                  {weeksCount * daysPerWeek} runs
                </span>
              </div>
            </div>

            {/* Phases timeline preview */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-700/60">
              <span>🌱 Base Build</span>
              <span>⚡ Threshold & Volume</span>
              <span>🔥 Peak Specificity</span>
              <span>🏁 Taper & Race</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-stone-900 border-t border-stone-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleGenerateAndApply}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate & Activate Plan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
