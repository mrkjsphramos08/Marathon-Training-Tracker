import React, { useState } from 'react';
import {
  X,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  FileDown,
  Sparkles,
  ClipboardPaste,
} from 'lucide-react';
import { TrainingWeek } from '../types';
import { parseCsvToPlan, generateSampleCsvTemplate } from '../utils/csvPlanParser';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: TrainingWeek[];
  onExportCsv: () => void;
  onExportJson: () => void;
  onImportJson: (importedPlan: TrainingWeek[]) => void;
  onImportCsv: (importedPlan: TrainingWeek[]) => void;
  onResetToDefault: () => void;
  onOpenPlanCreator: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  plan,
  onExportCsv,
  onExportJson,
  onImportJson,
  onImportCsv,
  onResetToDefault,
  onOpenPlanCreator,
}) => {
  const [activeTab, setActiveTab] = useState<'csv' | 'json' | 'export'>('csv');
  const [csvInputMode, setCsvInputMode] = useState<'paste' | 'upload'>('paste');
  const [pastedCsvText, setPastedCsvText] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCsvHelp, setShowCsvHelp] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  if (!isOpen) return null;

  const processCsvText = (text: string) => {
    try {
      const result = parseCsvToPlan(text);

      if (result.success && result.plan && result.plan.length > 0) {
        onImportCsv(result.plan);
        setStatusMessage(
          `Success! Loaded ${result.weeksCount} training weeks (${result.totalKm} km planned).`
        );
        setErrorMessage(null);
      } else {
        setErrorMessage(
          result.error ||
            'Could not parse training plan from CSV. Please ensure columns match the template.'
        );
        setStatusMessage(null);
      }
    } catch (err: any) {
      setErrorMessage('Failed to process CSV: ' + err.message);
      setStatusMessage(null);
    }
  };

  // Handle CSV file upload
  const handleCsvFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      processCsvText(text);
    };
    reader.readAsText(file);
  };

  const handleImportPasted = () => {
    if (!pastedCsvText.trim()) {
      setErrorMessage('Please paste your CSV text into the field below first.');
      return;
    }
    processCsvText(pastedCsvText);
  };

  // Download Sample CSV Template
  const handleDownloadSampleTemplate = () => {
    const templateContent = generateSampleCsvTemplate();
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Marathon_Training_Plan_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatusMessage('Sample CSV template downloaded! Open in Excel or Google Sheets to edit.');
  };

  // Handle JSON file upload
  const handleJsonFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].days) {
          onImportJson(parsed);
          setStatusMessage(`Training plan (${parsed.length} weeks) restored successfully!`);
          setErrorMessage(null);
        } else {
          setErrorMessage('Invalid file format. Please upload a valid marathon backup JSON file.');
          setStatusMessage(null);
        }
      } catch (err: any) {
        setErrorMessage('Failed to parse JSON file: ' + err.message);
        setStatusMessage(null);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmReset = () => {
    onResetToDefault();
    setShowResetConfirm(false);
    setStatusMessage('Plan successfully reset to original 18-week schedule.');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="backup-modal-container"
        className="bg-[#12161F] border border-white/[0.08] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#12161F]/95 backdrop-blur-md px-6 py-4 border-b border-white/[0.08] flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-400/10 text-emerald-400 flex items-center justify-center border border-emerald-400/20 shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Import, Export & Data Backup
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Load custom CSVs from Excel, export data, or generate plans
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

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 flex border-b border-white/[0.08] gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('csv')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'csv'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>CSV / Excel Import</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'json'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>JSON Backup / Restore</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 flex-1">
          {statusMessage && (
            <div className="p-3 rounded-xl bg-emerald-400/[0.08] border border-emerald-400/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/[0.08] border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: CSV / Excel Import */}
          {activeTab === 'csv' && (
            <div className="space-y-4">
              {/* Quick in-app builder shortcut banner */}
              <div className="p-3.5 rounded-xl bg-[#181E2A] border border-white/[0.08] flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Build a plan without a spreadsheet?</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Use our interactive in-app plan builder with auto-calculated pacing zones.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPlanCreator();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs shrink-0 transition-all active:scale-95"
                >
                  Create Plan
                </button>
              </div>

              {/* Step 1: Download Template */}
              <div className="p-4 rounded-xl bg-[#181E2A] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <FileDown className="w-4 h-4 text-emerald-400" />
                    1. Get the Blank CSV Template
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCsvHelp(!showCsvHelp)}
                    className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 font-mono transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showCsvHelp ? 'Hide format' : 'View format'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Download a pre-formatted template with all columns ready for Excel, Google Sheets, or Apple Numbers.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadSampleTemplate}
                  className="w-full py-2 px-3 rounded-lg bg-[#12161F] hover:bg-white/[0.06] text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors border border-white/[0.08]"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download Sample CSV Template (.csv)</span>
                </button>
              </div>

              {/* Format Help Info Box */}
              {showCsvHelp && (
                <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-[11px] text-slate-300 space-y-1.5 font-mono overflow-x-auto">
                  <div className="text-amber-400 font-sans font-semibold">Standard Header Layout:</div>
                  <div className="text-slate-400 text-[10px]">
                    Week, Phase, Date_Mon, Mon_Type, Mon_Km, Mon_Desc, Tue_Type, Tue_Km, Tue_Desc, ... Sun_Type, Sun_Km, Sun_Desc, Notes
                  </div>
                  <div className="text-slate-400 font-sans text-[11px] pt-1">
                    • <strong>Types</strong>: <code className="text-emerald-300">recovery</code>, <code className="text-sky-300">aerobic</code>, <code className="text-orange-300">quality</code>, <code className="text-amber-300">long_run</code>, <code className="text-teal-300">easy</code>, <code className="text-slate-400">rest</code>
                    <br />
                    • <strong>Km</strong>: Decimal or integer distance (e.g. 8, 12.5, 0 for rest)
                  </div>
                </div>
              )}

              {/* Step 2: Input Mode Switcher (Paste vs Upload) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    2. Import Your Custom Plan
                  </label>
                  <div className="flex items-center gap-1 bg-[#181E2A] p-0.5 rounded-lg border border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => setCsvInputMode('paste')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                        csvInputMode === 'paste'
                          ? 'bg-amber-400 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Paste CSV Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setCsvInputMode('upload')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                        csvInputMode === 'upload'
                          ? 'bg-amber-400 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Upload File (.csv)
                    </button>
                  </div>
                </div>

                {csvInputMode === 'paste' ? (
                  <div className="space-y-2">
                    <textarea
                      value={pastedCsvText}
                      onChange={(e) => setPastedCsvText(e.target.value)}
                      placeholder="Paste your CSV rows here (e.g. Week,Phase,Date_Mon,Mon_Type,Mon_Km,Mon_Desc...)..."
                      className="w-full h-36 p-3 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-xs text-slate-200 font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Directly paste rows copied from your spreadsheet or text editor
                      </span>
                      <button
                        type="button"
                        onClick={handleImportPasted}
                        className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <ClipboardPaste className="w-3.5 h-3.5" />
                        <span>Load Plan from Pasted CSV</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-white/[0.12] hover:border-amber-400/60 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors text-center">
                    <FileSpreadsheet className="w-7 h-7 text-amber-400 mb-2" />
                    <span className="text-xs font-semibold text-slate-200">
                      Click to browse or drop your CSV file here
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono mt-1">
                      Accepts .csv files exported from Excel or Google Sheets
                    </span>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleCsvFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Export Data */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Download Your Current Schedule & Progress
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onExportCsv}
                  className="p-4 rounded-xl bg-[#181E2A] hover:bg-white/[0.06] border border-white/[0.06] text-left transition-colors space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm">Download as CSV</span>
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Full spreadsheet format with all workouts, distances, and pacing notes.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={onExportJson}
                  className="p-4 rounded-xl bg-[#181E2A] hover:bg-white/[0.06] border border-white/[0.06] text-left transition-colors space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm">Download JSON Backup</span>
                    <Download className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Raw JSON backup file to restore logged runs across different devices.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: JSON Backup / Restore */}
          {activeTab === 'json' && (
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Restore from JSON Backup File
              </h3>
              <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-white/[0.12] hover:border-amber-400/60 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors text-center">
                <Upload className="w-7 h-7 text-amber-400 mb-2" />
                <span className="text-xs font-semibold text-slate-200">
                  Click to upload backup JSON file
                </span>
                <span className="text-[11px] text-slate-500 font-mono mt-1">
                  Restores entire schedule and your logged workout data
                </span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleJsonFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Reset section */}
          <div className="pt-4 border-t border-white/[0.08] text-xs">
            {showResetConfirm ? (
              <div className="p-3.5 rounded-xl bg-rose-500/[0.08] border border-rose-500/30 space-y-2">
                <div className="font-semibold text-rose-300">
                  Are you sure you want to reset your training schedule?
                </div>
                <p className="text-[11px] text-slate-300">
                  This will restore the original plan and clear any custom schedule or unsaved logs.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    id="btn-confirm-reset-yes"
                    type="button"
                    onClick={handleConfirmReset}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors"
                  >
                    Yes, Reset Schedule
                  </button>
                  <button
                    id="btn-confirm-reset-cancel"
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-300">Reset Training Plan</div>
                  <div className="text-[11px] text-slate-500 font-mono">Restore the default 21-week baseline</div>
                </div>
                <button
                  id="btn-trigger-reset"
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/[0.08] hover:bg-rose-500/[0.16] text-rose-300 border border-rose-500/30 transition-colors flex items-center gap-1.5 font-mono"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Default</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
