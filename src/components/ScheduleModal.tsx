import React from 'react';
import { X, Calendar, CheckCircle2, Clock, AlertCircle, Printer, Check, RotateCcw } from 'lucide-react';
import { Language, TenantRecord } from '../types';
import { calculatePaymentSchedule } from '../utils/scheduleCalculator';
import { translations } from '../utils/translations';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: TenantRecord | null;
  language: Language;
  onToggleInstallmentPaid: (tenantId: string, installmentNumber: number) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  tenant,
  language,
  onToggleInstallmentPaid,
}) => {
  const t = translations[language];

  if (!isOpen || !tenant) return null;

  const milestones = calculatePaymentSchedule(
    tenant.rentStartDate,
    tenant.rentEndDate,
    tenant.paymentFrequency,
    tenant.paidInstallments || []
  );

  const paidCount = tenant.paidInstallments ? tenant.paidInstallments.length : 0;
  const totalCount = milestones.length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-0 sm:my-8 max-h-[92vh] sm:max-h-[85vh] flex flex-col print:shadow-none print:border-none print:max-w-none animate-in slide-in-from-bottom sm:slide-in-from-none duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0 print:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/70 print:bg-transparent shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {t.scheduleModal.title}
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              {t.scheduleModal.tenantSubtitle} <span className="font-semibold text-slate-800">{tenant.name}</span>
              {tenant.propertyUnit && ` · ${tenant.propertyUnit}`}
            </p>
          </div>

          <div className="flex items-center gap-1.5 print:hidden">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title={t.scheduleModal.printSchedule}
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contract Summary Box */}
        <div className="px-6 py-4 bg-emerald-50/40 border-b border-emerald-100/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">{t.scheduleModal.summaryContract}</span>
            <span className="font-mono tabular-nums font-semibold text-slate-800">
              {tenant.rentStartDate} <span className="text-slate-400">→</span> {tenant.rentEndDate}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px]">{t.scheduleModal.frequencyNote}</span>
            <span className="font-semibold text-slate-800">
              {t.frequencyShort[tenant.paymentFrequency]}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px]">{t.scheduleModal.totalInstallmentsCount}</span>
            <span className="font-mono tabular-nums font-bold text-slate-900">
              {totalCount} {language === 'ar' ? 'دفعات' : 'installments'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px]">{t.scheduleModal.actionCol}</span>
            <span className="font-mono tabular-nums font-bold text-emerald-700">
              {paidCount} / {totalCount} {t.scheduleModal.paidBadge}
            </span>
          </div>
        </div>

        {/* Milestones Table */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-3">{t.scheduleModal.installmentCol}</th>
                  <th className="px-4 py-3">{t.scheduleModal.dueDateCol}</th>
                  <th className="px-4 py-3">{t.scheduleModal.statusCol}</th>
                  <th className="px-4 py-3 text-right print:hidden whitespace-nowrap">{t.scheduleModal.actionCol}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {milestones.map((m) => {
                  const isPaid = m.isPaid;

                  const getStatusTag = () => {
                    if (isPaid) {
                      return (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {t.scheduleModal.paidBadge}
                        </span>
                      );
                    }
                    if (m.status === 'overdue') {
                      return (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          {t.statusLabels.overdue}
                        </span>
                      );
                    }
                    if (m.status === 'due_soon') {
                      return (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          {t.statusLabels.due_soon}
                        </span>
                      );
                    }
                    return (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {t.statusLabels.upcoming}
                      </span>
                    );
                  };

                  return (
                    <tr
                      key={m.installmentNumber}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isPaid ? 'bg-slate-50/40 text-slate-500' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900">
                          {language === 'ar' ? `الدفعة ${m.installmentNumber}` : `Installment #${m.installmentNumber}`}
                        </span>
                        {tenant.rentAmountPerPeriod && (
                          <span className="block text-[11px] text-slate-500 font-mono tabular-nums">
                            {tenant.rentAmountPerPeriod.toLocaleString()} {language === 'ar' ? 'ر.س' : 'SAR'}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 font-mono tabular-nums text-xs font-semibold text-slate-800">
                        {m.dueDate}
                      </td>

                      <td className="px-4 py-3">
                        {getStatusTag()}
                      </td>

                      <td className="px-4 py-3 text-right print:hidden whitespace-nowrap">
                        <button
                          onClick={() => onToggleInstallmentPaid(tenant.id, m.installmentNumber)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                            isPaid
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          {isPaid ? (
                            <>
                              <RotateCcw className="w-3 h-3" />
                              <span>{t.scheduleModal.markUnpaid}</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3" />
                              <span>{t.scheduleModal.markPaid}</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500">
            {language === 'ar'
              ? 'تساعدك علامة "تم السداد" على تتبع الدفعة التالية القادمة بدقة'
              : 'Marking installments paid keeps your next due date accurate'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/80 rounded-lg transition-colors"
          >
            {t.scheduleModal.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
