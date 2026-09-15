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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="pacing-calculator-container"
        className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-stone-100"
      >
        {/* Header */}
        <div className="sticky top-0 bg-stone-900/95 backdrop-blur px-6 py-4 border-b border-stone-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Pacing Calculator & Training Zones
              </h2>
              <p className="text-xs text-stone-400">
                Calibrate your GMP blocks and personalized training zones
              </p>
            </div>
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
          {/* Target Goal Input */}
          <div className="p-5 rounded-2xl bg-stone-800/80 border border-stone-700/60 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                <span>Target Marathon Finish Time</span>
              </div>

              {/* Unit toggle */}
              <div className="flex rounded-lg bg-stone-900 p-0.5 border border-stone-700 text-xs">
                <button
                  type="button"
                  onClick={() => setUnit('km')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    unit === 'km' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Metric (/km)
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('mi')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    unit === 'mi' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Miles (/mi)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs text-stone-400 mb-1">Hours</label>
                <input
                  type="number"
                  min="2"
                  max="6"
                  value={hours}
                  onChange={(e) => setHours(Math.max(2, Math.min(6, parseInt(e.target.value, 10) || 2)))}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-center text-lg font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-400 mb-1">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0)))}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-center text-lg font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="col-span-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <span className="text-xs text-amber-200">Goal Marathon Pace (GMP):</span>
                <span className="font-mono text-lg font-bold text-amber-400">
                  {formatPace(marathonPaceSec)}
                </span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className="text-stone-400 text-[11px] self-center">Popular Goals:</span>
              {[
                { h: 3, m: 30, label: '3:30 (4:59/km)' },
                { h: 3, m: 45, label: '3:45 (5:20/km)' },
                { h: 3, m: 59, label: '3:59 (5:40/km - Current Plan)' },
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
                  className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors ${
                    hours === p.h && minutes === p.m
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                      : 'bg-stone-900 border-stone-700 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calibrated Training Zones */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              Calculated Workout Zones for {hours}h {minutes.toString().padStart(2, '0')}m
            </h3>
            <div className="space-y-2.5">
              {zones.map((z) => (
                <div
                  key={z.name}
                  className="p-3 rounded-xl bg-stone-800/60 border border-stone-700/50 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-white text-sm">{z.name}</div>
                    <div className="text-stone-400 text-[11px]">{z.description}</div>
                  </div>
                  <div className="font-mono text-sm font-bold text-amber-400 bg-black/40 px-3 py-1 rounded-lg border border-stone-700">
                    {formatPace(z.minPaceSec)}
                    {z.maxPaceSec !== z.minPaceSec && ` – ${formatPace(z.maxPaceSec)}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Split Checkpoints */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              Target Race Splits (Even Pace Strategy)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {splits.map((s) => {
                const checkpointSec = s.km * marathonPaceSec;
                return (
                  <div
                    key={s.label}
                    className="p-2.5 rounded-xl bg-stone-800/40 border border-stone-700/50 text-center"
                  >
                    <div className="text-[11px] text-stone-400">{s.label}</div>
                    <div className="font-mono font-bold text-sm text-emerald-400 mt-0.5">
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
