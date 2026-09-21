import React, { useState } from 'react';
import {
  X,
  Calculator,
  Trophy,
  ArrowRight,
  Sparkles,
  Info,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import {
  STANDARD_DISTANCES,
  predictRaceTime,
  predictAllDistances,
  parseTimeToSeconds,
  estimateVDOT,
} from '../utils/racePredictor';

interface RacePredictorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToPlanCreator?: (event: 'marathon' | 'half_marathon' | '10k' | '5k', hours: number, minutes: number) => void;
}

export const RacePredictorModal: React.FC<RacePredictorModalProps> = ({
  isOpen,
  onClose,
  onApplyToPlanCreator,
}) => {
  const [sourceEventId, setSourceEventId] = useState<string>('5k');
  const [sourceHours, setSourceHours] = useState<number>(0);
  const [sourceMinutes, setSourceMinutes] = useState<number>(24);
  const [sourceSeconds, setSourceSeconds] = useState<number>(30);

  if (!isOpen) return null;

  const currentSourceDist = STANDARD_DISTANCES.find((d) => d.id === sourceEventId) || STANDARD_DISTANCES[0];
  const sourceTotalSeconds = parseTimeToSeconds(sourceHours, sourceMinutes, sourceSeconds);

  // Predictions across all distances
  const predictions = predictAllDistances(currentSourceDist.distanceKm, sourceTotalSeconds);
  const vdot = sourceTotalSeconds > 0 ? estimateVDOT(currentSourceDist.distanceKm, sourceTotalSeconds) : 0;

  const handleQuickPreset = (id: string, h: number, m: number, s: number) => {
    setSourceEventId(id);
    setSourceHours(h);
    setSourceMinutes(m);
    setSourceSeconds(s);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="race-predictor-modal"
        className="bg-[#12161F] border border-white/[0.08] rounded-2xl w-full max-w-4xl shadow-2xl text-slate-100 flex flex-col max-h-[95vh] overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#12161F]/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20 shrink-0">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Race Time & Equivalency Predictor</span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 border border-white/10">
                  Riegel Formula
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Calculate realistic race times and training paces grounded in recent benchmark performance
              </p>
            </div>
          </div>

          <button
            id="btn-close-race-predictor"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content: 2-Column Responsive Layout */}
        <div className="p-5 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Recent Race Input (5 cols) */}
            <div className="lg:col-span-5 space-y-4 bg-[#181E2A] p-4 rounded-2xl border border-white/[0.06]">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-semibold">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>1. Select Benchmark Race</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STANDARD_DISTANCES.map((d) => (
                    <button
                      key={d.id}
                      id={`pred-bench-${d.id}`}
                      type="button"
                      onClick={() => setSourceEventId(d.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                        sourceEventId === d.id
                          ? 'bg-amber-400/10 border-amber-400/30 text-amber-300 shadow-sm'
                          : 'bg-[#12161F] border-white/[0.06] text-slate-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      {d.name.split(' ')[0]}
                      <span className="block text-[10px] text-slate-400 font-mono font-normal">
                        {d.distanceKm} km
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Inputs */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                  2. Enter Your Finish Time
                </label>
                <div className="flex items-center gap-2 bg-[#12161F] px-3 py-2 rounded-xl border border-white/[0.08]">
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      id="pred-input-hours"
                      type="number"
                      min="0"
                      max="24"
                      value={sourceHours}
                      onChange={(e) => setSourceHours(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-12 bg-white/[0.04] text-center font-mono font-bold text-sm text-white rounded-lg py-1 border border-white/[0.06] focus:border-amber-400 outline-none"
                    />
                    <span className="text-xs text-slate-400 font-mono">hr</span>
                  </div>

                  <span className="text-slate-500 font-bold">:</span>

                  <div className="flex items-center gap-1 flex-1">
                    <input
                      id="pred-input-minutes"
                      type="number"
                      min="0"
                      max="59"
                      value={sourceMinutes}
                      onChange={(e) => setSourceMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-12 bg-white/[0.04] text-center font-mono font-bold text-sm text-white rounded-lg py-1 border border-white/[0.06] focus:border-amber-400 outline-none"
                    />
                    <span className="text-xs text-slate-400 font-mono">min</span>
                  </div>

                  <span className="text-slate-500 font-bold">:</span>

                  <div className="flex items-center gap-1 flex-1">
                    <input
                      id="pred-input-seconds"
                      type="number"
                      min="0"
                      max="59"
                      value={sourceSeconds}
                      onChange={(e) => setSourceSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-12 bg-white/[0.04] text-center font-mono font-bold text-sm text-white rounded-lg py-1 border border-white/[0.06] focus:border-amber-400 outline-none"
                    />
                    <span className="text-xs text-slate-400 font-mono">sec</span>
                  </div>
                </div>
              </div>

              {/* Quick Preset Chips */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-slate-400 block font-mono">Quick Benchmarks:</span>
                <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('5k', 0, 20, 0)}
                    className="px-2 py-0.5 rounded-lg bg-[#12161F] hover:bg-white/[0.06] text-slate-300 border border-white/[0.06] transition-colors"
                  >
                    5K sub-20
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('5k', 0, 25, 0)}
                    className="px-2 py-0.5 rounded-lg bg-[#12161F] hover:bg-white/[0.06] text-slate-300 border border-white/[0.06] transition-colors"
                  >
                    5K 25:00
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('10k', 0, 45, 0)}
                    className="px-2 py-0.5 rounded-lg bg-[#12161F] hover:bg-white/[0.06] text-slate-300 border border-white/[0.06] transition-colors"
                  >
                    10K 45:00
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('half_marathon', 1, 45, 0)}
                    className="px-2 py-0.5 rounded-lg bg-[#12161F] hover:bg-white/[0.06] text-slate-300 border border-white/[0.06] transition-colors"
                  >
                    Half 1:45
                  </button>
                </div>
              </div>

              {/* VDOT Fitness Badge */}
              {vdot > 0 && (
                <div className="p-3 rounded-xl bg-amber-400/[0.08] border border-amber-400/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold text-amber-300">Aerobic Fitness Index</div>
                      <div className="text-[11px] text-slate-400 font-mono">Daniels VDOT Equivalent</div>
                    </div>
                  </div>
                  <span className="text-base font-bold font-mono text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-lg border border-amber-400/30">
                    {vdot}
                  </span>
                </div>
              )}
            </div>

            {/* Right Column: Predicted Equivalent Times & Direct Plan Link (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                  Predicted Race Times & Paces
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  From: {currentSourceDist.name.split(' ')[0]} in {sourceHours > 0 ? `${sourceHours}:` : ''}{sourceMinutes.toString().padStart(2, '0')}:{sourceSeconds.toString().padStart(2, '0')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {predictions.map((p) => {
                  const isCurrent = p.id === sourceEventId;
                  return (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-amber-400/[0.08] border-amber-400/30 shadow-sm'
                          : 'bg-[#181E2A] border-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
                        <span className="font-semibold text-xs text-white">
                          {p.name.split('(')[0]}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {p.distanceKm} km
                        </span>
                      </div>

                      <div className="pt-2 flex items-baseline justify-between">
                        <div>
                          <div className="text-lg font-bold text-white font-mono tracking-tight">
                            {p.formattedTime}
                          </div>
                          <div className="text-xs text-amber-400 font-mono font-medium mt-0.5">
                            {p.pacePerKm}
                          </div>
                        </div>

                        {onApplyToPlanCreator && (
                          <button
                            id={`btn-apply-pred-${p.id}`}
                            type="button"
                            onClick={() => {
                              onApplyToPlanCreator(
                                p.id as any,
                                p.hours,
                                p.minutes
                              );
                              onClose();
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-[11px] flex items-center gap-1 transition-all active:scale-95"
                            title={`Use ${p.formattedTime} to configure ${p.name.split(' ')[0]} training plan`}
                          >
                            <span>Use for Plan</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-[#181E2A] border border-white/[0.06] text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>How to Use These Predictions</span>
                </div>
                <p className="leading-relaxed">
                  Peter Riegel's formula accurately models endurance performance. Clicking <strong>"Use for Plan"</strong> updates your schedule and pacing zones to match your current physiological baseline.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.08] flex items-center justify-end bg-[#12161F]/95 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
