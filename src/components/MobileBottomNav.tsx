import React from 'react';
import { Users, AlertCircle, Clock, Plus, SlidersHorizontal } from 'lucide-react';
import { DashboardMetrics, Language, PaymentStatus } from '../types';
import { translations } from '../utils/translations';

interface MobileBottomNavProps {
  language: Language;
  activeStatusFilter: PaymentStatus | 'all';
  onSelectStatusFilter: (status: PaymentStatus | 'all') => void;
  onOpenAddTenant: () => void;
  onOpenMoreOptions: () => void;
  metrics: DashboardMetrics;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  language,
  activeStatusFilter,
  onSelectStatusFilter,
  onOpenAddTenant,
  onOpenMoreOptions,
  metrics,
}) => {
  const t = translations[language];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 pb-safe md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-2">
        {/* Tab 1: All Tenants */}
        <button
          type="button"
          onClick={() => onSelectStatusFilter('all')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative ${
            activeStatusFilter === 'all'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 font-medium">
            {t.mobileNav.all}
          </span>
          {activeStatusFilter === 'all' && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-600" />
          )}
        </button>

        {/* Tab 2: Overdue */}
        <button
          type="button"
          onClick={() => onSelectStatusFilter('overdue')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative ${
            activeStatusFilter === 'overdue'
              ? 'text-rose-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <AlertCircle className="w-5 h-5" />
            {metrics.overdueCount > 0 && (
              <span className="absolute -top-1.5 -end-2.5 bg-rose-600 text-white font-mono tabular-nums text-[10px] font-bold px-1.5 min-w-[16px] h-4 rounded-full flex items-center justify-center shadow-xs">
                {metrics.overdueCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 font-medium">
            {t.mobileNav.overdue}
          </span>
          {activeStatusFilter === 'overdue' && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-rose-600" />
          )}
        </button>

        {/* Tab 3: Raised Center Floating Add Action Button */}
        <div className="flex items-center justify-center h-full">
          <button
            type="button"
            onClick={onOpenAddTenant}
            className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-transform -mt-3 border-2 border-white cursor-pointer"
            aria-label={t.addTenant}
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 4: Due Soon */}
        <button
          type="button"
          onClick={() => onSelectStatusFilter('due_soon')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative ${
            activeStatusFilter === 'due_soon'
              ? 'text-amber-800 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Clock className="w-5 h-5" />
            {metrics.dueSoonCount > 0 && (
              <span className="absolute -top-1.5 -end-2.5 bg-amber-500 text-white font-mono tabular-nums text-[10px] font-bold px-1.5 min-w-[16px] h-4 rounded-full flex items-center justify-center shadow-xs">
                {metrics.dueSoonCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 font-medium">
            {t.mobileNav.dueSoon}
          </span>
          {activeStatusFilter === 'due_soon' && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500" />
          )}
        </button>

        {/* Tab 5: More Options / Backup */}
        <button
          type="button"
          onClick={onOpenMoreOptions}
          className="flex flex-col items-center justify-center h-full min-h-[44px] text-slate-500 hover:text-slate-800 transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 font-medium">
            {t.mobileNav.more}
          </span>
        </button>
      </div>
    </nav>
  );
};
