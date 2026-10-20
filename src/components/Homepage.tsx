import React from 'react';
import { Building2, ShieldCheck, Zap, Users, Bell, FileText, Lock, LogIn, Globe } from 'lucide-react';

interface HomepageProps {
  language: 'en' | 'ar';
  onOpenAuth: () => void;
  onGoogleSignIn: () => void;
  onToggleLanguage: () => void;
}

export const Homepage: React.FC<HomepageProps> = ({
  language,
  onOpenAuth,
  onGoogleSignIn,
  onToggleLanguage,
}) => {
  const isAr = language === 'ar';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 flex flex-col font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 flex-1 flex flex-col justify-center items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold mb-6 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>{isAr ? 'مدعوم بقاعدة بيانات Supabase السحابية وعزل تام للبيانات RLS' : 'Powered by Supabase Live Cloud & Zero Data Sharing RLS'}</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight max-w-4xl leading-[1.15]">
          {isAr ? 'نظام إدارة العقارات ومتابعة الإيجارات الذكي' : 'Smart Property & Rent Management System'}
          <span className="block text-emerald-600 mt-2">
            {isAr ? 'عقار فولو (AqarFollow)' : 'AqarFollow'}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {isAr
            ? 'تابع مستأجريك، مواعيد الإيجارات، تواريخ الدفعات، وأرسل تذكيرات واتساب بضغط زر واحدة. كل مستخدم له مساحة عمل سحابية خاصة مؤمنة بالكامل.'
            : 'Track tenants, lease agreements, payment schedules, and send WhatsApp reminders instantly. Each user enjoys a 100% private cloud workspace secured by Row Level Security.'}
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <LogIn className="w-5 h-5" />
            <span>{isAr ? 'تسجيل الدخول / إنشاء حساب مجاني' : 'Sign In / Register Free'}</span>
          </button>

          <button
            onClick={onGoogleSignIn}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{isAr ? 'المتابعة بحساب Google' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 font-bold">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {isAr ? 'إدارة المستأجرين والوحدات' : 'Tenant & Unit Management'}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isAr
                ? 'سجل تفاصيل المستأجر، أرقام الهواتف، الهوية، وحدات العقار، وتواريخ عقود الإيجار بكل سهولة.'
                : 'Organize tenant profiles, IDs, phone numbers, property units, and lease agreements effortlessly.'}
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 font-bold">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {isAr ? 'مواعيد الدفعات وتذكيرات واتساب' : 'Payment Schedules & WhatsApp'}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isAr
                ? 'تتبع الأقساط الشهرية أو الربع سنوية أو السنوية مع إرسال رسائل تذكير واتساب جاهزة ومخصصة.'
                : 'Track monthly, quarterly, or yearly payment installments and send instant customized WhatsApp reminders.'}
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 font-bold">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {isAr ? 'خصوصية كاملة وعزل بيانات' : '100% Private & Secure RLS'}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isAr
                ? 'بياناتك محفوظة بأمان في قاعدة بيانات سحابية خاصة بك وحدك، محمية تماماً بسياسات عزل الصفوف (RLS).'
                : 'Your data is stored securely in your own isolated partition, protected strictly by Row Level Security.'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} AqarFollow (عقار فولو). {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
      </footer>
    </div>
  );
};
