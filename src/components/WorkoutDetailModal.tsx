import React, { useState, useEffect } from 'react';
import {
  X,
  Flame,
  Gauge,
  MapPin,
  Timer,
  Save,
  Trash2,
  Edit3,
  Activity,
  CheckCircle2,
  Check,
  AlertCircle,
  Undo2,
} from 'lucide-react';
import { DaySchedule, LoggedWorkoutData, WorkoutType, TrainingWeek } from '../types';
import {
  calculatePacePerKm,
  parseDurationToSeconds,
  formatWorkoutDisplay,
} from '../utils/paceCalculations';

interface WorkoutDetailModalProps {
  day: DaySchedule;
  weekNumber: number;
  isOpen: boolean;
  onClose: () => void;
  onSaveLog: (loggedData: LoggedWorkoutData, completed: boolean) => void;
  onDeleteLog: (dayKey: keyof TrainingWeek['days'], weekNumber: number) => void;
  onUpdatePlanDay: (
    weekNumber: number,
    dayKey: keyof TrainingWeek['days'],
    updatedDay: Partial<DaySchedule>
  ) => void;
  onOpenTimer: () => void;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  day,
  weekNumber,
  isOpen,
  onClose,
  onSaveLog,
  onDeleteLog,
  onUpdatePlanDay,
  onOpenTimer,
}) => {
  const dayKey = day.dayName.toLowerCase() as keyof TrainingWeek['days'];
  const [activeTab, setActiveTab] = useState<'log' | 'edit_plan'>('log');

  // Log Performance State
  const [actualKm, setActualKm] = useState<string>(
    day.loggedData?.actualKm ? String(day.loggedData.actualKm) : ''
  );
  const [duration, setDuration] = useState<string>(day.loggedData?.duration || '');
  const [rpe, setRpe] = useState<number>(day.loggedData?.rpe || 5);
  const [notes, setNotes] = useState<string>(day.loggedData?.notes || '');
  const [isCompleted, setIsCompleted] = useState<boolean>(day.completed);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Edit Plan State
  const [planTitle, setPlanTitle] = useState<string>(day.title || '');
  const [planSubtype, setPlanSubtype] = useState<string>(day.subtype || '');
  const [planType, setPlanType] = useState<WorkoutType>(day.type);
  const [planDistance, setPlanDistance] = useState<string>(String(day.plannedKm ?? 0));
  const [planTargetPace, setPlanTargetPace] = useState<string>(day.targetPace || '');
  const [planDetails, setPlanDetails] = useState<string>(day.details || '');
  const [planSaveNotice, setPlanSaveNotice] = useState<string | null>(null);

  // Sync state when day changes
  useEffect(() => {
    setActualKm(day.loggedData?.actualKm ? String(day.loggedData.actualKm) : '');
    setDuration(day.loggedData?.duration || '');
    setRpe(day.loggedData?.rpe || 5);
    setNotes(day.loggedData?.notes || '');
    setIsCompleted(day.completed);
    setShowDeleteConfirm(false);

    setPlanTitle(day.title || '');
    setPlanSubtype(day.subtype || '');
    setPlanType(day.type);
    setPlanDistance(String(day.plannedKm ?? 0));
    setPlanTargetPace(day.targetPace || '');
    setPlanDetails(day.details || '');
    setPlanSaveNotice(null);
  }, [day]);

  if (!isOpen) return null;

  const numActualKm = parseFloat(actualKm) || 0;
  const totalSeconds = parseDurationToSeconds(duration);
  const calculatedPace = calculatePacePerKm(numActualKm, totalSeconds);

  // Save Log Handler
  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();

    // Distance to record: user entered actual, or fall back to planned distance
    const distToSave = numActualKm > 0 ? numActualKm : day.plannedKm;

    const loggedData: LoggedWorkoutData = {
      actualKm: distToSave,
      duration: duration || '00:00',
      avgPace: calculatedPace !== '-:-- /km' ? calculatedPace : day.targetPace || '',
      rpe,
      notes,
      loggedAt: day.loggedData?.loggedAt || new Date().toISOString(),
    };

    onSaveLog(loggedData, isCompleted);
    onClose();
  };

  // Delete / Reset Log Handler
  const handleDeleteLog = () => {
    onDeleteLog(dayKey, weekNumber);
    setActualKm('');
    setDuration('');
    setRpe(5);
    setNotes('');
    setIsCompleted(false);
    setShowDeleteConfirm(false);
  };

  // Save Plan Editing Handler
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedKm = Math.max(0, parseFloat(planDistance) || 0);

    const updatedFields: Partial<DaySchedule> = {
      title: planTitle.trim() || (planType === 'rest' ? 'Rest Day' : 'Workout'),
      subtype: planSubtype.trim() || undefined,
      type: planType,
      plannedKm: parsedKm,
      targetPace: planTargetPace.trim() || undefined,
      details: planDetails.trim() || undefined,
    };

    onUpdatePlanDay(weekNumber, dayKey, updatedFields);
    setPlanSaveNotice('Plan successfully updated!');
    setTimeout(() => setPlanSaveNotice(null), 3000);
  };

  const getWorkoutBadge = (type: string) => {
    switch (type) {
      case 'recovery':
      case 'easy':
        return 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20';
      case 'aerobic':
        return 'bg-teal-400/10 text-teal-300 border-teal-400/20';
      case 'quality':
        return 'bg-orange-400/10 text-orange-300 border-orange-400/20';
      case 'long_run':
        return 'bg-sky-400/10 text-sky-300 border-sky-400/20';
      default:
        return 'bg-white/[0.04] text-slate-400 border-white/[0.08]';
    }
  };

  const hasLoggedData = !!day.loggedData || day.completed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="workout-modal-container"
        className="bg-[#12161F] border border-white/[0.08] rounded-2xl w-full max-w-xl max-h-[92vh] overflow-hidden shadow-2xl text-slate-100 flex flex-col"
      >
        {/* Header Bar */}
        <div className="bg-[#12161F] px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border ${getWorkoutBadge(
                day.type
              )}`}
            >
              {day.type.replace('_', ' ')}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Week {weekNumber} · {day.dayName}, {day.dateStr}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Log Activity vs Edit Planned Workout */}
        <div className="px-5 pt-3 pb-2 bg-[#0E121A] border-b border-white/[0.06] flex items-center justify-between gap-2 flex-shrink-0">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#181E2A] rounded-xl border border-white/[0.06] w-full sm:w-auto">
            <button
              id="tab-log-activity"
              type="button"
              onClick={() => setActiveTab('log')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'log'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Log Activity</span>
              {day.completed && (
                <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'log' ? 'bg-slate-950' : 'bg-emerald-400'}`} />
              )}
            </button>

            <button
              id="tab-edit-plan"
              type="button"
              onClick={() => setActiveTab('edit_plan')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'edit_plan'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Plan Workout</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center text-[11px] font-mono text-slate-400">
            Target: <strong className="text-white ml-1">{day.plannedKm} km</strong>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: LOG ACTIVITY */}
          {activeTab === 'log' && (
            <div className="space-y-4">
              {/* Workout Plan Summary Banner */}
              <div className="p-3.5 rounded-xl bg-[#181E2A] border border-white/[0.06] space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    {(() => {
                      const { mainTitle, badge } = formatWorkoutDisplay(day.title, day.subtype);
                      return (
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-bold text-white tracking-tight">{mainTitle}</h2>
                          {badge && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-400/10 text-amber-300 border border-amber-400/20">
                              {badge}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-400">Plan Target:</span>
                    <strong className="text-amber-300 font-semibold">{day.plannedKm} km</strong>
                    {day.targetPace && (
                      <span className="text-slate-400">@ {day.targetPace}</span>
                    )}
                  </div>
                </div>

                {day.details && (
                  <p className="text-xs text-slate-300 leading-relaxed border-t border-white/[0.04] pt-2 whitespace-pre-line">
                    {day.details}
                  </p>
                )}

                {day.type === 'quality' && (
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenTimer();
                      }}
                      className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 text-xs font-medium"
                    >
                      <Timer className="w-3.5 h-3.5" />
                      Open Interval Timer
                    </button>
                  </div>
                )}
              </div>

              {/* Logged Status Banner & Delete Action */}
              {hasLoggedData && (
                <div className="p-3 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-emerald-200">
                        {day.completed ? 'Workout Completed' : 'Session Log Draft Saved'}
                      </span>
                      {day.loggedData && (
                        <p className="text-[11px] font-mono text-emerald-300/80">
                          {day.loggedData.actualKm} km {day.loggedData.duration && `· ${day.loggedData.duration}`} {day.loggedData.avgPace && `· ${day.loggedData.avgPace}`}
                        </p>
                      )}
                    </div>
                  </div>

                  {!showDeleteConfirm ? (
                    <button
                      id="btn-trigger-delete-log"
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium flex items-center gap-1 shrink-0 self-start sm:self-auto transition-colors"
                      title="Clear log and mark workout incomplete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Log</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-[#12161F] p-1.5 rounded-lg border border-rose-500/40 animate-in fade-in duration-150">
                      <span className="text-[11px] text-rose-300 font-medium">Clear this log?</span>
                      <button
                        id="btn-confirm-delete-log"
                        type="button"
                        onClick={handleDeleteLog}
                        className="px-2 py-0.5 rounded bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs"
                      >
                        Yes, Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="text-xs text-slate-400 hover:text-white px-1"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Log Form */}
              <form onSubmit={handleSaveLog} className="space-y-4">
                {/* Mark as Completed Toggle Card */}
                <div
                  onClick={() => setIsCompleted(!isCompleted)}
                  className={`p-3.5 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-3 ${
                    isCompleted
                      ? 'bg-emerald-500/[0.08] border-emerald-500/40 text-emerald-100'
                      : 'bg-[#181E2A] border-white/[0.08] text-slate-300 hover:border-white/[0.15]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                      isCompleted
                        ? 'bg-emerald-400 border-emerald-400 text-slate-950'
                        : 'border-white/30 bg-[#12161F]'
                    }`}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold block text-white">
                      Mark as Completed
                    </span>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      When checked, this workout counts toward your finished mileage and progression charts.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Actual Distance */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Actual Distance Ran (km)
                    </label>
                    <input
                      id="input-log-actual-km"
                      type="number"
                      step="0.01"
                      min="0"
                      value={actualKm}
                      onChange={(e) => setActualKm(e.target.value)}
                      placeholder={day.plannedKm > 0 ? `Target: ${day.plannedKm}` : '0.00'}
                      className="w-full px-3 py-2 rounded-xl bg-[#181E2A] border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Leave empty to use target ({day.plannedKm} km)
                    </span>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Duration (HH:MM:SS or MM:SS)
                    </label>
                    <input
                      id="input-log-duration"
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 52:30 or 1:45:00"
                      className="w-full px-3 py-2 rounded-xl bg-[#181E2A] border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Auto-computes your average pace
                    </span>
                  </div>
                </div>

                {/* Calculated Pace Preview */}
                {numActualKm > 0 && totalSeconds > 0 && (
                  <div className="p-3 rounded-xl bg-[#181E2A] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Calculated Average Pace:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-amber-400">
                        {calculatedPace}
                      </span>
                      {day.targetPace && (
                        <span className="text-slate-400 text-[11px]">
                          (Target: {day.targetPace})
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* RPE Effort Slider */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                    <span>Perceived Effort (RPE)</span>
                    <span className="text-amber-400 font-mono">
                      {rpe}/10 · {rpe <= 3 ? 'Recovery' : rpe <= 5 ? 'Aerobic Steady' : rpe <= 7 ? 'Threshold / Tempo' : 'High-Intensity Max'}
                    </span>
                  </div>
                  <input
                    id="input-log-rpe"
                    type="range"
                    min="1"
                    max="10"
                    value={rpe}
                    onChange={(e) => setRpe(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-[#181E2A] rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Session Notes & Feedback
                  </label>
                  <textarea
                    id="input-log-notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Shoes, fueling, weather, heart rate, cadence feel..."
                    className="w-full px-3 py-2 rounded-xl bg-[#181E2A] border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                  <div>
                    {hasLoggedData && !showDeleteConfirm && (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Log</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-[#181E2A] hover:bg-white/[0.06] text-slate-300 text-xs font-medium transition-colors border border-white/[0.06]"
                    >
                      Cancel
                    </button>
                    <button
                      id="btn-save-logged-workout"
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'Save Completed Session' : 'Save Draft Session'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: EDIT PLAN WORKOUT (Customize built or imported plan) */}
          {activeTab === 'edit_plan' && (
            <form onSubmit={handleSavePlan} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-400/[0.06] border border-amber-400/20 text-xs text-amber-300/90 space-y-1">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Customize Plan Workout</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Update the prescribed schedule for this day. Modifying the planned distance will automatically recalculate Week {weekNumber}'s total target mileage.
                </p>
              </div>

              {planSaveNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
                  <Check className="w-4 h-4" />
                  <span>{planSaveNotice}</span>
                </div>
              )}

              {/* Distance & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Planned Distance (km)
                  </label>
                  <input
                    id="input-plan-km"
                    type="number"
                    step="0.1"
                    min="0"
                    value={planDistance}
                    onChange={(e) => setPlanDistance(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#181E2A] border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Set 0 for Rest Day</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Workout Category
                  </label>
                  <select
                    id="select-plan-type"
                    value={planType}
                    onChange={(e) => {
                      const newType = e.target.value as WorkoutType;
                      setPlanType(newType);
                      if (newType === 'rest' && (!planDistance || planDistance === '0')) {
                        setPlanTitle('Rest Day');
                        setPlanDistance('0');
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#181E2A] border border-white/[0.08] text-white focus:outline-none focus:border-amber-400 text-sm"
                  >
                    <option value="easy">Easy Aerobic Run</option>
                    <option value="aerobic">Aerobic Base Run</option>
                    <option value="quality">Quality (Intervals / Tempo / Fartlek)</option>
                    <option value="long_run">Long Run</option>
                    <option value="recovery">Recovery Run</option>
                    <option value="rest">Rest & Active Recovery</option>
                  </select>
                </div>
              </div>

              {/* Workout Title & Subtype Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Workout Title
                  </label>
                  <input
                    id="input-plan-title"
                    type="text"
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                    placeholder="e.g. Long Run or Aerobic Base Run"
                    className="w-full px-3 py-2 rounded-xl bg-[#181E2A] border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Subtype / Short Badge
                  </label>
                  <input
                    id="input-plan-subtype"
                    type="text"
                    value={planSubtype}
                    onChange={(e) => setPlanSubtype(e.target.value)}
                    placeholder="e.g. Time on Feet, Easy Fartlek, 3k GMP"
                    className="w-full px-3 py-2 rounded-xl bg-[#181E2A] border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
                  />
                </div>
              </div>

              {/* Target Pace */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Pace Prescription
                </label>
                <input
                  id="input-plan-target-pace"
                  type="text"
                  value={planTargetPace}
                  onChange={(e) => setPlanTargetPace(e.target.value)}
                  placeholder="e.g. 6:45–7:00/km or 5:40/km GMP"
                  className="w-full px-3 py-2 rounded-xl bg-[#181E2A] border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm font-mono"
                />
              </div>

              {/* Detailed Instructions */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Workout Details & Coach Instructions
                </label>
                <textarea
                  id="input-plan-details"
                  rows={3}
                  value={planDetails}
                  onChange={(e) => setPlanDetails(e.target.value)}
                  placeholder="Warm up 2km, 6x 1km @ 5:10/km with 90s jog recovery, cool down 2km..."
                  className="w-full px-3 py-2 rounded-xl bg-[#181E2A] border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>

              {/* Quick Actions & Save Plan */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => {
                    setPlanType('rest');
                    setPlanDistance('0');
                    setPlanTitle('Rest Day');
                    setPlanSubtype('');
                    setPlanTargetPace('');
                    setPlanDetails('Scheduled rest and muscle recovery.');
                  }}
                  className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
                >
                  Quick: Set as Rest Day
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-[#181E2A] hover:bg-white/[0.06] text-slate-300 text-xs font-medium transition-colors border border-white/[0.06]"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-save-plan-workout"
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Plan Changes</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

