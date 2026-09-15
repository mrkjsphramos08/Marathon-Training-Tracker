import React, { useState } from 'react';
import {
  X,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { TrainingWeek } from '../types';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: TrainingWeek[];
  onExportCsv: () => void;
  onExportJson: () => void;
  onImportJson: (importedPlan: TrainingWeek[]) => void;
  onResetToDefault: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  plan,
  onExportCsv,
  onExportJson,
  onImportJson,
  onResetToDefault,
}) => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (Array.isArray(parsed) && parsed.length === 18 && parsed[0].weekNumber === 1) {
          onImportJson(parsed);
          setStatusMessage('Training plan restored successfully!');
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
    if (window.confirm('Are you sure you want to reset all logged runs to the original plan? This will clear your custom logged data.')) {
      onResetToDefault();
      setStatusMessage('Plan successfully reset to original 18-week schedule.');
      setErrorMessage(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="backup-modal-container"
        className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl text-stone-100"
      >
        {/* Header */}
        <div className="sticky top-0 bg-stone-900/95 backdrop-blur px-6 py-4 border-b border-stone-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Data Backup & Export
              </h2>
              <p className="text-xs text-stone-400">
                100% private & saved directly in your browser
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

        {/* Body */}
        <div className="p-6 space-y-6">
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

          {/* Export section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Export Your Training Data
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onExportCsv}
                className="p-4 rounded-xl bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-left transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Download CSV</span>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-xs text-stone-400">
                  Spreadsheet format with all 18 weeks, pacing zones, and notes.
                </p>
              </button>

              <button
                type="button"
                onClick={onExportJson}
                className="p-4 rounded-xl bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-left transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Backup JSON</span>
                  <Download className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-xs text-stone-400">
                  Full backup file to restore your progress on any device or browser.
                </p>
              </button>
            </div>
          </div>

          {/* Import section */}
          <div className="space-y-3 pt-4 border-t border-stone-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Restore from Backup
            </h3>
            <label className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-stone-700 hover:border-emerald-500/50 bg-stone-800/30 hover:bg-stone-800/60 cursor-pointer transition-colors text-center">
              <Upload className="w-6 h-6 text-stone-400 mb-2" />
              <span className="text-xs font-semibold text-stone-200">
                Click to upload backup JSON file
              </span>
              <span className="text-[11px] text-stone-500 mt-1">
                Restores all 18 weeks and your logged workouts
              </span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset section */}
          <div className="pt-4 border-t border-stone-800 flex items-center justify-between text-xs">
            <div>
              <div className="font-medium text-stone-300">Reset Training Plan</div>
              <div className="text-[11px] text-stone-500">Restore the default 18-week schedule</div>
            </div>
            <button
              type="button"
              onClick={handleConfirmReset}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
