import React from 'react';
import {
  Flame,
  Gauge,
  Timer,
  Download,
} from 'lucide-react';

interface NavbarProps {
  onOpenBackupModal: () => void;
  onOpenPacingModal: () => void;
  onOpenRulesModal: () => void;
  onOpenTimerModal: () => void;
  totalPlannedKm: number;
  totalActualKm: number;
  completedRunsCount: number;
  totalRunsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBackupModal,
  onOpenPacingModal,
  onOpenRulesModal,
  onOpenTimerModal,
  totalPlannedKm,
  totalActualKm,
  completedRunsCount,
  totalRunsCount,
}) => {
  const percentComplete = Math.round((totalActualKm / totalPlannedKm) * 100) || 0;

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800 text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg shadow-sm">
              🏃
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  18-Week Marathon Tracker
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  GMP 5:40/km
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden md:block">
                Oct 12 – Feb 14 · Race Day 42.2 km · Periodized Training Plan
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar (Desktop) */}
          <div className="hidden lg:flex items-center gap-6 px-4 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700/60 text-xs">
            <div>
              <span className="text-stone-400 block text-[11px]">Logged Volume</span>
              <span className="font-semibold text-stone-100 whitespace-nowrap">
                <strong className="text-emerald-400 font-bold text-sm">
                  {totalActualKm % 1 === 0 ? totalActualKm.toFixed(0) : totalActualKm.toFixed(1)}
                </strong>
                <span className="text-stone-400 font-normal"> / </span>
                {totalPlannedKm % 1 === 0 ? totalPlannedKm.toFixed(0) : totalPlannedKm.toFixed(1)} km
              </span>
            </div>
            <div className="w-px h-6 bg-stone-700" />
            <div>
              <span className="text-stone-400 block text-[11px]">Completed Runs</span>
              <span className="font-semibold text-stone-200">
                {completedRunsCount} / {totalRunsCount}
              </span>
            </div>
            <div className="w-px h-6 bg-stone-700" />
            <div className="w-24">
              <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                <span>Overall</span>
                <span className="text-amber-400 font-bold">{percentComplete}%</span>
              </div>
              <div className="w-full bg-stone-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, percentComplete)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Feature Buttons */}
            <button
              id="btn-pacing-calc"
              onClick={onOpenPacingModal}
              title="Pacing Calculator & Zones"
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <Gauge className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Pacing</span>
            </button>

            <button
              id="btn-golden-rules"
              onClick={onOpenRulesModal}
              title="Golden Rules for GMP"
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <Flame className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Rules</span>
            </button>

            <button
              id="btn-interval-timer"
              onClick={onOpenTimerModal}
              title="Track Intervals Timer"
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <Timer className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Timer</span>
            </button>

            <button
              id="btn-backup-export"
              onClick={onOpenBackupModal}
              title="Backup & Export CSV / JSON"
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Backup</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
