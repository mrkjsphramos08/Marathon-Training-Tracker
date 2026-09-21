import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  Flame,
  Gauge,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  Timer,
  Save,
  Check,
} from 'lucide-react';
import { DaySchedule, LoggedWorkoutData } from '../types';
import {
  calculatePacePerKm,
  parseDurationToSeconds,
  formatSecondsToDuration,
} from '../utils/paceCalculations';

interface WorkoutDetailModalProps {
  day: DaySchedule;
  weekNumber: number;
  isOpen: boolean;
  onClose: () => void;
  onSaveLog: (loggedData: LoggedWorkoutData, completed: boolean) => void;
  onOpenTimer: () => void;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  day,
  weekNumber,
  isOpen,
  onClose,
  onSaveLog,
  onOpenTimer,
}) => {
  const [actualKm, setActualKm] = useState<string>(
    day.loggedData?.actualKm ? String(day.loggedData.actualKm) : String(day.plannedKm || '')
  );
  const [duration, setDuration] = useState<string>(day.loggedData?.duration || '');
  const [rpe, setRpe] = useState<number>(day.loggedData?.rpe || 5);
  const [notes, setNotes] = useState<string>(day.loggedData?.notes || '');
  const [isCompleted, setIsCompleted] = useState<boolean>(day.completed);

  // Sync state when day changes
  useEffect(() => {
    setActualKm(day.loggedData?.actualKm ? String(day.loggedData.actualKm) : String(day.plannedKm || ''));
    setDuration(day.loggedData?.duration || '');
    setRpe(day.loggedData?.rpe || 5);
    setNotes(day.loggedData?.notes || '');
    setIsCompleted(day.completed);
  }, [day]);

  if (!isOpen) return null;

  const numActualKm = parseFloat(actualKm) || 0;
  const totalSeconds = parseDurationToSeconds(duration);
  const calculatedPace = calculatePacePerKm(numActualKm, totalSeconds);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const loggedData: LoggedWorkoutData = {
      actualKm: numActualKm > 0 ? numActualKm : day.plannedKm,
      duration: duration || '00:00',
      avgPace: calculatedPace !== '-:-- /km' ? calculatedPace : day.targetPace || '',
      rpe,
      notes,
      loggedAt: new Date().toISOString(),
    };
    onSaveLog(loggedData, isCompleted);
    onClose();
  };

  const getWorkoutColorBadge = (type: string) => {
    switch (type) {
      case 'recovery':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'aerobic':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'quality':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'long_run':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'easy':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default:
        return 'bg-stone-800 text-stone-400 border-stone-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="workout-modal-container"
        className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl text-stone-100"
      >
        {/* Header */}
        <div className="sticky top-0 bg-stone-900/95 backdrop-blur px-6 py-4 border-b border-stone-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getWorkoutColorBadge(
                day.type
              )}`}
            >
              {day.type.replace('_', ' ')}
            </span>
            <span className="text-xs text-stone-400 font-medium">
              Week {weekNumber} · {day.dayName}, {day.dateStr}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title & Planned Stats */}
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{day.title}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-stone-300">
              {day.plannedKm > 0 && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-white">{day.plannedKm} km</span> planned
                </div>
              )}
              {day.targetPace && (
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-amber-400" />
                  <span>Target: <strong className="text-amber-300">{day.targetPace}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Details / Instructions */}
          {day.details && (
            <div className="p-4 rounded-xl bg-stone-800/70 border border-stone-700/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 flex items-center justify-between">
                <span>Workout Instructions</span>
                {day.type === 'quality' && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenTimer();
                    }}
                    className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs font-semibold lowercase tracking-normal"
                  >
                    <Timer className="w-3.5 h-3.5" />
                    Open Interval Timer
                  </button>
                )}
              </h3>
              <p className="text-sm leading-relaxed text-stone-200 whitespace-pre-line">
                {day.details}
              </p>
            </div>
          )}

          {/* Golden Rules reminder for Long Run / Quality */}
          {(day.type === 'long_run' || day.type === 'quality') && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-3">
              <Flame className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-amber-300">Pacing & Fueling Reminder:</strong>
                Never bank time. Run the easy sections truly easy (6:30–7:00/km) so you have glycogen reserve to lock into goal pace and simulate race-day nutrition!
              </div>
            </div>
          )}

          {/* Log Workout Form */}
          {day.type !== 'rest' && (
            <form onSubmit={handleSave} className="space-y-4 pt-2 border-t border-stone-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Log Run Data
                </h3>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-300 select-none">
                  <input
                    id="input-log-completed"
                    type="checkbox"
                    checked={isCompleted}
                    onChange={(e) => setIsCompleted(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-600 bg-stone-800 text-emerald-500 focus:ring-emerald-400 focus:ring-offset-stone-900"
                  />
                  <span>Mark as Completed</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Actual Distance */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Actual Distance (km)
                  </label>
                  <input
                    id="input-log-actual-km"
                    type="number"
                    step="0.01"
                    min="0"
                    value={actualKm}
                    onChange={(e) => setActualKm(e.target.value)}
                    placeholder={`${day.plannedKm}`}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Duration (e.g. 0:52:30 or 52:30)
                  </label>
                  <input
                    id="input-log-duration"
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="HH:MM:SS or MM:SS"
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm font-mono"
                  />
                </div>
              </div>

              {/* Calculated Pace Preview */}
              {numActualKm > 0 && totalSeconds > 0 && (
                <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/60 flex items-center justify-between text-xs">
                  <span className="text-stone-400">Calculated Average Pace:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-amber-400">
                      {calculatedPace}
                    </span>
                    {day.targetPace && (
                      <span className="text-stone-400 text-[11px]">
                        (Target: {day.targetPace})
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* RPE Effort Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-300 mb-1">
                  <span>Perceived Effort (RPE)</span>
                  <span className="text-amber-400">
                    {rpe} / 10 · {rpe <= 3 ? 'Very Easy / Recovery' : rpe <= 5 ? 'Moderate Aerobic' : rpe <= 7 ? 'Comfortably Hard / Tempo' : 'Hard / Interval Max'}
                  </span>
                </div>
                <input
                  id="input-log-rpe"
                  type="range"
                  min="1"
                  max="10"
                  value={rpe}
                  onChange={(e) => setRpe(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Run Notes & Feedback
                </label>
                <textarea
                  id="input-log-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did your legs, heart rate, and shoes feel? Fueling notes..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-logged-workout"
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Log & Update</span>
                </button>
              </div>
            </form>
          )}

          {day.type === 'rest' && (
            <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
              <span className="text-xs text-stone-400">Scheduled rest day</span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
