import React, { useState } from 'react';
import { Database, Download, Upload, Check, AlertTriangle, RefreshCw, FileText } from 'lucide-react';
import { api } from '../../services/api';

export const BackupManager: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleExportBackup = async () => {
    try {
      setDownloading(true);
      setErrorMsg('');
      setStatusMsg('');
      const token = localStorage.getItem('galaxy_admin_token');
      const res = await fetch('/api/admin/backup/export', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `galaxy_full_backup_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setStatusMsg('Complete JSON backup downloaded to your computer successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to download backup.');
    } finally {
      setDownloading(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('Warning: Restoring this backup will synchronize and overwrite current properties and website content in MongoDB. Do you want to proceed?')) {
      return;
    }

    try {
      setImporting(true);
      setErrorMsg('');
      setStatusMsg('');

      const text = await file.text();
      const json = JSON.parse(text);

      const res = await api.backup.import(json, true);
      if (res.success) {
        setStatusMsg('System restored and synchronized with MongoDB successfully! Please refresh your browser.');
      } else {
        setErrorMsg(res.message || 'Failed to restore backup.');
      }
    } catch (err: any) {
      setErrorMsg('Invalid backup file format or JSON parsing error.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#0B1F3A] font-display">
          System Backup & Recovery Center
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          One-click snapshot export and validated MongoDB recovery for zero data loss
        </p>
      </div>

      {statusMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Export Backup Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0B1F3A]">
              Export Full JSON Backup
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Downloads a snapshot containing all properties, content CMS, inquiries, and settings.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportBackup}
            disabled={downloading}
            className="w-full py-3 bg-[#0B1F3A] hover:bg-[#152e4d] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-[#D4A84F]" />
            <span>{downloading ? 'Generating Snapshot...' : 'Download Full JSON Backup'}</span>
          </button>
        </div>

        {/* Restore Backup Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0B1F3A]">
              Restore Database from File
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload a previously exported Galaxy Real Estate JSON backup file to synchronize with MongoDB.
            </p>
          </div>

          <label className="cursor-pointer w-full py-3 bg-amber-500 hover:bg-amber-600 text-[#0B1F3A] font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition text-center">
            <Upload className="w-4 h-4" />
            <span>{importing ? 'Restoring Database...' : 'Select JSON Backup File'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              disabled={importing}
              className="hidden"
            />
          </label>
        </div>

      </div>

    </div>
  );
};
