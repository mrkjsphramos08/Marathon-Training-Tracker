import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { INITIAL_PLAN } from './data/marathonPlanData';
import {
  TrainingWeek,
  DaySchedule,
  LoggedWorkoutData,
} from './types';
import { Navbar } from './components/Navbar';
import { WeekCard } from './components/WeekCard';
import { AnalyticsOverview } from './components/AnalyticsOverview';
import { WorkoutDetailModal } from './components/WorkoutDetailModal';
import { PacingCalculatorModal } from './components/PacingCalculatorModal';
import { GoldenRulesModal } from './components/GoldenRulesModal';
import { IntervalTimerModal } from './components/IntervalTimerModal';
import { DataBackupModal } from './components/DataBackupModal';
import { PlanCreatorModal } from './components/PlanCreatorModal';
import { RacePredictorModal } from './components/RacePredictorModal';
import { calculatePacePerKm, parseDurationToSeconds, formatSecondsToDuration } from './utils/paceCalculations';
import { exportPlanToCsv, parseCsvToPlan } from './utils/csvPlanParser';
import { USER_21_WEEK_CSV } from './data/plan21WeekData';

const LOCAL_STORAGE_KEY = 'marathon_training_plan_v3';
const LOCAL_STORAGE_META_KEY = 'marathon_plan_metadata_v3';

interface PlanMetadata {
  title: string;
  goalPace: string;
  eventName?: string;
}

const PARSED_21_PLAN = parseCsvToPlan(USER_21_WEEK_CSV);
const DEFAULT_PLAN: TrainingWeek[] =
  PARSED_21_PLAN.success && PARSED_21_PLAN.plan ? PARSED_21_PLAN.plan : INITIAL_PLAN;

const DEFAULT_META: PlanMetadata = {
  title: '21-Week Marathon Tracker',
  goalPace: 'GMP 5:40/km',
  eventName: 'Race on Feb 14, 2027',
};

