import React from 'react';
import { X, Globe, Download, Upload, RotateCcw, Building2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface MobileOptionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onToggleLanguage: () => void;
  onExportData: () => void;
  onImportData: () => void;
  onResetData: () => void;
}

export const MobileOptionsSheet: React.FC<MobileOptionsSheetProps> = ({
  isOpen,
  onClose,
  language,
  onToggleLanguage,
  onExportData,
  onImportData,
  onResetData,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs md:hidden">
      <div 
        className="w-full bg-white rounded-t-3xl p-5 pb-8 shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-none">{t.brandName}</h3>
              <span className="text-[10px] text-slate-500 font-medium">
                {import.meta.env.VITE_SUPABASE_URL ? '🟢 Supabase Cloud Live' : '💾 Local Storage Mode'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {/* Language Toggle */}
          <button
            onClick={() => {
              onToggleLanguage();
              onClose();
            }}
            className="w-full min-h-[48px] flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>{language === 'ar' ? 'تغيير اللغة إلى English' : 'Switch Language to العربية'}</span>
            </div>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
              {t.languageToggle}
            </span>
          </button>

          {/* Export Backup */}
          <button
            onClick={() => {
              onExportData();
              onClose();
            }}
            className="w-full min-h-[48px] flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>{t.exportBackup}</span>
          </button>

          {/* Import Backup */}
          <button
            onClick={() => {
              onImportData();
              onClose();
            }}
            className="w-full min-h-[48px] flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            <span>{t.importBackup}</span>
          </button>

          {/* Reset Data */}
          <button
            onClick={() => {
              onResetData();
              onClose();
            }}
            className="w-full min-h-[48px] flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-rose-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>{t.resetData}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
