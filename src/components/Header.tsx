import React from 'react';
import { Building2, Globe, Plus, Download, Upload, RotateCcw, LogIn, LogOut, Database, User as UserIcon } from 'lucide-react';
import { Language, AuthUser } from '../types';
import { translations } from '../utils/translations';
import { isSupabaseConfigured } from '../services/supabase';

interface HeaderProps {
  language: Language;
  user: AuthUser | null;
  onToggleLanguage: () => void;
  onOpenAddTenant: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenSupabaseConfig: () => void;
  onExportData: () => void;
  onImportData: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  user,
  onToggleLanguage,
  onOpenAddTenant,
  onOpenAuth,
  onSignOut,
  onOpenSupabaseConfig,
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

          {/* Zone 2: Auxiliary actions (Only available when signed in) */}
          {user && (
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
            </div>
          )}

          {/* Zone 3: Language Toggle, User Auth & Desktop Primary CTA Button */}
          <div className="flex items-center gap-2 shrink-0">


            {/* Language Toggle */}
            <button
              onClick={onToggleLanguage}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors active:scale-95 cursor-pointer"
              aria-label={t.languageLabel}
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>{t.languageToggle}</span>
            </button>

            {/* User Auth Chip / Button */}
            {user ? (
              <div className="flex items-center gap-1.5 p-1 ps-2 bg-slate-100/90 rounded-xl border border-slate-200/80">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold overflow-hidden shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(user.name || user.email || 'U')[0].toUpperCase()}</span>
                  )}
                </div>
                <span className="text-xs font-semibold text-slate-800 max-w-[100px] sm:max-w-[130px] truncate hidden sm:inline">
                  {user.name || user.email}
                </span>
                <button
                  onClick={onSignOut}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                  title={language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-3 h-10 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span className="truncate">{language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
              </button>
            )}

            {/* Desktop Add Tenant Button */}
            <button
              onClick={onOpenAddTenant}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 active:bg-slate-950 shadow-sm transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>{t.addTenant}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
