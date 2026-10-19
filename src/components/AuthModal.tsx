import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Language, AuthUser } from '../types';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, isSupabaseConfigured } from '../services/supabase';

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

    if (!email.trim() || !password) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter email and password');
      return;
    }

    if (password.length < 6) {
      setErrorMsg(language === 'ar' ? 'كلمة المرور يجب أن لا تقل عن 6 أحرف' : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    if (mode === 'signin') {
      const res = await signInWithEmail(email, password);
      setLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.user) {
        onAuthSuccess(res.user);
        onClose();
      }
    } else {
      const res = await signUpWithEmail(email, password, fullName);
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
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    const res = await signInWithGoogle();
    if (res.error) {
      setLoading(false);
      setErrorMsg(res.error);
    }
    // Google OAuth redirects the browser
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
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ar' 
                ? 'بيانات المستأجرين خاصة بك ومشفرة في Supabase' 
                : 'Your tenant data is private and secured on Supabase'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Missing Supabase Keys Notice */}
        {!isSupabaseConfigured && (
          <div className="m-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">
                  {language === 'ar' ? 'مفاتيح Supabase غير مفعلة' : 'Supabase keys not configured'}
                </p>
                <p className="text-[11px] text-amber-700 mt-1">
                  {language === 'ar'
                    ? 'لتفعيل تسجيل الدخول وحفظ البيانات على السحابة، يرجى ربط Supabase.'
                    : 'To enable authentication and live database persistence, connect Supabase.'}
                </p>
              </div>
            </div>
            {onOpenSupabaseConfig && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSupabaseConfig();
                }}
                className="w-full py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition-colors cursor-pointer text-center"
              >
                {language === 'ar' ? 'ربط Supabase الآن (أدخل الرابط والمفتاح)' : 'Configure Supabase Now'}
              </button>
            )}
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || !isSupabaseConfigured}
            className="w-full min-h-[46px] flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-[0.98] text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {/* Google SVG Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {mode === 'signin' 
                ? (language === 'ar' ? 'المتابعة بحساب Google / Gmail' : 'Continue with Google')
                : (language === 'ar' ? 'التسجيل بحساب Google / Gmail' : 'Sign up with Google')}
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-slate-200" />
            <span className="px-3 text-[11px] text-slate-400 font-medium">
              {language === 'ar' ? 'أو عبر البريد الإلكتروني' : 'or with email'}
            </span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Error & Info Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
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
            </div>

            <button
              type="submit"
              disabled={loading || !isSupabaseConfigured}
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
