import React from 'react';
import { Check, ChevronRight, MapPin, Clock, Gauge, Flame, Sparkles } from 'lucide-react';
import { TrainingWeek, DaySchedule } from '../types';

interface WeekCardProps {
  week: TrainingWeek;
  isCurrentWeek?: boolean;
  onSelectDay: (day: DaySchedule, weekNumber: number) => void;
  onToggleCompleteDay: (dayKey: keyof TrainingWeek['days'], weekNumber: number) => void;
}

export const WeekCard: React.FC<WeekCardProps> = ({
  week,
  isCurrentWeek = false,
  onSelectDay,
  onToggleCompleteDay,
}) => {
  const daysArray: { key: keyof TrainingWeek['days']; day: DaySchedule }[] = [
    { key: 'monday', day: week.days.monday },
    { key: 'tuesday', day: week.days.tuesday },
    { key: 'wednesday', day: week.days.wednesday },
    { key: 'thursday', day: week.days.thursday },
    { key: 'friday', day: week.days.friday },
    { key: 'saturday', day: week.days.saturday },
    { key: 'sunday', day: week.days.sunday },
  ];

  // Calculate actual distance from logged days
  const actualLoggedDist = daysArray.reduce((acc, curr) => {
    if (curr.day.loggedData?.actualKm) {
      return acc + curr.day.loggedData.actualKm;
    } else if (curr.day.completed && curr.day.plannedKm > 0) {
      return acc + curr.day.plannedKm;
    }
    return acc;
  }, 0);

  const completedCount = daysArray.filter((d) => d.day.completed).length;
  const progressPercent = Math.min(100, Math.round((actualLoggedDist / week.plannedDist) * 100));

  const getDayTypeClasses = (type: string, completed: boolean) => {
    if (completed) {
      return 'bg-emerald-900/30 border-emerald-600/50 text-emerald-300';
    }
    switch (type) {
      case 'recovery':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20';
      case 'aerobic':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20';
      case 'quality':
        return 'bg-orange-500/10 border-orange-500/30 text-orange-300 hover:bg-orange-500/20';
      case 'long_run':
        return 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25';
      case 'easy':
        return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20';
      default: // rest
        return 'bg-stone-800/40 border-stone-800 text-stone-500 hover:bg-stone-800';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Base & Aerobic Build':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Threshold & Volume':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'Peak & Specificity':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Taper & Race':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-stone-400 bg-stone-800 border-stone-700';
    }
  };

  return (
    <div
      id={`week-card-${week.weekNumber}`}
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isCurrentWeek
          ? 'bg-stone-800/90 border-amber-500/60 shadow-lg shadow-amber-500/5'
          : 'bg-stone-900/80 border-stone-800 hover:border-stone-700'
      }`}
    >
      {/* Week Header */}
      <div className="px-5 py-3.5 border-b border-stone-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold text-white">
              Week {week.weekNumber}
            </span>
            <span className="text-xs text-stone-400 font-medium">
              ({week.dateMon})
            </span>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getPhaseColor(
              week.phase
            )}`}
          >
            {week.phase}
          </span>

          {isCurrentWeek && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-stone-950">
              <Sparkles className="w-3 h-3" />
              CURRENT
            </span>
          )}
        </div>

        {/* Planned vs Actual Volume */}
        <div className="flex items-center gap-5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400">Planned:</span>
            <span className="font-bold text-stone-200">{week.plannedDist} km</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-stone-400">Logged:</span>
            <span
              className={`font-bold ${
                actualLoggedDist >= week.plannedDist
                  ? 'text-emerald-400'
                  : actualLoggedDist > 0
                  ? 'text-amber-400'
                  : 'text-stone-400'
              }`}
            >
              {actualLoggedDist > 0 ? `${actualLoggedDist.toFixed(1)} km` : '—'}
            </span>
          </div>

          {/* Progress Mini Bar */}
          <div className="hidden sm:flex items-center gap-2 w-28">
            <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden border border-stone-700/50">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  progressPercent >= 100 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-stone-400 min-w-[28px] text-right">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Week Notes or Highlights if any */}
      {week.notes && (
        <div className="px-5 py-2 bg-amber-500/5 border-b border-amber-500/10 text-xs text-amber-300 flex items-center gap-2">
          <Flame className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>{week.notes}</span>
        </div>
      )}

      {/* 7 Days Grid */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {daysArray.map(({ key, day }) => {
          return (
            <div
              key={key}
              onClick={() => onSelectDay(day, week.weekNumber)}
              className={`group relative p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between min-h-[96px] ${getDayTypeClasses(
                day.type,
                day.completed
              )}`}
            >
              {/* Day Name & Status Check */}
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                  {day.dayName.slice(0, 3)} <span className="opacity-60 text-[10px]">({day.dateStr})</span>
                </span>

                {day.type !== 'rest' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCompleteDay(key, week.weekNumber);
                    }}
                    title={day.completed ? 'Mark uncompleted' : 'Mark completed'}
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                      day.completed
                        ? 'bg-emerald-500 text-stone-950 ring-2 ring-emerald-400/30'
                        : 'border border-stone-600 hover:border-stone-400 group-hover:bg-stone-800/80'
                    }`}
                  >
                    {day.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </button>
                )}
              </div>

              {/* Workout details */}
              <div className="my-1">
                <div className="text-xs font-bold leading-snug line-clamp-2">
                  {day.type === 'rest' ? 'Rest Day' : day.title}
                </div>
                {day.targetPace && (
                  <div className="text-[10px] opacity-75 font-mono truncate mt-0.5">
                    {day.targetPace}
                  </div>
                )}
              </div>

              {/* Distance Bottom Badge */}
              <div className="flex items-center justify-between pt-1 border-t border-current/10 text-[11px]">
                <span className="font-semibold">
                  {day.plannedKm > 0 ? `${day.plannedKm} km` : '—'}
                </span>
                {day.loggedData?.actualKm ? (
                  <span className="font-mono text-[10px] px-1 rounded bg-black/30 font-semibold">
                    {day.loggedData.actualKm}k
                  </span>
                ) : (
                  <ChevronRight className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
