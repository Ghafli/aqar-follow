import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, CheckCircle, ArrowRight, ArrowLeft, ShieldCheck, Database, Smartphone } from 'lucide-react';
import { Language, AuthUser } from '../types';
import { signInWithEmail, signUpWithEmail, isSupabaseConfigured } from '../services/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onAuthSuccess: (user: AuthUser) => void;
  onOpenSupabaseConfig?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  language,
  onAuthSuccess,
  onOpenSupabaseConfig,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter email and password');
      return;
    }

    if (password.length < 6) {
      setErrorMsg(language === 'ar' ? 'كلمة المرور يجب أن لا تقل عن 6 أحرف' : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await signInWithEmail(cleanEmail, password);
        setLoading(false);
        if (res.error) {
          setErrorMsg(res.error);
        } else if (res.user) {
          onAuthSuccess(res.user);
          onClose();
        }
      } else {
        const res = await signUpWithEmail(cleanEmail, password, fullName);
        setLoading(false);
        if (res.error) {
          setErrorMsg(res.error);
        } else if (res.needsEmailConfirmation) {
          setInfoMsg(
            language === 'ar' 
              ? 'تم إنشاء الحساب بنجاح! يرجى مراجعة بريدك الإلكتروني لتأكيد التسجيل أو تسجيل الدخول مباشرة.' 
              : 'Account created! Please check your email to confirm registration or sign in directly.'
          );
        } else if (res.user) {
          onAuthSuccess(res.user);
          onClose();
        }
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(
        language === 'ar'
          ? 'حدث خطأ أثناء محاولة تسجيل الدخول. يرجى المحاولة مرة أخرى.'
          : 'An unexpected error occurred. Please try again.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-0 sm:my-8 animate-in slide-in-from-bottom sm:slide-in-from-none duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {mode === 'signin' 
                ? (language === 'ar' ? 'تسجيل الدخول' : 'Sign In') 
                : (language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account')}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isSupabaseConfigured ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                  <Database className="w-3 h-3 text-emerald-600 shrink-0" />
                  {language === 'ar' ? 'المزامنة السحابية (Supabase Live)' : 'Cloud Sync (Supabase Live)'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                  <Smartphone className="w-3 h-3 text-emerald-600 shrink-0" />
                  {language === 'ar' ? 'حساب محلي آمن (يعمل بدون إنترنت)' : 'Secure Local Account (Offline Ready)'}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Local Mode Informational Notice (if Supabase is not connected) */}
        {!isSupabaseConfigured && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-[11px] leading-relaxed">
              <span>
                {language === 'ar'
                  ? 'يمكنك تسجيل الدخول أو إنشاء حساب محلي فوراً على هاتفك. بياناتك محفوظة بأمان.'
                  : 'You can sign in or create an account right now. Your data is saved locally on your device.'}
              </span>
              {onOpenSupabaseConfig && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSupabaseConfig();
                  }}
                  className="block mt-1 font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  {language === 'ar' ? 'هل تود ربط قاعدة بيانات Supabase سحابية؟ اضغط هنا' : 'Want to connect a Supabase cloud database? Click here'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Error & Info Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5 leading-relaxed">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute inset-y-0 start-3 my-auto pointer-events-none" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: عبدالعزيز السعد' : 'e.g. John Doe'}
                    className="w-full ps-9 pe-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute inset-y-0 start-3 my-auto pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  dir="ltr"
                  className="w-full ps-9 pe-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute inset-y-0 start-3 my-auto pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  className="w-full ps-9 pe-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {language === 'ar' ? '6 أحرف على الأقل' : 'At least 6 characters'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[46px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-2"
            >
              <span>
                {loading
                  ? (language === 'ar' ? 'جاري المعالجة...' : 'Processing...')
                  : mode === 'signin'
                  ? (language === 'ar' ? 'تسجيل الدخول' : 'Sign In')
                  : (language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account')}
              </span>
              {language === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Toggle between Sign In and Sign Up */}
          <div className="pt-2 text-center text-xs text-slate-500">
            {mode === 'signin' ? (
              <p>
                {language === 'ar' ? 'ليس لديك حساب بعد؟' : "Don't have an account yet?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                    setInfoMsg(null);
                  }}
                  className="font-bold text-emerald-700 hover:text-emerald-800 underline ms-1 cursor-pointer"
                >
                  {language === 'ar' ? 'إنشاء حساب جديد' : 'Register here'}
                </button>
              </p>
            ) : (
              <p>
                {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                    setInfoMsg(null);
                  }}
                  className="font-bold text-emerald-700 hover:text-emerald-800 underline ms-1 cursor-pointer"
                >
                  {language === 'ar' ? 'تسجيل الدخول' : 'Sign in here'}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
