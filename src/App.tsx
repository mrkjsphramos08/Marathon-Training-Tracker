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
import { calculatePacePerKm, parseDurationToSeconds, formatSecondsToDuration } from './utils/paceCalculations';

const LOCAL_STORAGE_KEY = 'marathon_training_plan_v2';

export default function App() {
  // Plan state
  const [plan, setPlan] = useState<TrainingWeek[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 18) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved plan:', e);
      }
    }
    return INITIAL_PLAN;
  });

  // Modal States
  const [activeWorkout, setActiveWorkout] = useState<{
    day: DaySchedule;
    weekNumber: number;
  } | null>(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isPacingModalOpen, setIsPacingModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState('All Weeks');

  // Save plan to localStorage whenever it updates
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plan));
  }, [plan]);

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
      const weeklyAvgPace = totalActualDist > 0 && totalSeconds > 0
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

    // If race day completed, throw confetti celebration!
    if (weekNumber === 18 && dayKey === 'sunday' && completed) {
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
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += '18 Week Marathon Training Plan,,,,,,,,,,,,,,,,\n';
    csvContent += ',,,,,,,,,,,,,,,,\n';
    csvContent += 'The Run Details & Pacing,,,,,,,,,,,,,,,,\n';
    csvContent += ',Monday (Recovery): The slowest run of the week (6:45–7:00/km). Keep ego in check.\n';
    csvContent += ',Tuesday (Aerobic/Mid-Long): A smooth easy run (6:15–6:30/km). Accumulate volume.\n';
    csvContent += ',Thursday (Quality Workout): Alternates short fast intervals and sustained tempos (5:20/km).\n';
    csvContent += ',Friday (Easy): Short light jog (6:30/km).\n';
    csvContent += ',Sunday (Quality Long Run): Alternates Time on Feet and GMP blocks (5:40/km).\n';
    csvContent += 'Golden Rules for GMP Blocks,,,,,,,,,,,,,,,,\n';
    csvContent += ',1. Never Bank Time\n';
    csvContent += ',2. Practice Fueling\n';
    csvContent += ',3. Respect Warm-up\n\n';
    csvContent += 'Week,Date (Mon),Monday (Recovery),Tuesday (Aerobic),Wednesday (Rest),Thursday (Quality),Thursday Details,Friday (Easy),Saturday (Rest),Sunday (Long Run),Sunday Details,,Planned Dist (km),Actual Dist (km),Total Duration,Avg Pace,Notes\n';

    plan.forEach((w) => {
      const row = [
        w.weekNumber,
        `"${w.dateMon}"`,
        `"${w.days.monday.plannedKm} km"`,
        `"${w.days.tuesday.plannedKm} km"`,
        '"Rest"',
        `"${w.days.thursday.plannedKm} km"`,
        `"${(w.days.thursday.details || '').replace(/"/g, '""')}"`,
        `"${w.days.friday.plannedKm} km"`,
        '"Rest"',
        `"${w.days.sunday.plannedKm} km"`,
        `"${(w.days.sunday.details || '').replace(/"/g, '""')}"`,
        '',
        w.plannedDist,
        w.actualDist || '',
        w.totalDuration || '',
        w.avgPace || '',
        `"${(w.notes || '').replace(/"/g, '""')}"`,
      ];
      csvContent += row.join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', '18_Week_Marathon_Training_Plan.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON backup
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(plan, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', 'marathon_training_backup.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import JSON backup
  const handleImportJson = (importedPlan: TrainingWeek[]) => {
    setPlan(importedPlan);
  };

  // Reset to default
  const handleResetToDefault = () => {
    setPlan(INITIAL_PLAN);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
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

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 selection:bg-amber-500 selection:text-stone-950">
      {/* Sticky Navigation Header */}
      <Navbar
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenPacingModal={() => setIsPacingModalOpen(true)}
        onOpenRulesModal={() => setIsRulesModalOpen(true)}
        onOpenTimerModal={() => setIsTimerModalOpen(true)}
        totalPlannedKm={totalPlannedKm}
        totalActualKm={totalActualKm}
        completedRunsCount={completedRunsCount}
        totalRunsCount={totalRunsCount}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Next Workout & Interactive Volume Chart */}
        <AnalyticsOverview
          plan={plan}
          onSelectDay={(day, weekNumber) => setActiveWorkout({ day, weekNumber })}
          onOpenSyncModal={() => setIsBackupModalOpen(true)}
          selectedPhase={selectedPhase}
          onSelectPhase={setSelectedPhase}
        />

        {/* 18 Weeks Schedule Section */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                18-Week Training Schedule
              </h2>
              <p className="text-xs text-stone-400">
                Click any day to view details, pacing guidelines, or log actual miles & duration
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-stone-400">
                Showing <strong className="text-white">{filteredWeeks.length}</strong> of 18 weeks
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

      {/* Data Backup & Export Modal */}
      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        plan={plan}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onResetToDefault={handleResetToDefault}
      />

      {/* Pacing Calculator Modal */}
      <PacingCalculatorModal
        isOpen={isPacingModalOpen}
        onClose={() => setIsPacingModalOpen(false)}
      />

      {/* Golden Rules Modal */}
      <GoldenRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {/* Interval Timer Modal */}
      <IntervalTimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
      />
    </div>
  );
}
