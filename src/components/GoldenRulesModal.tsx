import React from 'react';
import { X, Flame, Zap, ShieldAlert, Heart, CheckCircle2, Trophy, Clock } from 'lucide-react';

interface GoldenRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  planTitle?: string;
  goalPaceLabel?: string;
  eventName?: string;
  weeksCount?: number;
}

export const GoldenRulesModal: React.FC<GoldenRulesModalProps> = ({
  isOpen,
  onClose,
  planTitle = 'Marathon Training',
  goalPaceLabel = '5:40/km',
  eventName = 'Full Marathon (42.2k)',
  weeksCount = 18,
}) => {
  if (!isOpen) return null;

  // Extract base pace in seconds
  let basePaceSec = 340; // default 5:40
  const paceMatch = goalPaceLabel.match(/(\d+):(\d+)/);
  if (paceMatch) {
    basePaceSec = parseInt(paceMatch[1], 10) * 60 + parseInt(paceMatch[2], 10);
  }

  const formatPace = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.max(0, sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}/km`;
  };

  const targetPaceStr = formatPace(basePaceSec);
  const recoveryRange = `${formatPace(basePaceSec + 60)}–${formatPace(basePaceSec + 80)}`;
  const aerobicRange = `${formatPace(basePaceSec + 35)}–${formatPace(basePaceSec + 50)}`;
  const tempoRange = `${formatPace(basePaceSec - 25)}–${formatPace(basePaceSec - 15)}`;
  const intervalRange = `${formatPace(basePaceSec - 50)}–${formatPace(basePaceSec - 30)}`;

  const isHalf = eventName.toLowerCase().includes('half');
  const is10k = eventName.toLowerCase().includes('10k');
  const is5k = eventName.toLowerCase().includes('5k');
  const isFull = !isHalf && !is10k && !is5k;

  // Dynamic Pacing Zones
  const dynamicZones = [
    {
      name: 'Recovery Runs',
      paceRange: recoveryRange,
      effortRpe: 'RPE 3–4 (Very Easy)',
      description: 'Strict active recovery to flush metabolic waste and rebuild glycogen without soft-tissue breakdown.',
    },
    {
      name: 'Aerobic Base',
      paceRange: aerobicRange,
      effortRpe: 'RPE 5–6 (Conversational)',
      description: 'Core weekly aerobic mileage building capillary density, cardiac stroke volume, and lipid metabolism.',
    },
    {
      name: isFull ? 'Goal Marathon Pace (GMP)' : 'Target Race Pace',
      paceRange: targetPaceStr,
      effortRpe: 'RPE 6–7 (Controlled Hard)',
      description: `Specific race-day execution rhythm. Trains neuromuscular efficiency and teaches your body your exact race pace.`,
    },
    {
      name: 'Lactate Threshold / Tempo',
      paceRange: tempoRange,
      effortRpe: 'RPE 7–8 (Comfortably Hard)',
      description: 'Sustained sub-maximal efforts pushing your lactate clearing threshold and critical velocity.',
    },
    {
      name: 'VO2max Intervals',
      paceRange: intervalRange,
      effortRpe: 'RPE 8–9 (Hard / Sprint Finish)',
      description: 'High-aerobic repeats (400m–1200m) expanding maximum oxygen uptake and running economy.',
    },
  ];

  // Dynamic Rules based on Event
  const dynamicRules = isFull
    ? [
        {
          id: 1,
          title: `Never Run Faster Than ${targetPaceStr} Early`,
          content: `Even if the first 15 km feel effortless, banking seconds early creates exponential minute losses after 32 km due to early glycogen depletion. Respect your target pace!`,
        },
        {
          id: 2,
          title: 'Fueling & Glycogen Preservation',
          content: `Take 1 energy gel (30–50g carbs) with water every 40–45 mins during long runs. You cannot process carbs if you wait until you feel fatigued or hit the wall.`,
        },
        {
          id: 3,
          title: `Recovery Runs Must Be True Recovery (${recoveryRange})`,
          content: `Recovery runs should feel almost painfully slow. Running too fast on easy days diminishes your adaptation from Saturday quality sessions.`,
        },
      ]
    : isHalf
    ? [
        {
          id: 1,
          title: `Even / Negative Split Rhythm (${targetPaceStr})`,
          content: `In a half marathon, excessive early pacing floods your muscles with lactate before 10 km. Lock into ${targetPaceStr} during the first 5 km and surge in the final 5 km.`,
        },
        {
          id: 2,
          title: 'Mid-Race Hydration & Electrolytes',
          content: `Take 1 gel with water at km 8 and another at km 15. Keep electrolyte levels steady to maintain fast muscle contractions and prevent late calf spasms.`,
        },
        {
          id: 3,
          title: `Threshold Adaptations Over Raw Speed`,
          content: `The half marathon is won at lactate threshold (${tempoRange}). Prioritize tempo runs and keep easy days relaxed (${recoveryRange}) to stay injury-free.`,
        },
      ]
    : is10k
    ? [
        {
          id: 1,
          title: `Survive the First 2 Kilometers at ${targetPaceStr}`,
          content: `Adrenaline pushes runners 15–20s too fast in the opening kilometer. Hold back strictly at ${targetPaceStr} to prevent overwhelming lactate buildup.`,
        },
        {
          id: 2,
          title: 'Pre-Race Fueling & Warm-Up',
          content: `A 10K relies purely on your stored liver and muscle glycogen. Complete 15 minutes of easy jogging and 4x strides prior to gun time.`,
        },
        {
          id: 3,
          title: `Mental Tenacity at 6–8 km`,
          content: `The 6 to 8 km stretch is where pace tends to bleed. Focus on crisp arm carriage, cadence turnover, and deep rhythmic breathing.`,
        },
      ]
    : [
        {
          id: 1,
          title: `Controlled First 1,000m (${targetPaceStr})`,
          content: `A 5K is 95% aerobic. Sprinting the first 400m incurs an oxygen debt that cannot be cleared before the finish line. Run smart, not reckless.`,
        },
        {
          id: 2,
          title: 'Dynamic Warm-up & Strides Mandatory',
          content: `You start at maximum aerobic speed immediately. Ensure a full 15-minute warmup with running drills and progressive strides before lining up.`,
        },
        {
          id: 3,
          title: `Lactate Tolerance at KM 3 & 4`,
          content: `When the breathing gets heavy at the halfway mark, maintain fast cadence (175–185 spm) and drive through to unleash your final 500m kick.`,
        },
      ];

  // Dynamic Race Day Strategy
  const raceStrategy = isFull ? (
    <ul className="space-y-1.5 list-disc list-inside text-stone-300">
      <li><strong>0–10 km:</strong> Settle into {targetPaceStr}. It will feel deceptively easy with crowd energy — do NOT speed up.</li>
      <li><strong>10–30 km:</strong> Take 1 gel with water every 7–8 km (approx 40–45 mins). Keep cadence smooth and relaxed.</li>
      <li><strong>30–35 km:</strong> Focus on driving your arms, tall posture, and consistent breathing as leg fatigue rises.</li>
      <li><strong>35–42.2 km:</strong> Dig deep, maintain rhythm, and bring home the {weeksCount} weeks of structured training!</li>
    </ul>
  ) : isHalf ? (
    <ul className="space-y-1.5 list-disc list-inside text-stone-300">
      <li><strong>0–5 km:</strong> Find clean air and settle cleanly into {targetPaceStr}. Resist surging around early crowds.</li>
      <li><strong>5–15 km:</strong> Cruise control. Take your gel at km 8 and hydrate at water stations.</li>
      <li><strong>15–18 km:</strong> Increase focus; this is where races are decided. Lock your eyes on runners ahead.</li>
      <li><strong>18–21.1 km:</strong> Unleash your final kick and finish strong!</li>
    </ul>
  ) : is10k ? (
    <ul className="space-y-1.5 list-disc list-inside text-stone-300">
      <li><strong>0–2 km:</strong> Controlled aggression. Settle right onto {targetPaceStr}.</li>
      <li><strong>2–6 km:</strong> Rhythm and steady turnover. Breathe in 2:2 cadence.</li>
      <li><strong>6–8 km:</strong> Fight the mental dip; maintain cadence and knee drive.</li>
      <li><strong>8–10 km:</strong> Long sustained kick to the finish line!</li>
    </ul>
  ) : (
    <ul className="space-y-1.5 list-disc list-inside text-stone-300">
      <li><strong>0–1 km:</strong> Fast but composed start at {targetPaceStr}.</li>
      <li><strong>1–3 km:</strong> Settle into high-threshold pain cave; lock onto cadence.</li>
      <li><strong>3–4 km:</strong> Hold form, don't let lap times slip.</li>
      <li><strong>4–5 km:</strong> All-out progressive sprint into the finish funnel!</li>
    </ul>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="golden-rules-container"
        className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl text-stone-100"
      >
        {/* Header */}
        <div className="sticky top-0 bg-stone-900/95 backdrop-blur px-5 py-4 border-b border-stone-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight flex items-center gap-2">
                <span>Golden Rules for {eventName}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Target {targetPaceStr}
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Calibrated to your {weeksCount}-week plan & target race pace
              </p>
            </div>
          </div>
          <button
            id="btn-close-golden-rules"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Golden Rules Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>3 Non-Negotiable Rules for {eventName}</span>
            </h3>
            {dynamicRules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 flex items-start gap-3.5 shadow-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0 font-extrabold text-xs">
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

          {/* Dynamic Weekly Run Intent & Calibrated Zones */}
          <div className="space-y-3 pt-2 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Your Calibrated Pacing Zones</span>
              </h3>
              <span className="text-[11px] text-stone-400 font-mono">
                Goal Pace: <strong className="text-amber-300">{targetPaceStr}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dynamicZones.map((zone) => (
                <div
                  key={zone.name}
                  className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{zone.name}</span>
                    <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-black/50 border border-stone-700">
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

          {/* Dynamic Race Day Strategy Box */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2">
            <div className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>{eventName} Execution Plan</span>
            </div>
            {raceStrategy}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-800 flex items-center justify-end bg-stone-900/95">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 transition-colors"
          >
            Got it, Let's Train
          </button>
        </div>
      </div>
    </div>
  );
};
