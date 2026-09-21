import React from 'react';
import {
  TrendingUp,
  ChevronRight,
  Target,
  Sparkles,
  MapPin,
  Clock,
} from 'lucide-react';
import { TrainingWeek, DaySchedule } from '../types';

interface AnalyticsOverviewProps {
  plan: TrainingWeek[];
  onSelectDay: (day: DaySchedule, weekNumber: number) => void;
  onOpenSyncModal: () => void;
  selectedPhase: string;
  onSelectPhase: (phase: string) => void;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  plan,
  onSelectDay,
  selectedPhase,
  onSelectPhase,
}) => {
  // Find current day or upcoming workout
  let nextWorkout: { day: DaySchedule; weekNumber: number; phase: string } | null = null;
  for (const week of plan) {
    const daysList = Object.values(week.days) as DaySchedule[];
    for (const d of daysList) {
      if (d.type !== 'rest' && !d.completed) {
        nextWorkout = { day: d, weekNumber: week.weekNumber, phase: week.phase };
        break;
      }
    }
    if (nextWorkout) break;
  }

  // If all completed, default to last day of last week
  if (!nextWorkout && plan.length > 0) {
    const lastWeek = plan[plan.length - 1];
    const sundayOrSat = lastWeek.days.sunday.plannedKm > 0 ? lastWeek.days.sunday : lastWeek.days.saturday;
    nextWorkout = { day: sundayOrSat, weekNumber: lastWeek.weekNumber, phase: lastWeek.phase };
  }

  const maxPlannedVolume = Math.max(...plan.map((w) => w.plannedDist), 1);

  // Extract unique phases present in the active plan
  const distinctPhases: string[] = Array.from(new Set(plan.map((w) => w.phase)));
  const phases: string[] = ['All Weeks', ...distinctPhases];

  return (
    <div className="space-y-5">
      {/* Hero Next Workout Session Card */}
      {nextWorkout && (
        <div className="relative rounded-2xl bg-[#12161F] border border-white/[0.08] p-5 sm:p-7 shadow-sm overflow-hidden transition-all">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-amber-500/[0.06] blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2.5 max-w-3xl">
              {/* Session Eyebrow */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-semibold bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Upcoming Session · Week {nextWorkout.weekNumber}
                </span>

                <span className="text-xs font-mono text-slate-400">
                  {nextWorkout.day.dayName}, {nextWorkout.day.dateStr}
                </span>

                <span className="text-xs text-slate-500 font-medium">
                  {nextWorkout.phase}
                </span>
              </div>

              {/* Title & Subtype Badge */}
              <div className="flex flex-wrap items-baseline gap-3">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {nextWorkout.day.title}
                </h2>
                {nextWorkout.day.subtype && (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-medium bg-white/[0.06] text-slate-300 border border-white/10">
                    {nextWorkout.day.subtype}
                  </span>
                )}
              </div>

              {/* Workout Description */}
              <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed max-w-2xl font-normal">
                {nextWorkout.day.details || 'Execute your planned distance with proper hydration and disciplined pacing.'}
              </p>

              {/* Key Metric Indicators */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181E2A] border border-white/[0.06] text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Target:</span>
                  <strong className="text-white font-semibold">{nextWorkout.day.plannedKm} km</strong>
                </div>

                {nextWorkout.day.targetPace && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181E2A] border border-white/[0.06] text-slate-200">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pace:</span>
                    <strong className="text-amber-300 font-semibold">{nextWorkout.day.targetPace}</strong>
                  </div>
                )}

                {nextWorkout.day.completed && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                    ✓ Completed
                  </span>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex items-center gap-3 w-full lg:w-auto shrink-0">
              <button
                id="btn-log-next-workout"
                onClick={() => nextWorkout && onSelectDay(nextWorkout.day, nextWorkout.weekNumber)}
                className="w-full lg:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
              >
                <span>Open Workout & Log</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Periodization & Volume Progression Chart */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#12161F] border border-white/[0.08] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 tracking-tight">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>{plan.length}-Week Periodization Architecture</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Weekly planned mileage progression, recovery adaptation valleys, peak volume, and taper.
            </p>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-white/[0.12]" />
              <span className="text-slate-400">Planned</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
              <span className="text-slate-400">Logged</span>
            </div>
          </div>
        </div>

        {/* Dynamic Visual Bar Chart */}
        <div className="pt-3 pb-1 overflow-x-auto">
          <div
            className="grid gap-1 sm:gap-1.5 items-end h-32 border-b border-white/[0.06] pb-2 min-w-[340px]"
            style={{
              gridTemplateColumns: `repeat(${plan.length}, minmax(0, 1fr))`,
            }}
          >
            {plan.map((w) => {
              const plannedHeight = (w.plannedDist / maxPlannedVolume) * 100;
              const loggedKm =
                w.actualDist !== undefined
                  ? w.actualDist
                  : (Object.values(w.days) as DaySchedule[]).reduce((sum, d) => {
                      if (d.completed) {
                        if (d.loggedData?.actualKm !== undefined && d.loggedData.actualKm > 0) {
                          return sum + d.loggedData.actualKm;
                        }
                        if (d.plannedKm > 0) return sum + d.plannedKm;
                      }
                      return sum;
                    }, 0);
              const loggedHeight = Math.min(100, (loggedKm / maxPlannedVolume) * 100);
              const isRace = w.weekNumber === plan.length;
              const isTaper = w.phase.toLowerCase().includes('taper');
              const isPeak = w.phase.toLowerCase().includes('peak');

              return (
                <div
                  key={w.weekNumber}
                  className="group relative flex flex-col items-center h-full justify-end cursor-pointer"
                  onClick={() => {
                    const firstRun =
                      (Object.values(w.days) as DaySchedule[]).find((d) => d.type !== 'rest') || w.days.monday;
                    onSelectDay(firstRun, w.weekNumber);
                  }}
                >
                  {/* Clean Precision Tooltip */}
                  <div className="absolute -top-14 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                    <div className="bg-[#1B2230] border border-white/10 text-slate-100 text-[11px] font-mono py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-amber-400 font-semibold">W{w.weekNumber}</strong>
                        <span>{w.plannedDist} km</span>
                        {loggedKm > 0 && (
                          <span className="text-emerald-400">({loggedKm.toFixed(1)}k)</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">{w.phase}</div>
                    </div>
                    <div className="w-1.5 h-1.5 bg-[#1B2230] rotate-45 -mt-1 border-r border-b border-white/10" />
                  </div>

                  <div className="w-full relative flex items-end justify-center h-full">
                    {/* Planned volume bar */}
                    <div
                      className={`w-full rounded-t transition-all ${
                        isRace
                          ? 'bg-emerald-400/40 group-hover:bg-emerald-400/60'
                          : isPeak
                          ? 'bg-amber-400/40 group-hover:bg-amber-400/60'
                          : isTaper
                          ? 'bg-sky-400/30 group-hover:bg-sky-400/50'
                          : 'bg-white/[0.12] group-hover:bg-white/[0.20]'
                      }`}
                      style={{ height: `${Math.max(6, plannedHeight)}%` }}
                    />

                    {/* Actual logged bar overlay */}
                    {loggedHeight > 0 && (
                      <div
                        className="absolute bottom-0 w-full rounded-t bg-emerald-400 transition-all shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                        style={{ height: `${loggedHeight}%` }}
                      />
                    )}
                  </div>

                  <span className="text-[9px] font-mono text-slate-400 group-hover:text-white mt-1 block transition-colors">
                    {w.weekNumber}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase Filter Segmented Tabs */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {phases.map((phase) => (
            <button
              key={phase}
              id={`btn-phase-${phase.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              type="button"
              onClick={() => onSelectPhase(phase)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedPhase === phase
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                  : 'bg-[#181E2A] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.04]'
              }`}
            >
              {phase}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
