import React, { useState } from 'react';
import { X, Gauge, Clock, Target, ArrowRight, Info } from 'lucide-react';
import { calculateZonesForGoalTime } from '../utils/paceCalculations';

interface PacingCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PacingCalculatorModal: React.FC<PacingCalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [hours, setHours] = useState<number>(3);
  const [minutes, setMinutes] = useState<number>(59);
  const [unit, setUnit] = useState<'km' | 'mi'>('km');

  if (!isOpen) return null;

  const zones = calculateZonesForGoalTime(hours, minutes);
  const totalSeconds = hours * 3600 + minutes * 60;
  const marathonPaceSec = totalSeconds / 42.195;

  const formatPace = (secondsPerKm: number) => {
    const sec = unit === 'mi' ? secondsPerKm * 1.60934 : secondsPerKm;
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')} /${unit}`;
  };

  const splits = [
    { label: '5 km', km: 5 },
    { label: '10 km', km: 10 },
    { label: '15 km', km: 15 },
    { label: '21.1 km (Half)', km: 21.0975 },
    { label: '30 km', km: 30 },
    { label: '35 km', km: 35 },
    { label: '42.2 km (Finish)', km: 42.195 },
  ];

  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = Math.floor(totalSec % 60);
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
    return `${pad(m)}:${pad(s)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="pacing-calculator-container"
        className="bg-[#12161F] border border-white/[0.08] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#12161F]/95 backdrop-blur-md px-6 py-4 border-b border-white/[0.08] flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20 shrink-0">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Pacing Calculator & Target Splits
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Calibrate marathon pace blocks and physiological training zones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Target Goal Input */}
          <div className="p-5 rounded-2xl bg-[#181E2A] border border-white/[0.06] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-semibold">
                <Target className="w-4 h-4" />
                <span>Target Marathon Finish Time</span>
              </div>

              {/* Unit toggle */}
              <div className="flex rounded-lg bg-[#12161F] p-0.5 border border-white/[0.06] text-xs">
                <button
                  type="button"
                  onClick={() => setUnit('km')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    unit === 'km' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Metric (/km)
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('mi')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    unit === 'mi' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Miles (/mi)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs text-slate-400 font-mono mb-1">Hours</label>
                <input
                  type="number"
                  min="2"
                  max="6"
                  value={hours}
                  onChange={(e) => setHours(Math.max(2, Math.min(6, parseInt(e.target.value, 10) || 2)))}
                  className="w-full px-3 py-2 rounded-xl bg-[#12161F] border border-white/[0.08] text-white font-mono text-center text-lg font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-mono mb-1">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0)))}
                  className="w-full px-3 py-2 rounded-xl bg-[#12161F] border border-white/[0.08] text-white font-mono text-center text-lg font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="col-span-2 p-3 rounded-xl bg-amber-400/[0.08] border border-amber-400/20 flex items-center justify-between">
                <span className="text-xs text-amber-200/90 font-mono">Goal Pace (GMP):</span>
                <span className="font-mono text-lg font-bold text-amber-300">
                  {formatPace(marathonPaceSec)}
                </span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className="text-slate-400 text-[11px] font-mono self-center">Presets:</span>
              {[
                { h: 3, m: 30, label: '3:30 (4:59/km)' },
                { h: 3, m: 45, label: '3:45 (5:20/km)' },
                { h: 3, m: 59, label: '3:59 (5:40/km - Active Plan)' },
                { h: 4, m: 15, label: '4:15 (6:03/km)' },
                { h: 4, m: 30, label: '4:30 (6:24/km)' },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setHours(p.h);
                    setMinutes(p.m);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-colors ${
                    hours === p.h && minutes === p.m
                      ? 'bg-amber-400/10 border-amber-400/30 text-amber-300 font-semibold'
                      : 'bg-[#12161F] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calibrated Training Zones */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5 font-semibold">
              Calculated Workout Zones for {hours}h {minutes.toString().padStart(2, '0')}m
            </h3>
            <div className="space-y-2">
              {zones.map((z) => (
                <div
                  key={z.name}
                  className="p-3 rounded-xl bg-[#181E2A] border border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-semibold text-white text-xs">{z.name}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">{z.description}</div>
                  </div>
                  <div className="font-mono text-xs font-bold text-amber-300 bg-[#12161F] px-3 py-1 rounded-lg border border-white/10">
                    {formatPace(z.minPaceSec)}
                    {z.maxPaceSec !== z.minPaceSec && ` – ${formatPace(z.maxPaceSec)}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Split Checkpoints */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5 font-semibold">
              Target Race Splits (Even Pace Strategy)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {splits.map((s) => {
                const checkpointSec = s.km * marathonPaceSec;
                return (
                  <div
                    key={s.label}
                    className="p-2.5 rounded-xl bg-[#181E2A] border border-white/[0.06] text-center"
                  >
                    <div className="text-[11px] font-mono text-slate-400">{s.label}</div>
                    <div className="font-mono font-bold text-xs text-emerald-400 mt-0.5">
                      {formatTime(checkpointSec)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
