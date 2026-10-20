import React from 'react';
import { X, Globe, Download, Upload, RotateCcw, Building2, LogIn, LogOut, Database, User as UserIcon } from 'lucide-react';
import { Language, AuthUser } from '../types';
import { translations } from '../utils/translations';
import { isSupabaseConfigured } from '../services/supabase';

interface MobileOptionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  user: AuthUser | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenSupabaseConfig: () => void;
  onToggleLanguage: () => void;
  onExportData: () => void;
  onImportData: () => void;
  onResetData: () => void;
}

export const MobileOptionsSheet: React.FC<MobileOptionsSheetProps> = ({
  isOpen,
  onClose,
  language,
  user,
  onOpenAuth,
  onSignOut,
  onOpenSupabaseConfig,
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
        className="w-full bg-white rounded-t-3xl p-5 pb-8 shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto"
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
                {isSupabaseConfigured 
                  ? (language === 'ar' ? '🟢 متصل بسحابة Supabase' : '🟢 Supabase Cloud Live')
                  : (language === 'ar' ? '📱 وضع الحساب المحلي الآمن' : '📱 Secure Local Storage Mode')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Account Section */}
        <div className="mb-4">
          {user ? (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(user.name || user.email || 'U')[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {user.name || 'User'}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'خروج' : 'Logout'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenAuth();
                onClose();
              }}
              className="w-full min-h-[48px] flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{language === 'ar' ? 'تسجيل الدخول / إنشاء حساب جديد' : 'Sign In / Create Account'}</span>
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {/* Supabase Connection Settings */}
          <button
            onClick={() => {
              onClose();
              onOpenSupabaseConfig();
            }}
            className="w-full min-h-[48px] flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>{language === 'ar' ? 'إعدادات ربط Supabase ومخطط SQL' : 'Supabase Settings & SQL Schema'}</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isSupabaseConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
            }`}>
              {isSupabaseConfigured 
                ? (language === 'ar' ? 'متصل' : 'Connected') 
                : (language === 'ar' ? 'ربط السحابة' : 'Connect Cloud')}
            </span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => {
              onToggleLanguage();
              onClose();
            }}
            className="w-full min-h-[48px] flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>{language === 'ar' ? 'تغيير اللغة إلى English' : 'Switch Language to العربية'}</span>
            </div>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
              {t.languageToggle}
            </span>
          </button>

          {/* Export & Import Backup (Only available when signed in) */}
          {user && (
            <>
              <button
                onClick={() => {
                  onExportData();
                  onClose();
                }}
                className="w-full min-h-[48px] flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>{t.exportBackup}</span>
              </button>

              <button
                onClick={() => {
                  onImportData();
                  onClose();
                }}
                className="w-full min-h-[48px] flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-slate-600" />
                <span>{t.importBackup}</span>
              </button>
            </>
          )}

          {/* Reset Data */}
          <button
            onClick={() => {
              onResetData();
              onClose();
            }}
            className="w-full min-h-[48px] flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-rose-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>{t.resetData}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
