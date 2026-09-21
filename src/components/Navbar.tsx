import React from 'react';
import {
  Flame,
  Gauge,
  Timer,
  FileSpreadsheet,
  Sparkles,
  Calculator,
  Activity,
  Calendar,
} from 'lucide-react';

interface NavbarProps {
  onOpenBackupModal: () => void;
  onOpenPacingModal: () => void;
  onOpenRulesModal: () => void;
  onOpenTimerModal: () => void;
  onOpenPlanCreator: () => void;
  onOpenPredictorModal: () => void;
  planTitle?: string;
  goalPaceLabel?: string;
  dateRangeLabel?: string;
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
  onOpenPlanCreator,
  onOpenPredictorModal,
  planTitle = 'Marathon Training Plan',
  goalPaceLabel = 'GMP 5:40/km',
  dateRangeLabel = '18 Weeks · Periodized Plan',
  totalPlannedKm,
  totalActualKm,
  completedRunsCount,
  totalRunsCount,
}) => {
  const percentComplete = Math.round((totalActualKm / totalPlannedKm) * 100) || 0;

  return (
    <header className="sticky top-0 z-40 bg-[#0B0E14]/90 backdrop-blur-md border-b border-white/[0.08] text-slate-100 transition-colors">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* Brand Mark & Title */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#12161F] border border-amber-500/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.15)] p-1 overflow-hidden">
              <img src="/favicon.svg" alt="App Icon" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] tracking-widest uppercase text-amber-400/90 font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 hidden sm:inline-block">
                  Cadence
                </span>
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white truncate">
                  {planTitle}
                </h1>
                {goalPaceLabel && (
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-white/[0.06] text-slate-200 border border-white/10 whitespace-nowrap">
                    {goalPaceLabel}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                <span>{dateRangeLabel}</span>
              </p>
            </div>
          </div>

          {/* Precision Metrics Display (Desktop) */}
          <div className="hidden lg:flex items-center gap-5 px-4 py-2 rounded-xl bg-[#12161F] border border-white/[0.08]">
            <div className="space-y-0.5">
              <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 block">
                Total Volume
              </span>
              <div className="font-mono text-xs text-slate-200 flex items-baseline gap-1">
                <strong className="text-white text-sm font-semibold">
                  {totalActualKm % 1 === 0 ? totalActualKm.toFixed(0) : totalActualKm.toFixed(1)}
                </strong>
                <span className="text-slate-500">/</span>
                <span className="text-slate-400">
                  {totalPlannedKm % 1 === 0 ? totalPlannedKm.toFixed(0) : totalPlannedKm.toFixed(1)} km
                </span>
              </div>
            </div>

            <div className="w-px h-7 bg-white/[0.08]" />

            <div className="space-y-0.5">
              <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 block">
                Sessions
              </span>
              <span className="font-mono text-xs text-slate-200 block">
                <strong className="text-white text-sm font-semibold">{completedRunsCount}</strong>
                <span className="text-slate-500"> / </span>
                <span className="text-slate-400">{totalRunsCount}</span>
              </span>
            </div>

            <div className="w-px h-7 bg-white/[0.08]" />

            <div className="w-28 space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-400 uppercase tracking-wider">Progress</span>
                <span className="text-amber-400 font-semibold">{percentComplete}%</span>
              </div>
              <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, percentComplete)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            {/* Primary Action: Build / Customize */}
            <button
              id="btn-create-plan"
              onClick={onOpenPlanCreator}
              title="Open Custom Plan Builder"
              className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Build Plan</span>
            </button>

            {/* Performance Tools */}
            <div className="flex items-center bg-[#12161F] p-0.5 rounded-lg border border-white/[0.08]">
              <button
                id="btn-race-predictor"
                onClick={onOpenPredictorModal}
                title="Race Time Predictor & Calibrator"
                className="px-2.5 py-1.5 rounded-md hover:bg-white/[0.06] text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
              >
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xl:inline">Predictor</span>
              </button>

              <button
                id="btn-pacing-calc"
                onClick={onOpenPacingModal}
                title="Pacing Calculator & Target Splits"
                className="px-2.5 py-1.5 rounded-md hover:bg-white/[0.06] text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
              >
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xl:inline">Pacing</span>
              </button>

              <button
                id="btn-golden-rules"
                onClick={onOpenRulesModal}
                title="Pacing Guidelines & Golden Rules"
                className="px-2.5 py-1.5 rounded-md hover:bg-white/[0.06] text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
              >
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden xl:inline">Rules</span>
              </button>

              <button
                id="btn-interval-timer"
                onClick={onOpenTimerModal}
                title="Track Intervals Timer"
                className="px-2.5 py-1.5 rounded-md hover:bg-white/[0.06] text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
              >
                <Timer className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden xl:inline">Timer</span>
              </button>

              <button
                id="btn-backup-export"
                onClick={onOpenBackupModal}
                title="Import/Export CSV & Data Backup"
                className="px-2.5 py-1.5 rounded-md hover:bg-white/[0.06] text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xl:inline">Data & CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