export default function App() {
  // Plan state
  const [plan, setPlan] = useState<TrainingWeek[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].days) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved plan:', e);
      }
    }
    return DEFAULT_PLAN;
  });

  // Plan metadata state (Title, Goal Pace)
  const [planMeta, setPlanMeta] = useState<PlanMetadata>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_META_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.title) return parsed;
      } catch (e) {
        console.error('Failed to parse saved meta:', e);
      }
    }
    return DEFAULT_META;
  });

  // Modal States
  const [activeWorkout, setActiveWorkout] = useState<{
    day: DaySchedule;
    weekNumber: number;
  } | null>(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isPlanCreatorOpen, setIsPlanCreatorOpen] = useState(false);
  const [isPredictorModalOpen, setIsPredictorModalOpen] = useState(false);
  const [initialPredictorTarget, setInitialPredictorTarget] = useState<{
    event: 'marathon' | 'half_marathon' | '10k' | '5k';
    hours: number;
    minutes: number;
  } | null>(null);
  const [isPacingModalOpen, setIsPacingModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState('All Weeks');

  const handleApplyPredictorToPlan = (
    event: 'marathon' | 'half_marathon' | '10k' | '5k',
    hours: number,
    minutes: number
  ) => {
    setInitialPredictorTarget({ event, hours, minutes });
    setIsPredictorModalOpen(false);
    setIsPlanCreatorOpen(true);
  };

  // Save plan and metadata to localStorage whenever they update
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plan));
  }, [plan]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_META_KEY, JSON.stringify(planMeta));
  }, [planMeta]);

  // Apply a newly generated plan from the in-app builder
  const handleApplyCustomPlan = (
    newPlan: TrainingWeek[],
    meta: {
      title: string;
      goalPace: string;
      eventName: string;
      startDate?: string;
      raceDate?: string;
    }
  ) => {
    setPlan(newPlan);
    setPlanMeta({
      title: meta.title,
      goalPace: meta.goalPace ? `Goal ${meta.goalPace}` : 'Custom Goal',
      eventName: meta.eventName,
    });
    setSelectedPhase('All Weeks');
  };

  // Import CSV Plan
  const handleImportCsv = (importedPlan: TrainingWeek[]) => {
    setPlan(importedPlan);
    setPlanMeta({
      title: `${importedPlan.length}-Week Training Plan`,
      goalPace: 'Custom Schedule',
      eventName: 'Imported Plan',
    });
    setSelectedPhase('All Weeks');
  };

  // Import JSON backup
  const handleImportJson = (importedPlan: TrainingWeek[]) => {
    setPlan(importedPlan);
    setPlanMeta({
      title: `${importedPlan.length}-Week Training Plan`,
      goalPace: 'Custom Schedule',
      eventName: 'Restored Plan',
    });
    setSelectedPhase('All Weeks');
  };

  // Log workout data
  const handleSaveWorkoutLog = (loggedData: LoggedWorkoutData, completed: boolean) => {
    if (!activeWorkout) return;
    const { day, weekNumber } = activeWorkout;

    // Day key lookup
    const dayKey = day.dayName.toLowerCase() as keyof TrainingWeek['days'];

    const updatedPlan = plan.map((w) => {
      if (w.weekNumber !== weekNumber) return w;

      const updatedDay: DaySchedule = {
        ...w.days[dayKey],
        completed,
        loggedData,
      };

      const newDays = {
        ...w.days,
        [dayKey]: updatedDay,
      };

      // Recalculate weekly totals
      const daysList = Object.values(newDays) as DaySchedule[];
      const totalActualDist = daysList.reduce((acc, d) => {
        if (d.loggedData?.actualKm) return acc + d.loggedData.actualKm;
        if (d.completed && d.plannedKm > 0) return acc + d.plannedKm;
        return acc;
      }, 0);

      // Duration sum
      const totalSeconds = daysList.reduce((acc, d) => {
        if (d.loggedData?.duration) {
          return acc + parseDurationToSeconds(d.loggedData.duration);
        }
        return acc;
      }, 0);

      const totalDurationStr = totalSeconds > 0 ? formatSecondsToDuration(totalSeconds) : undefined;
      const weeklyAvgPace =
        totalActualDist > 0 && totalSeconds > 0
          ? calculatePacePerKm(totalActualDist, totalSeconds)
          : undefined;

      return {
        ...w,
        days: newDays,
        actualDist: totalActualDist > 0 ? parseFloat(totalActualDist.toFixed(1)) : undefined,
        totalDuration: totalDurationStr,
        avgPace: weeklyAvgPace,
      };
    });

    setPlan(updatedPlan);

    // If final race day completed, throw confetti celebration!
    if (weekNumber === plan.length && (dayKey === 'sunday' || dayKey === 'saturday') && completed) {
      try {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // confetti error ignored
      }
    }
  };

  // Quick toggle completed status
  const handleToggleCompleteDay = (dayKey: keyof TrainingWeek['days'], weekNumber: number) => {
    const updatedPlan = plan.map((w) => {
      if (w.weekNumber !== weekNumber) return w;

      const currentDay = w.days[dayKey];
      const newCompleted = !currentDay.completed;

      const updatedDay: DaySchedule = {
        ...currentDay,
        completed: newCompleted,
      };

      const newDays = {
        ...w.days,
        [dayKey]: updatedDay,
      };

      const daysList = Object.values(newDays) as DaySchedule[];
      const totalActualDist = daysList.reduce((acc, d) => {
        if (d.loggedData?.actualKm) return acc + d.loggedData.actualKm;
        if (d.completed && d.plannedKm > 0) return acc + d.plannedKm;
        return acc;
      }, 0);

      return {
        ...w,
        days: newDays,
        actualDist: totalActualDist > 0 ? parseFloat(totalActualDist.toFixed(1)) : undefined,
      };
    });

    setPlan(updatedPlan);
  };

  // Export CSV
  const handleExportCsv = () => {
    const csvContent = exportPlanToCsv(plan);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${planMeta.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export JSON backup
  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(plan, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `${planMeta.title.replace(/\s+/g, '_')}_backup.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset to default
  const handleResetToDefault = () => {
    setPlan(DEFAULT_PLAN);
    setPlanMeta(DEFAULT_META);
    setSelectedPhase('All Weeks');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_META_KEY);
  };

  // Overall metrics calculation
  const totalPlannedKm = Math.round(plan.reduce((acc, w) => acc + w.plannedDist, 0) * 10) / 10;
  const rawActualKm = plan.reduce((acc, w) => {
    if (w.actualDist) return acc + w.actualDist;
    const weekActual = (Object.values(w.days) as DaySchedule[]).reduce((s, d) => {
      if (d.loggedData?.actualKm) return s + d.loggedData.actualKm;
      if (d.completed && d.plannedKm > 0) return s + d.plannedKm;
      return s;
    }, 0);
    return acc + weekActual;
  }, 0);
  const totalActualKm = Math.round(rawActualKm * 10) / 10;

  let totalRunsCount = 0;
  let completedRunsCount = 0;
  plan.forEach((w) => {
    (Object.values(w.days) as DaySchedule[]).forEach((d) => {
      if (d.type !== 'rest') {
        totalRunsCount++;
        if (d.completed) completedRunsCount++;
      }
    });
  });

  // Filter weeks by phase
  const filteredWeeks = plan.filter((w) => {
    if (selectedPhase === 'All Weeks') return true;
    return w.phase === selectedPhase;
  });

  // Date range and race day label
  const startDayStr = plan[0]?.days?.monday?.dateStr || plan[0]?.dateMon;
  const lastWeek = plan[plan.length - 1];
  const raceDayStr =
    lastWeek?.days?.sunday?.type !== 'rest'
      ? lastWeek?.days?.sunday?.dateStr
      : lastWeek?.days?.saturday?.dateStr || lastWeek?.days?.sunday?.dateStr || lastWeek?.dateMon;

  const dateRangeLabel =
    plan.length > 0
      ? `${startDayStr} → ${raceDayStr} · ${plan.length} Weeks`
      : 'Periodized Training Plan';

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 selection:bg-amber-500 selection:text-stone-950">
      {/* Sticky Navigation Header */}
      <Navbar
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenPacingModal={() => setIsPacingModalOpen(true)}
        onOpenRulesModal={() => setIsRulesModalOpen(true)}
        onOpenTimerModal={() => setIsTimerModalOpen(true)}
        onOpenPlanCreator={() => setIsPlanCreatorOpen(true)}
        onOpenPredictorModal={() => setIsPredictorModalOpen(true)}
        planTitle={planMeta.title}
        goalPaceLabel={planMeta.goalPace}
        dateRangeLabel={dateRangeLabel}
        totalPlannedKm={totalPlannedKm}
        totalActualKm={totalActualKm}
        completedRunsCount={completedRunsCount}
        totalRunsCount={totalRunsCount}
      />

      {/* Main Content Area */}
      <main className="max-w-[1600px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Next Workout & Interactive Volume Chart */}
        <AnalyticsOverview
          plan={plan}
          onSelectDay={(day, weekNumber) => setActiveWorkout({ day, weekNumber })}
          onOpenSyncModal={() => setIsBackupModalOpen(true)}
          selectedPhase={selectedPhase}
          onSelectPhase={setSelectedPhase}
        />

        {/* Schedule Section */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {planMeta.title} Schedule
              </h2>
              <p className="text-xs text-stone-400">
                Click any day to view details, pacing guidelines, or log actual miles & duration
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-stone-400">
                Showing <strong className="text-white">{filteredWeeks.length}</strong> of{' '}
                {plan.length} weeks
              </span>
              {selectedPhase !== 'All Weeks' && (
                <button
                  type="button"
                  onClick={() => setSelectedPhase('All Weeks')}
                  className="text-amber-400 hover:underline"
                >
                  View all
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {filteredWeeks.map((week) => (
              <WeekCard
                key={week.weekNumber}
                week={week}
                isCurrentWeek={week.weekNumber === 1}
                onSelectDay={(day, weekNumber) =>
                  setActiveWorkout({ day, weekNumber })
                }
                onToggleCompleteDay={handleToggleCompleteDay}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Workout Detail / Logger Modal */}
      {activeWorkout && (
        <WorkoutDetailModal
          day={activeWorkout.day}
          weekNumber={activeWorkout.weekNumber}
          isOpen={!!activeWorkout}
          onClose={() => setActiveWorkout(null)}
          onSaveLog={handleSaveWorkoutLog}
          onOpenTimer={() => setIsTimerModalOpen(true)}
        />
      )}

      {/* In-App Plan Creator Wizard Modal */}
      <PlanCreatorModal
        isOpen={isPlanCreatorOpen}
        onClose={() => {
          setIsPlanCreatorOpen(false);
          setInitialPredictorTarget(null);
        }}
        onApplyPlan={handleApplyCustomPlan}
        initialEvent={initialPredictorTarget?.event}
        initialHours={initialPredictorTarget?.hours}
        initialMinutes={initialPredictorTarget?.minutes}
      />

      {/* Race Predictor Modal */}
      <RacePredictorModal
        isOpen={isPredictorModalOpen}
        onClose={() => setIsPredictorModalOpen(false)}
        onApplyToPlanCreator={handleApplyPredictorToPlan}
      />

      {/* Data Backup & CSV / Excel Import Modal */}
      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        plan={plan}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onImportCsv={handleImportCsv}
        onResetToDefault={handleResetToDefault}
        onOpenPlanCreator={() => setIsPlanCreatorOpen(true)}
      />

      {/* Pacing Calculator Modal */}
      <PacingCalculatorModal
        isOpen={isPacingModalOpen}
        onClose={() => setIsPacingModalOpen(false)}
      />

      {/* Golden Rules Modal (Dynamically Calibrated) */}
      <GoldenRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        planTitle={planMeta.title}
        goalPaceLabel={planMeta.goalPace}
        eventName={planMeta.eventName || 'Full Marathon (42.2k)'}
        weeksCount={plan.length}
      />

      {/* Interval Timer Modal */}
      <IntervalTimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
      />
    </div>
  );
}
