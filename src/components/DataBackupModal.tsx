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
import { USER_21_WEEK_CSV } from '../data/plan21WeekData';

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

  const handleLoad21WeekPreset = () => {
    setPastedCsvText(USER_21_WEEK_CSV);
    processCsvText(USER_21_WEEK_CSV);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="backup-modal-container"
        className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl text-stone-100 flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 bg-stone-900/95 backdrop-blur px-6 py-4 border-b border-stone-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Import, Export & Data Backup
              </h2>
              <p className="text-xs text-stone-400">
                Load custom CSVs from Excel, export data, or generate plans
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

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 flex border-b border-stone-800 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('csv')}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'csv'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>CSV / Excel Import</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'json'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>JSON Backup / Restore</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 flex-1">
          {statusMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: CSV / Excel Import */}
          {activeTab === 'csv' && (
            <div className="space-y-4">
              {/* Quick in-app builder shortcut banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-stone-800 to-stone-800 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Want to build a plan without a spreadsheet?</span>
                  </div>
                  <p className="text-[11px] text-stone-300">
                    Use our interactive in-app plan builder with auto-calculated pacing zones.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPlanCreator();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex-shrink-0 shadow transition-all"
                >
                  Create Plan
                </button>
              </div>

              {/* Step 1: Download Template */}
              <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileDown className="w-4 h-4 text-emerald-400" />
                    1. Get the Blank CSV Template
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCsvHelp(!showCsvHelp)}
                    className="text-[11px] text-stone-400 hover:text-emerald-400 flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showCsvHelp ? 'Hide format' : 'View format'}</span>
                  </button>
                </div>
                <p className="text-xs text-stone-400">
                  Download a pre-formatted template with all columns ready for Excel, Google Sheets, or Apple Numbers.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadSampleTemplate}
                  className="w-full py-2 px-3 rounded-lg bg-stone-700 hover:bg-stone-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-stone-600"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download Sample CSV Template (.csv)</span>
                </button>
              </div>

              {/* Format Help Info Box */}
              {showCsvHelp && (
                <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 text-[11px] text-stone-300 space-y-1.5 font-mono overflow-x-auto">
                  <div className="text-amber-400 font-sans font-bold">Standard Header Layout:</div>
                  <div className="text-stone-400 text-[10px]">
                    Week, Phase, Date_Mon, Mon_Type, Mon_Km, Mon_Desc, Tue_Type, Tue_Km, Tue_Desc, ... Sun_Type, Sun_Km, Sun_Desc, Notes
                  </div>
                  <div className="text-stone-400 font-sans text-[11px] pt-1">
                    • <strong>Types</strong>: <code className="text-emerald-300">recovery</code>, <code className="text-blue-300">aerobic</code>, <code className="text-orange-300">quality</code>, <code className="text-amber-300">long_run</code>, <code className="text-cyan-300">easy</code>, <code className="text-stone-400">rest</code>
                    <br />
                    • <strong>Km</strong>: Decimal or integer distance (e.g. 8, 12.5, 0 for rest)
                  </div>
                </div>
              )}

              {/* Preset Quick Loader for 21-Week Plan */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>21-Week Custom Marathon Plan (Sep 21, 2026 – Feb 14, 2027)</span>
                  </div>
                  <p className="text-[11px] text-stone-300">
                    21 weeks · 1,048 km total · Includes all specific workouts, subtypes, and detailed workout descriptions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLoad21WeekPreset}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs flex-shrink-0 shadow transition-all flex items-center justify-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Load 21-Week Plan</span>
                </button>
              </div>

              {/* Step 2: Input Mode Switcher (Paste vs Upload) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    2. Import Your Custom Plan
                  </label>
                  <div className="flex items-center gap-1 bg-stone-800 p-0.5 rounded-lg border border-stone-700">
                    <button
                      type="button"
                      onClick={() => setCsvInputMode('paste')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                        csvInputMode === 'paste'
                          ? 'bg-emerald-500 text-stone-950'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Paste CSV Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setCsvInputMode('upload')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                        csvInputMode === 'upload'
                          ? 'bg-emerald-500 text-stone-950'
                          : 'text-stone-400 hover:text-stone-200'
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
                      className="w-full h-36 p-3 rounded-xl bg-stone-950 border border-stone-700 text-xs text-stone-200 font-mono placeholder:text-stone-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-stone-500">
                        Directly paste rows copied from your spreadsheet or text editor
                      </span>
                      <button
                        type="button"
                        onClick={handleImportPasted}
                        className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow"
                      >
                        <ClipboardPaste className="w-3.5 h-3.5" />
                        <span>Load Plan from Pasted CSV</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-stone-700 hover:border-emerald-500/60 bg-stone-800/30 hover:bg-stone-800/60 cursor-pointer transition-colors text-center">
                    <FileSpreadsheet className="w-7 h-7 text-emerald-400 mb-2" />
                    <span className="text-xs font-semibold text-stone-200">
                      Click to browse or drop your CSV file here
                    </span>
                    <span className="text-[11px] text-stone-500 mt-1">
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Download Your Current Schedule & Progress
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onExportCsv}
                  className="p-4 rounded-xl bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-left transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Download as CSV</span>
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-xs text-stone-400">
                    Full spreadsheet format with all workouts, distances, and pacing notes.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={onExportJson}
                  className="p-4 rounded-xl bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-left transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Download JSON Backup</span>
                    <Download className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-xs text-stone-400">
                    Raw JSON backup file to restore logged runs across different browsers.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: JSON Backup / Restore */}
          {activeTab === 'json' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Restore from JSON Backup File
              </h3>
              <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-stone-700 hover:border-amber-500/60 bg-stone-800/30 hover:bg-stone-800/60 cursor-pointer transition-colors text-center">
                <Upload className="w-7 h-7 text-amber-400 mb-2" />
                <span className="text-xs font-semibold text-stone-200">
                  Click to upload backup JSON file
                </span>
                <span className="text-[11px] text-stone-500 mt-1">
                  Restores entire schedule and your logged run data
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
          <div className="pt-4 border-t border-stone-800 text-xs">
            {showResetConfirm ? (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                <div className="font-semibold text-rose-300">
                  Are you sure you want to reset your training schedule?
                </div>
                <p className="text-[11px] text-stone-300">
                  This will restore the original 18-week plan and clear any custom schedule or unsaved logs.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    id="btn-confirm-reset-yes"
                    type="button"
                    onClick={handleConfirmReset}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                  >
                    Yes, Reset Schedule
                  </button>
                  <button
                    id="btn-confirm-reset-cancel"
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-stone-300">Reset Training Plan</div>
                  <div className="text-[11px] text-stone-500">Restore the default 18-week schedule</div>
                </div>
                <button
                  id="btn-trigger-reset"
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors flex items-center gap-1.5"
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
