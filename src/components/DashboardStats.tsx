import React from 'react';
import { AlertCircle, Clock, Users, CheckCircle2 } from 'lucide-react';
import { DashboardMetrics, Language, PaymentStatus } from '../types';
import { translations } from '../utils/translations';

interface DashboardStatsProps {
  metrics: DashboardMetrics;
  language: Language;
  activeStatusFilter: PaymentStatus | 'all';
  onSelectStatusFilter: (status: PaymentStatus | 'all') => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  metrics,
  language,
  activeStatusFilter,
  onSelectStatusFilter,
}) => {
  const t = translations[language];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
      {/* 1. Total Tenants */}
      <div
        onClick={() => onSelectStatusFilter('all')}
        className={`bg-white p-3.5 sm:p-5 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] ${
          activeStatusFilter === 'all'
            ? 'border-emerald-600 ring-1 ring-emerald-600/20 shadow-xs'
            : 'border-slate-200/80 hover:border-slate-300 shadow-2xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            {t.metrics.totalTenants}
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
            {metrics.totalTenants}
          </span>
          <span className="text-[11px] text-slate-400 truncate">
            {language === 'ar' ? 'مستأجر' : 'tenants'}
          </span>
        </div>
      </div>

      {/* 2. Overdue Payments */}
      <div
        onClick={() => onSelectStatusFilter('overdue')}
        className={`bg-white p-3.5 sm:p-5 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] ${
          activeStatusFilter === 'overdue'
            ? 'border-rose-600 ring-1 ring-rose-600/20 shadow-xs'
            : metrics.overdueCount > 0
            ? 'border-rose-200/80 hover:border-rose-300 shadow-2xs'
            : 'border-slate-200/80 hover:border-slate-300 shadow-2xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-rose-700 uppercase tracking-wider truncate">
            {t.metrics.overduePayments}
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-rose-700">
            {metrics.overdueCount}
          </span>
          <span className="text-[11px] text-rose-600/80 font-medium truncate">
            {metrics.overdueCount > 0
              ? language === 'ar' ? 'متأخر' : 'overdue'
              : language === 'ar' ? 'منتظم' : 'none'}
          </span>
        </div>
      </div>

      {/* 3. Payments Due This Week */}
      <div
        onClick={() => onSelectStatusFilter('due_soon')}
        className={`bg-white p-3.5 sm:p-5 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] ${
          activeStatusFilter === 'due_soon'
            ? 'border-amber-500 ring-1 ring-amber-500/20 shadow-xs'
            : metrics.dueSoonCount > 0
            ? 'border-amber-200/80 hover:border-amber-300 shadow-2xs'
            : 'border-slate-200/80 hover:border-slate-300 shadow-2xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-amber-700 uppercase tracking-wider truncate">
            {t.metrics.dueThisWeek}
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-amber-700">
            {metrics.dueSoonCount}
          </span>
          <span className="text-[11px] text-amber-600 font-medium truncate">
            {metrics.dueSoonCount > 0
              ? language === 'ar' ? 'قريباً' : 'soon'
              : language === 'ar' ? 'لا يوجد' : 'none'}
          </span>
        </div>
      </div>

      {/* 4. Up to Date & Upcoming */}
      <div
        onClick={() => onSelectStatusFilter('upcoming')}
        className={`bg-white p-3.5 sm:p-5 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] ${
          activeStatusFilter === 'upcoming'
            ? 'border-emerald-600 ring-1 ring-emerald-600/20 shadow-xs'
            : 'border-slate-200/80 hover:border-slate-300 shadow-2xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-emerald-800 uppercase tracking-wider truncate">
            {t.metrics.upToDate}
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-800">
            {metrics.upcomingCount}
          </span>
          <span className="text-[11px] text-emerald-600 truncate">
            {language === 'ar' ? 'منتظم' : 'active'}
          </span>
        </div>
      </div>
    </div>
  );
};
