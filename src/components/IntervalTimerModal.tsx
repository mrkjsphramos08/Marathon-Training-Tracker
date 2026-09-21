import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, Timer, ChevronRight } from 'lucide-react';

interface IntervalTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetTitle?: string;
}

export const IntervalTimerModal: React.FC<IntervalTimerModalProps> = ({
  isOpen,
  onClose,
  presetTitle,
}) => {
  const [workSeconds, setWorkSeconds] = useState<number>(116); // e.g. 400m @ 4:50/km is ~1m 56s
  const [restSeconds, setRestSeconds] = useState<number>(85); // 200m jog @ 7:00/km is ~84s
  const [totalSets, setTotalSets] = useState<number>(6);
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [phase, setPhase] = useState<'work' | 'rest' | 'finished'>('work');
  const [timeLeft, setTimeLeft] = useState<number>(116);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play beep sound with Web Audio API
  const playBeep = (freq = 880, duration = 0.15) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // audio error ignored
    }
  };

  // Timer Tick effect
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 4 && prev > 1) {
            playBeep(440, 0.08); // countdown tick
          } else if (prev === 1) {
            playBeep(880, 0.3); // change phase horn
          }
          return prev - 1;
        });
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      if (phase === 'work') {
        if (currentSet < totalSets) {
          setPhase('rest');
          setTimeLeft(restSeconds);
        } else {
          setPhase('finished');
          setIsActive(false);
        }
      } else if (phase === 'rest') {
        setCurrentSet((prev) => prev + 1);
        setPhase('work');
        setTimeLeft(workSeconds);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, phase, currentSet, totalSets, workSeconds, restSeconds]);

  if (!isOpen) return null;

  const handleReset = () => {
    setIsActive(false);
    setPhase('work');
    setCurrentSet(1);
    setTimeLeft(workSeconds);
  };

  const applyPreset = (workSec: number, restSec: number, sets: number) => {
    setIsActive(false);
    setWorkSeconds(workSec);
    setRestSeconds(restSec);
    setTotalSets(sets);
    setCurrentSet(1);
    setPhase('work');
    setTimeLeft(workSec);
  };

  const formatMinSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="interval-timer-container"
        className="bg-[#12161F] border border-white/[0.08] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100"
      >
        {/* Header */}
        <div className="bg-[#12161F] px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Quality Interval Timer
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Track intervals & recovery floats
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              title={soundEnabled ? 'Mute sound' : 'Enable sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timer Display */}
        <div className="p-6 text-center space-y-5">
          {/* Phase Badge */}
          <div className="flex items-center justify-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest border transition-colors ${
                phase === 'work'
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  : phase === 'rest'
                  ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                  : 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30'
              }`}
            >
              {phase === 'work' ? '🔥 WORK INTERVAL' : phase === 'rest' ? '🧊 RECOVERY JOG' : '🎉 WORKOUT COMPLETED!'}
            </span>

            <span className="text-xs font-mono text-slate-400">
              Rep {currentSet} of {totalSets}
            </span>
          </div>

          {/* Big Digital Countdown */}
          <div className="py-3">
            <div className="text-7xl sm:text-8xl font-mono font-extrabold tracking-tight text-white drop-shadow tabular-nums">
              {formatMinSec(timeLeft)}
            </div>
          </div>

          {/* Play/Pause Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              id="btn-timer-reset"
              onClick={handleReset}
              className="p-3 rounded-xl bg-[#181E2A] hover:bg-white/[0.06] text-slate-300 border border-white/[0.06] transition-colors"
              title="Reset timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              id="btn-timer-toggle"
              onClick={() => setIsActive(!isActive)}
              className={`px-8 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
                isActive
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                  : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Rep</span>
                </>
              )}
            </button>
          </div>

          {/* Presets Grid */}
          <div className="pt-5 border-t border-white/[0.08] text-left">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              Plan Presets
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => applyPreset(116, 84, 6)}
                className="p-2.5 rounded-xl bg-[#181E2A] hover:bg-white/[0.06] border border-white/[0.06] text-left transition-colors"
              >
                <div className="font-semibold text-white">6x400m Reps</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">1:56 Work · 1:24 Recovery</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(240, 84, 6)}
                className="p-2.5 rounded-xl bg-[#181E2A] hover:bg-white/[0.06] border border-white/[0.06] text-left transition-colors"
              >
                <div className="font-semibold text-white">6x800m Reps</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">4:00 Work · 1:24 Recovery</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(305, 84, 5)}
                className="p-2.5 rounded-xl bg-[#181E2A] hover:bg-white/[0.06] border border-white/[0.06] text-left transition-colors"
              >
                <div className="font-semibold text-white">5x1km Reps</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">5:05 Work · 1:24 Recovery</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(496, 168, 4)}
                className="p-2.5 rounded-xl bg-[#181E2A] hover:bg-white/[0.06] border border-white/[0.06] text-left transition-colors"
              >
                <div className="font-semibold text-white">4x1.6km Reps</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">8:16 Work · 2:48 Recovery</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
