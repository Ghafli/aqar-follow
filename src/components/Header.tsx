import React from 'react';
import { Building2, Globe, Plus, Download, Upload, RotateCcw } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface HeaderProps {
  language: Language;
  onToggleLanguage: () => void;
  onOpenAddTenant: () => void;
  onExportData: () => void;
  onImportData: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onToggleLanguage,
  onOpenAddTenant,
  onExportData,
  onImportData,
  onResetData,
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          {/* Zone 1: Single text element wordmark with icon */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-none">
                {t.brandName}
              </span>
              <span className="text-[11px] text-slate-500 font-normal mt-0.5 hidden sm:inline">
                {t.brandTagline}
              </span>
            </div>
          </div>

          {/* Zone 2: Auxiliary actions (Backup / Reset) - Desktop only */}
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-600">
            <button
              onClick={onExportData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              title={t.exportBackup}
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.exportBackup}</span>
            </button>
            <button
              onClick={onImportData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              title={t.importBackup}
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.importBackup}</span>
            </button>
            <button
              onClick={onResetData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              title={t.resetData}
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.resetData}</span>
            </button>
          </div>

          {/* Zone 3: Language Toggle & Desktop Primary CTA Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onToggleLanguage}
              className="inline-flex items-center justify-center gap-1.5 px-3 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors active:scale-95 cursor-pointer"
              aria-label={t.languageLabel}
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>{t.languageToggle}</span>
            </button>

            {/* Desktop Add Tenant Button (hidden on mobile, mobile has floating center tab) */}
            <button
              onClick={onOpenAddTenant}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 active:bg-emerald-800 shadow-sm transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addTenant}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
