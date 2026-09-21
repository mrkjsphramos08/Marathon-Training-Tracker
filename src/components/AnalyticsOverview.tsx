import React from 'react';
import {
  TrendingUp,
  Calendar,
  Trophy,
  Flame,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  Target,
  Sparkles,
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
  onOpenSyncModal,
  selectedPhase,
  onSelectPhase,
}) => {
  // Find current day or upcoming workout
  let nextWorkout: { day: DaySchedule; weekNumber: number } | null = null;
  for (const week of plan) {
    const daysList = Object.values(week.days) as DaySchedule[];
    for (const d of daysList) {
      if (d.type !== 'rest' && !d.completed) {
        nextWorkout = { day: d, weekNumber: week.weekNumber };
        break;
      }
    }
    if (nextWorkout) break;
  }

  // If all completed, default to last day of last week
  if (!nextWorkout && plan.length > 0) {
    const lastWeek = plan[plan.length - 1];
    const sundayOrSat = lastWeek.days.sunday.plannedKm > 0 ? lastWeek.days.sunday : lastWeek.days.saturday;
    nextWorkout = { day: sundayOrSat, weekNumber: lastWeek.weekNumber };
  }

  const maxPlannedVolume = Math.max(...plan.map((w) => w.plannedDist), 1);

  // Extract unique phases present in the active plan
  const distinctPhases: string[] = Array.from(new Set(plan.map((w) => w.phase)));
  const phases: string[] = ['All Weeks', ...distinctPhases];

  return (
    <div className="space-y-6">
      {/* Hero Next Workout Banner */}
      {nextWorkout && (
        <div className="rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Next Up · Week {nextWorkout.weekNumber}
                </span>
                <span className="text-xs text-stone-400 font-medium">
                  {nextWorkout.day.dayName}, {nextWorkout.day.dateStr}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {nextWorkout.day.title}
              </h2>

              <p className="text-sm text-stone-300 line-clamp-2 leading-relaxed">
                {nextWorkout.day.details || 'Stay consistent and execute your planned pacing.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                <div className="flex items-center gap-1.5 text-stone-200">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Planned: <strong className="text-white">{nextWorkout.day.plannedKm} km</strong>
                  </span>
                </div>
                {nextWorkout.day.targetPace && (
                  <div className="flex items-center gap-1.5 text-stone-200">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      Pace: <strong className="text-amber-300 font-mono">{nextWorkout.day.targetPace}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                id="btn-log-next-workout"
                onClick={() => nextWorkout && onSelectDay(nextWorkout.day, nextWorkout.weekNumber)}
                className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span>Log / View Workout</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mileage Progression Interactive Periodization Chart */}
      <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>{plan.length}-Week Periodization & Mileage Progression</span>
            </h3>
            <p className="text-xs text-stone-400">
              Visualizes weekly planned volume, scheduled recovery adaptation weeks, peak mileage, and the taper.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-stone-700" />
              <span className="text-stone-400">Planned</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span className="text-stone-400">Logged</span>
            </div>
          </div>
        </div>

        {/* Dynamic Visual Bar Chart */}
        <div className="pt-4 pb-1 overflow-x-auto">
          <div
            className="grid gap-1 sm:gap-1.5 items-end h-32 border-b border-stone-800 pb-2 min-w-[320px]"
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
                      if (d.loggedData?.actualKm) return sum + d.loggedData.actualKm;
                      if (d.completed && d.plannedKm > 0) return sum + d.plannedKm;
                      return sum;
                    }, 0);
              const loggedHeight = Math.min(100, (loggedKm / maxPlannedVolume) * 100);
              const isRace = w.weekNumber === plan.length;
              const isTaper = w.phase.toLowerCase().includes('taper');
              const isPeak = w.phase.toLowerCase().includes('peak');

              return (
                <div
                  key={w.weekNumber}
                  className="group relative flex flex-col items-center h-full justify-end"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                    <div className="bg-stone-800 border border-stone-700 text-stone-100 text-[10px] py-1 px-2 rounded shadow-lg whitespace-nowrap">
                      <strong>W{w.weekNumber}</strong>: {w.plannedDist} km
                      {loggedKm > 0 && ` (${loggedKm.toFixed(1)}k logged)`}
                      {isPeak && ' · Peak'}
                      {isTaper && ' · Taper'}
                      {isRace && ' · Race Week!'}
                    </div>
                    <div className="w-1.5 h-1.5 bg-stone-800 rotate-45 -mt-0.5 border-r border-b border-stone-700" />
                  </div>

                  <div className="w-full relative flex items-end justify-center h-full">
                    {/* Planned volume background bar */}
                    <div
                      className={`w-full rounded-t transition-all ${
                        isRace
                          ? 'bg-emerald-500/40'
                          : isPeak
                          ? 'bg-amber-500/40'
                          : isTaper
                          ? 'bg-blue-500/30'
                          : 'bg-stone-700/60'
                      }`}
                      style={{ height: `${Math.max(4, plannedHeight)}%` }}
                    />

                    {/* Actual logged bar overlay */}
                    {loggedHeight > 0 && (
                      <div
                        className="absolute bottom-0 w-full rounded-t bg-emerald-400 transition-all"
                        style={{ height: `${loggedHeight}%` }}
                      />
                    )}
                  </div>

                  <span className="text-[9px] sm:text-[10px] font-mono text-stone-400 mt-1 block">
                    {w.weekNumber}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {phases.map((phase) => (
            <button
              key={phase}
              id={`btn-phase-${phase.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              type="button"
              onClick={() => onSelectPhase(phase)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedPhase === phase
                  ? 'bg-amber-500 text-stone-950 font-bold shadow'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200'
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
