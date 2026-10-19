import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Check, 
  Copy, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound, 
  RefreshCw, 
  ShieldCheck, 
  Trash2,
  Code
} from 'lucide-react';
import { Language } from '../types';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  testSupabaseConnection, 
  isSupabaseConfigured,
  SUPABASE_SQL_SETUP 
} from '../services/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; tableReady?: boolean } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'connection' | 'sql' | 'guide'>('connection');

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testSupabaseConnection(url, anonKey);
    setIsTesting(false);
    setTestResult(result);
  };

  const handleSave = () => {
    if (!url.trim() || !anonKey.trim()) {
      alert(language === 'ar' ? 'يرجى إدخال رابط المشروع والمفتاح العام' : 'Please provide Supabase URL and Anon Key');
      return;
    }
    saveSupabaseConfig(url, anonKey);
  };

  const handleClear = () => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من مسح بيانات الربط؟' : 'Clear saved Supabase configuration?')) {
      clearSupabaseConfig();
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {language === 'ar' ? 'ربط قاعدة بيانات Supabase' : 'Supabase Live Database Connection'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  isSupabaseConfigured 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-600' : 'bg-amber-500'}`} />
                  {isSupabaseConfigured 
                    ? (language === 'ar' ? 'متصل بقاعدة البيانات' : 'Connected')
                    : (language === 'ar' ? 'غير متصل (مطلوب الربط)' : 'Not Connected')}
                </span>
                {currentConfig.isFromEnv && (
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                    ENV (Cloudflare/Vite)
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('connection')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'connection'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {language === 'ar' ? 'بيانات الاتصال' : 'Connection Keys'}
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'مخطط SQL (RLS)' : 'SQL Schema (RLS)'}</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {language === 'ar' ? 'دليل الإعداد' : 'Setup Guide'}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'connection' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'ar'
                  ? 'قم بإدخال بيانات مشروعك في Supabase للاتصال المباشر. يتم حفظ المفاتيح بأمان في المتصفح وتستخدم مباشرة للاتصال بقاعدتك السحابية.'
                  : 'Enter your Supabase project credentials for live syncing. Credentials are saved securely and connect directly to your database.'}
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'رابط المشروع (Project URL)' : 'Project URL'}
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {language === 'ar'
                    ? 'تجد الرابط في: Supabase Dashboard -> Project Settings -> API -> Project URL'
                    : 'Found at: Supabase Dashboard -> Project Settings -> API -> Project URL'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'المفتاح العام (anon / public key)' : 'Anon Public API Key'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute inset-y-0 start-3 my-auto pointer-events-none" />
                  <textarea
                    rows={2}
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    dir="ltr"
                    className="w-full ps-9 pe-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {language === 'ar'
                    ? 'استخدم المفتاح العام (anon public) وليس مفتاح service_role للحفاظ على أمان تطبيقك.'
                    : 'Use the anon public key (NOT service_role) to protect your application.'}
                </span>
              </div>

              {/* Test Status Banner */}
              {testResult && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold">{testResult.message}</p>
                    {testResult.tableReady === false && (
                      <button
                        onClick={() => setActiveTab('sql')}
                        className="mt-1 text-emerald-700 underline font-bold cursor-pointer"
                      >
                        {language === 'ar' ? 'اضغط هنا لنسخ كود SQL وإنشاء الجدول في Supabase' : 'Click here to copy the SQL script'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !url || !anonKey}
                  className="w-full sm:flex-1 min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? (language === 'ar' ? 'جاري الفحص...' : 'Testing...') : (language === 'ar' ? 'فحص الاتصال' : 'Test Connection')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!url || !anonKey}
                  className="w-full sm:flex-1 min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'ar' ? 'حفظ وتفعيل الاتصال المباشر' : 'Save & Connect Live'}</span>
                </button>
              </div>

              {!currentConfig.isFromEnv && currentConfig.url && (
                <div className="pt-2 text-end">
                  <button
                    onClick={handleClear}
                    className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{language === 'ar' ? 'مسح البيانات المحفوظة' : 'Clear stored credentials'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">
                    {language === 'ar' ? 'كود إعداد الجدول وسياسات العزل (RLS)' : 'PostgreSQL Schema & Security Policies'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ar'
                      ? 'انسخ هذا الكود والصقه في Supabase SQL Editor لتفعيل حماية بيانات كل مستخدم على حدة.'
                      : 'Copy and paste into your Supabase SQL Editor to enforce per-user isolation.'}
                  </p>
                </div>
                <button
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? (language === 'ar' ? 'تم النسخ!' : 'Copied!') : (language === 'ar' ? 'نسخ كود SQL' : 'Copy SQL')}</span>
                </button>
              </div>

              <div className="relative rounded-xl bg-slate-950 p-4 overflow-x-auto text-emerald-400 font-mono text-[11px] leading-relaxed max-h-[300px] border border-slate-800" dir="ltr">
                <pre>{SUPABASE_SQL_SETUP}</pre>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  {language === 'ar'
                    ? 'سياسة RLS تضمن تلقائياً أن كل مستخدم يسجل دخوله ببريده أو عبر Gmail يرى ويعدل فقط عقاراته ومستأجريه ولا يشاركها مع أي حساب آخر.'
                    : 'Row Level Security ensures that each user signing in via Email or Google sees only their own tenants and records.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-600">
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">
                      {language === 'ar' ? 'إنشاء مشروع في Supabase' : 'Create Supabase Project'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {language === 'ar' ? 'توجه إلى supabase.com وأنشئ مشروعاً مجانياً جديداً.' : 'Go to supabase.com and create a free project.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">
                      {language === 'ar' ? 'تشغيل كود SQL' : 'Run SQL Schema'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {language === 'ar' 
                        ? 'في لوحة Supabase، افتح SQL Editor، الصق الكود من تبويب "مخطط SQL"، ثم اضغط Run.' 
                        : 'Open SQL Editor in Supabase, paste the schema from the SQL Schema tab, and click Run.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">
                      {language === 'ar' ? 'تفعيل تسجيل الدخول عبر Google / Gmail' : 'Enable Google OAuth'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {language === 'ar'
                        ? 'في Supabase، اذهب إلى Authentication -> Providers -> Google، قم بتفعيله وضع Client ID و Secret من Google Cloud.'
                        : 'Go to Authentication -> Providers -> Google, enable it, and paste your Google OAuth Client ID & Secret.'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {language === 'ar'
                        ? 'أضف رابط موقعك على Cloudflare Pages في Authentication -> URL Configuration -> Redirect URLs.'
                        : 'Add your Cloudflare Pages URL to Authentication -> URL Configuration -> Redirect URLs.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">
                      {language === 'ar' ? 'الربط في Cloudflare Pages' : 'Configure Cloudflare Pages'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {language === 'ar'
                        ? 'في Cloudflare Dashboard -> Pages -> اسم المشروع -> Settings -> Environment Variables، يمكنك إضافة المتغيرات VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY لإتاحتها دائماً، أو حفظها عبر هذه النافذة مباشرة.'
                        : 'In Cloudflare Dashboard -> Pages -> Settings -> Environment Variables, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, or simply save them via this modal.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            <span>{language === 'ar' ? 'فتح لوحة تحكم Supabase' : 'Open Supabase Dashboard'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
