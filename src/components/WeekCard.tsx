import React from 'react';
import { Check, ChevronRight, Gauge, Flame, Sparkles } from 'lucide-react';
import { TrainingWeek, DaySchedule } from '../types';
import { formatWorkoutDisplay } from '../utils/paceCalculations';

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

  // Calculate actual distance only from completed workouts
  const actualLoggedDist = daysArray.reduce((acc, curr) => {
    if (curr.day.completed) {
      if (curr.day.loggedData?.actualKm !== undefined && curr.day.loggedData.actualKm > 0) {
        return acc + curr.day.loggedData.actualKm;
      } else if (curr.day.plannedKm > 0) {
        return acc + curr.day.plannedKm;
      }
    }
    return acc;
  }, 0);

  const completedCount = daysArray.filter((d) => d.day.completed && d.day.type !== 'rest').length;
  const totalRuns = daysArray.filter((d) => d.day.type !== 'rest').length;
  const progressPercent = Math.min(100, Math.round((actualLoggedDist / week.plannedDist) * 100)) || 0;

  const getTypeAccent = (type: string) => {
    switch (type) {
      case 'quality':
        return {
          dot: 'bg-orange-400',
          badge: 'bg-orange-400/10 text-orange-300 border-orange-400/20',
        };
      case 'long_run':
        return {
          dot: 'bg-sky-400',
          badge: 'bg-sky-400/10 text-sky-300 border-sky-400/20',
        };
      case 'aerobic':
        return {
          dot: 'bg-teal-400',
          badge: 'bg-teal-400/10 text-teal-300 border-teal-400/20',
        };
      case 'recovery':
      case 'easy':
        return {
          dot: 'bg-emerald-400',
          badge: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
        };
      default:
        return {
          dot: 'bg-slate-600',
          badge: 'bg-white/[0.04] text-slate-400 border-white/[0.06]',
        };
    }
  };

  const getPhaseBadge = (phase: string) => {
    const p = phase.toLowerCase();
    if (p.includes('base') || p.includes('aerobic')) {
      return 'text-sky-300 bg-sky-400/10 border-sky-400/20';
    } else if (p.includes('threshold') || p.includes('volume')) {
      return 'text-amber-300 bg-amber-400/10 border-amber-400/20';
    } else if (p.includes('peak') || p.includes('specificity')) {
      return 'text-orange-300 bg-orange-400/10 border-orange-400/20';
    } else if (p.includes('taper') || p.includes('race')) {
      return 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20';
    }
    return 'text-slate-300 bg-white/[0.06] border-white/10';
  };

  return (
    <div
      id={`week-card-${week.weekNumber}`}
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isCurrentWeek
          ? 'bg-[#12161F] border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.06)]'
          : 'bg-[#12161F] border-white/[0.08] hover:border-white/[0.14]'
      }`}
    >
      {/* Week Header */}
      <div className="px-5 py-3.5 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-base font-bold text-white tracking-tight">
              Week {week.weekNumber < 10 ? `0${week.weekNumber}` : week.weekNumber}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {week.dateMon}
            </span>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getPhaseBadge(
              week.phase
            )}`}
          >
            {week.phase}
          </span>

          {isCurrentWeek && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-400 text-slate-950">
              <Sparkles className="w-3 h-3" />
              Current
            </span>
          )}
        </div>

        {/* Volume & Completion Progress */}
        <div className="flex items-center gap-5 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Target:</span>
            <span className="font-semibold text-slate-200">{week.plannedDist} km</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Logged:</span>
            <span
              className={`font-semibold ${
                actualLoggedDist >= week.plannedDist
                  ? 'text-emerald-400'
                  : actualLoggedDist > 0
                  ? 'text-amber-400'
                  : 'text-slate-400'
              }`}
            >
              {actualLoggedDist > 0 ? `${actualLoggedDist.toFixed(1)} km` : '—'}
            </span>
          </div>

          {/* Progress Mini Bar */}
          <div className="hidden sm:flex items-center gap-2 w-28">
            <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  progressPercent >= 100 ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 min-w-[28px] text-right">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Week Focus Highlights */}
      {week.notes && (
        <div className="px-5 py-2 bg-amber-400/[0.04] border-b border-amber-400/10 text-xs text-amber-300/90 flex items-center gap-2 font-mono">
          <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{week.notes}</span>
        </div>
      )}

      {/* 7 Days Grid */}
      <div className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {daysArray.map(({ key, day }) => {
          const accent = getTypeAccent(day.type);
          const isRest = day.type === 'rest';

          return (
            <div
              key={key}
              onClick={() => onSelectDay(day, week.weekNumber)}
              className={`group relative p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between min-h-[124px] ${
                day.completed
                  ? 'bg-emerald-500/[0.06] border-emerald-500/30 hover:border-emerald-500/50 shadow-sm'
                  : isRest
                  ? 'bg-[#151922]/50 border-white/[0.04] hover:border-white/[0.08] hover:bg-[#181E2A]'
                  : 'bg-[#181E2A] border-white/[0.06] hover:border-white/[0.14] hover:bg-[#1C2332]'
              }`}
            >
              {/* Day Name, Date & Status Toggle */}
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${accent.dot}`} />
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-300">
                    {day.dayName.slice(0, 3)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {day.dateStr ? day.dateStr.split(' ')[1] || day.dateStr : ''}
                  </span>
                </div>

                {!isRest && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCompleteDay(key, week.weekNumber);
                    }}
                    title={day.completed ? 'Mark uncompleted' : 'Mark completed'}
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                      day.completed
                        ? 'bg-emerald-400 text-slate-950 ring-2 ring-emerald-400/20'
                        : 'border border-white/20 hover:border-white/40 group-hover:bg-white/[0.06]'
                    }`}
                  >
                    {day.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </button>
                )}
              </div>

              {/* Workout Details */}
              <div className="my-1.5 flex-1 flex flex-col justify-start">
                {(() => {
                  const { mainTitle, badge } = formatWorkoutDisplay(day.title, day.subtype);
                  return (
                    <>
                      <div
                        className={`text-xs font-semibold leading-snug line-clamp-2 ${
                          day.completed ? 'text-emerald-200' : isRest ? 'text-slate-400' : 'text-white'
                        }`}
                      >
                        {isRest ? 'Rest Day' : mainTitle}
                      </div>

                      {/* Workout Subtype / Short Description Badge */}
                      {badge && !isRest && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-400/10 text-amber-300 border border-amber-400/20 leading-tight">
                            {badge}
                          </span>
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* Workout Short Description */}
                {day.details && !isRest && (
                  <p
                    title={day.details}
                    className="text-[10px] leading-tight text-slate-400 line-clamp-2 mt-1 font-normal opacity-90 group-hover:opacity-100 transition-opacity"
                  >
                    {day.details}
                  </p>
                )}

                {/* Target Pace */}
                {day.targetPace && (
                  <div className="text-[10px] font-mono truncate mt-1 flex items-center gap-1 text-amber-300/90 font-medium">
                    <Gauge className="w-2.5 h-2.5 shrink-0 opacity-70" />
                    <span>{day.targetPace}</span>
                  </div>
                )}
              </div>

              {/* Distance Bottom Row */}
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[11px] font-mono">
                <span className="font-semibold text-slate-300">
                  {day.plannedKm > 0 ? `${day.plannedKm} km` : '—'}
                </span>
                {day.completed ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    {day.loggedData?.actualKm ? `${day.loggedData.actualKm}k` : '✓ Done'}
                  </span>
                ) : day.loggedData?.actualKm ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-medium border border-amber-500/30" title="Draft log (not marked as completed)">
                    {day.loggedData.actualKm}k draft
                  </span>
                ) : (
                  <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
