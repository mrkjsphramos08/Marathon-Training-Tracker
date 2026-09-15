import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  X,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Download,
  Link2,
  Sparkles,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { GoogleSheetSyncState, TrainingWeek } from '../types';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  syncState: GoogleSheetSyncState;
  onLogin: () => void;
  onLogout: () => void;
  onCreateSheet: (title: string) => Promise<void>;
  onSyncToSheet: () => Promise<void>;
  onLinkExistingSheet: (idOrUrl: string) => Promise<void>;
  onToggleAutoSync: (enabled: boolean) => void;
  onExportCsv: () => void;
  plan: TrainingWeek[];
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  user,
  syncState,
  onLogin,
  onLogout,
  onCreateSheet,
  onSyncToSheet,
  onLinkExistingSheet,
  onToggleAutoSync,
  onExportCsv,
  plan,
}) => {
  const [sheetTitle, setSheetTitle] = useState('18-Week Marathon Training Plan');
  const [existingInput, setExistingInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setStatusMessage('Creating formatted spreadsheet in your Google Drive...');
      await onCreateSheet(sheetTitle);
      setStatusMessage('Spreadsheet created and synced successfully!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create spreadsheet');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setStatusMessage('Syncing workout data with Google Sheets...');
      await onSyncToSheet();
      setStatusMessage('All 18 weeks synced successfully!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sync with spreadsheet');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingInput.trim()) return;
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setStatusMessage('Verifying spreadsheet access...');
      await onLinkExistingSheet(existingInput.trim());
      setStatusMessage('Spreadsheet linked successfully!');
      setExistingInput('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to link spreadsheet');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="google-sheets-modal-container"
        className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl text-stone-100"
      >
        {/* Header */}
        <div className="sticky top-0 bg-stone-900/95 backdrop-blur px-6 py-4 border-b border-stone-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Google Sheets Sync Hub
              </h2>
              <p className="text-xs text-stone-400">
                Sync your workouts, pacing, and mileage live
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
          {/* Account Card */}
          {user ? (
            <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full border border-stone-600"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <span>{user.displayName || 'Connected User'}</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xs text-stone-400">{user.email}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="px-2.5 py-1.5 rounded-lg bg-stone-700/60 hover:bg-stone-700 text-stone-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Sign out of Google"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-center space-y-3">
              <div className="text-sm text-stone-200">
                Connect your Google Account to automatically generate and synchronize your 18-week marathon spreadsheet in Google Drive.
              </div>
              <button
                id="btn-modal-signin"
                onClick={onLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-semibold text-sm flex items-center justify-center gap-2.5 shadow transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>
          )}

          {/* Feedback messages */}
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

          {/* Linked Spreadsheet Section */}
          {user && (
            <div className="space-y-4">
              {syncState.spreadsheetId ? (
                <div className="p-4 rounded-xl bg-stone-800/90 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Active Google Sheet
                    </span>
                    <a
                      href={syncState.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${syncState.spreadsheetId}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline"
                    >
                      <span>Open in Google Sheets</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="text-xs text-stone-300 font-mono break-all">
                    ID: {syncState.spreadsheetId}
                  </div>

                  {syncState.lastSyncedAt && (
                    <div className="text-[11px] text-stone-400">
                      Last synchronized: {new Date(syncState.lastSyncedAt).toLocaleString()}
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      id="btn-sync-action-now"
                      onClick={handleSync}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                      <span>{isProcessing ? 'Syncing...' : 'Push Updates Now'}</span>
                    </button>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300 select-none">
                      <input
                        type="checkbox"
                        checked={syncState.autoSync}
                        onChange={(e) => onToggleAutoSync(e.target.checked)}
                        className="w-4 h-4 rounded border-stone-600 bg-stone-800 text-emerald-500 focus:ring-emerald-400 focus:ring-offset-stone-900"
                      />
                      <span>Auto-sync when logging runs</span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-700/60 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-300">
                    Option 1: Create New Spreadsheet in Drive
                  </div>
                  <div>
                    <label className="block text-xs text-stone-400 mb-1">
                      Spreadsheet Title
                    </label>
                    <input
                      type="text"
                      value={sheetTitle}
                      onChange={(e) => setSheetTitle(e.target.value)}
                      placeholder="18-Week Marathon Training Plan"
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    id="btn-create-sheet-confirm"
                    onClick={handleCreate}
                    disabled={isProcessing}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isProcessing ? 'Creating Sheet...' : 'Create Formatted Google Sheet'}</span>
                  </button>
                  <p className="text-[11px] text-stone-400 text-center">
                    Includes both the 18-week schedule and Pacing & Golden Rules tabs with live formulas.
                  </p>
                </div>
              )}

              {/* Link existing sheet */}
              <div className="p-4 rounded-xl bg-stone-800/40 border border-stone-700/40 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-300">
                  Option 2: Connect Existing Google Sheet
                </div>
                <form onSubmit={handleLink} className="flex gap-2">
                  <input
                    type="text"
                    value={existingInput}
                    onChange={(e) => setExistingInput(e.target.value)}
                    placeholder="Paste Google Sheet URL or Spreadsheet ID"
                    className="flex-1 px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isProcessing || !existingInput.trim()}
                    className="px-4 py-2 rounded-xl bg-stone-700 hover:bg-stone-600 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Link</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Offline / CSV Export fallback */}
          <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
            <span className="text-stone-400">Offline Backup:</span>
            <button
              id="btn-export-csv"
              onClick={onExportCsv}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-stone-400" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
