import React from 'react';
import { X, Flame, ShieldAlert, Zap, Clock, Heart, CheckCircle } from 'lucide-react';
import { PACING_ZONES, GOLDEN_RULES } from '../data/marathonPlanData';

interface GoldenRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoldenRulesModal: React.FC<GoldenRulesModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="golden-rules-container"
        className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-stone-100"
      >
        {/* Header */}
        <div className="sticky top-0 bg-stone-900/95 backdrop-blur px-6 py-4 border-b border-stone-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Golden Rules for GMP Blocks
              </h2>
              <p className="text-xs text-stone-400">
                Crucial race-pace execution principles & daily pacing targets
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
          {/* Golden Rules Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">
              The 3 Non-Negotiable Marathon Rules
            </h3>
            {GOLDEN_RULES.map((rule) => (
              <div
                key={rule.id}
                className="p-4 rounded-xl bg-stone-800/80 border border-stone-700/60 flex items-start gap-3.5"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  {rule.id}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{rule.title}</h4>
                  <p className="text-xs text-stone-300 leading-relaxed mt-1">
                    {rule.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* The Run Details & Weekly Structure */}
          <div className="space-y-3 pt-2 border-t border-stone-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Weekly Run Intent & Pacing Logic
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PACING_ZONES.map((zone) => (
                <div
                  key={zone.name}
                  className="p-3.5 rounded-xl bg-stone-800/50 border border-stone-700/40 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{zone.name}</span>
                    <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-black/40 border border-stone-700">
                      {zone.paceRange}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400">
                    <strong className="text-stone-300 font-medium">Effort:</strong> {zone.effortRpe}
                  </div>
                  <p className="text-xs text-stone-300 leading-normal">
                    {zone.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Race Day Strategy Box */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-2">
            <div className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              Marathon Day Execution Checklist
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-stone-300">
              <li><strong>0–10 km:</strong> Relax into 5:40/km pace. It will feel deceptively easy — do NOT speed up.</li>
              <li><strong>10–30 km:</strong> Take 1 gel with water every 7-8 km (approx 40-45 mins). Keep cadence smooth.</li>
              <li><strong>30–35 km:</strong> Focus on arm swing and posture as muscular fatigue rises.</li>
              <li><strong>35–42.2 km:</strong> Dig deep, hold your form, and bring home the 18 weeks of dedicated training!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
