import React from 'react';
import { 
  Phone, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  Clock, 
  CheckCircle,
  Building,
  IdCard,
  Mail
} from 'lucide-react';
import { Language, TenantRecord } from '../types';
import { evaluateTenantStatus } from '../utils/scheduleCalculator';
import { translations } from '../utils/translations';

interface TenantCardProps {
  tenant: TenantRecord;
  language: Language;
  onOpenNotes: (tenant: TenantRecord) => void;
  onOpenSchedule: (tenant: TenantRecord) => void;
  onOpenWhatsApp: (tenant: TenantRecord) => void;
  onEdit: (tenant: TenantRecord) => void;
  onDelete: (id: string) => void;
}

export const TenantCard: React.FC<TenantCardProps> = ({
  tenant,
  language,
  onOpenNotes,
  onOpenSchedule,
  onOpenWhatsApp,
  onEdit,
  onDelete,
}) => {
  const t = translations[language];
  const evaluation = evaluateTenantStatus(tenant);
  const { status, nextMilestone, daysRemaining, allMilestones, completedCount, totalInstallments } = evaluation;

  // Status visual styles (clean unboxed indicator with icon and text)
  const getStatusDisplay = () => {
    switch (status) {
      case 'overdue':
        return {
          icon: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
          label: t.statusLabels.overdue,
          colorClass: 'text-rose-700 bg-rose-50/70 border-rose-200/80',
          textColor: 'text-rose-700',
          relativeDaysText: daysRemaining !== null 
            ? t.tenantCard.daysOverdue.replace('{days}', Math.abs(daysRemaining).toString())
            : '',
        };
      case 'due_soon':
        return {
          icon: <Clock className="w-4 h-4 text-amber-600 shrink-0" />,
          label: t.statusLabels.due_soon,
          colorClass: 'text-amber-800 bg-amber-50/70 border-amber-200/80',
          textColor: 'text-amber-700',
          relativeDaysText: daysRemaining === 0 
            ? t.tenantCard.dueToday
            : t.tenantCard.daysLeft.replace('{days}', (daysRemaining || 0).toString()),
        };
      case 'upcoming':
        return {
          icon: <Clock className="w-4 h-4 text-emerald-600 shrink-0" />,
          label: t.statusLabels.upcoming,
          colorClass: 'text-emerald-800 bg-emerald-50/70 border-emerald-200/80',
          textColor: 'text-emerald-700',
          relativeDaysText: daysRemaining !== null 
            ? t.tenantCard.daysLeft.replace('{days}', daysRemaining.toString())
            : '',
        };
      case 'completed':
        return {
          icon: <CheckCircle className="w-4 h-4 text-slate-500 shrink-0" />,
          label: t.statusLabels.completed,
          colorClass: 'text-slate-700 bg-slate-100/80 border-slate-200',
          textColor: 'text-slate-600',
          relativeDaysText: t.tenantCard.noUpcoming,
        };
    }
  };

  const statusInfo = getStatusDisplay();
  const latestNote = tenant.notes && tenant.notes.length > 0 ? tenant.notes[tenant.notes.length - 1] : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
      {/* Top Header inside card */}
      <div className="p-5 pb-4">
        {/* Row 1: Name and Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 tracking-tight truncate">
              {tenant.name}
            </h3>
            {tenant.propertyUnit && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{tenant.propertyUnit}</span>
              </p>
            )}
          </div>

          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold shrink-0 ${statusInfo.colorClass}`}>
            {statusInfo.icon}
            <span>{statusInfo.label}</span>
          </div>
        </div>

        {/* Row 2: Metadata unboxed with subtle middots */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-2.5 pt-2.5 border-t border-slate-100">
          <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-700">
            <Phone className="w-3 h-3 text-slate-400" />
            <bdi>{tenant.mobile}</bdi>
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-600">
            <IdCard className="w-3 h-3 text-slate-400" />
            <span>{tenant.idNumber}</span>
          </span>
          {tenant.email && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1 text-slate-500 truncate max-w-[150px]">
                <Mail className="w-3 h-3 text-slate-400" />
                <span className="truncate">{tenant.email}</span>
              </span>
            </>
          )}
        </div>

        {/* Row 3: Next Due Payment Highlight Box */}
        <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">{t.tenantCard.nextPayment}:</span>
            <span className={`font-semibold font-mono tabular-nums ${statusInfo.textColor}`}>
              {statusInfo.relativeDaysText}
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            {nextMilestone ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-800">
                    {language === 'ar' ? `الدفعة رقم ${nextMilestone.installmentNumber}` : `Installment #${nextMilestone.installmentNumber}`}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({t.frequencyShort[tenant.paymentFrequency]})
                  </span>
                </div>
                <span className="text-sm font-bold font-mono tabular-nums text-slate-900">
                  {nextMilestone.dueDate}
                </span>
              </>
            ) : (
              <span className="text-xs text-slate-500 italic">
                {t.tenantCard.noUpcoming}
              </span>
            )}
          </div>

          {/* Installment completion progress */}
          <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {t.tenantCard.paidOf
                .replace('{paid}', completedCount.toString())
                .replace('{total}', totalInstallments.toString())}
            </span>
            <span className="font-mono tabular-nums">
              {Math.round((completedCount / (totalInstallments || 1)) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full rounded-full transition-all ${
                status === 'overdue' ? 'bg-rose-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.round((completedCount / (totalInstallments || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Latest note snippet if available */}
        {latestNote && (
          <div
            onClick={() => onOpenNotes(tenant)}
            className="mt-3 text-xs bg-amber-50/50 border border-amber-200/50 rounded-lg p-2.5 text-slate-700 cursor-pointer hover:bg-amber-50 transition-colors"
          >
            <div className="flex items-center justify-between text-[11px] text-amber-900/70 mb-1">
              <span className="font-semibold flex items-center gap-1">
                <FileText className="w-3 h-3 text-amber-700" />
                {language === 'ar' ? 'آخر ملاحظة متابعة:' : 'Latest Follow-up Note:'}
              </span>
              <span className="font-mono tabular-nums text-[10px]">
                {new Date(latestNote.timestamp).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
              </span>
            </div>
            <p className="line-clamp-2 text-slate-700 text-xs leading-relaxed">
              "{latestNote.text}"
            </p>
          </div>
        )}
      </div>

      {/* Card Actions Bottom Strip - Structured Non-Overlapping Layout */}
      <div className="px-4 sm:px-5 py-3 bg-slate-50/90 border-t border-slate-100 rounded-b-2xl flex flex-col gap-2">
        {/* Row 1: Primary Communication Actions (WhatsApp, Phone, Notes) */}
        <div className="flex items-center gap-2 w-full">
          {/* WhatsApp Reminder (Dominant Primary Follow-up Action) */}
          <button
            type="button"
            onClick={() => onOpenWhatsApp(tenant)}
            className="flex-1 min-h-[42px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap"
            title={t.tenantCard.whatsapp}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="truncate">{t.tenantCard.whatsapp}</span>
          </button>

          {/* Direct Phone Call */}
          <a
            href={`tel:${tenant.mobile}`}
            className="w-10 h-10 min-h-[42px] min-w-[42px] inline-flex items-center justify-center text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 active:scale-95 rounded-xl border border-slate-200 transition-all shadow-2xs shrink-0 cursor-pointer"
            title={t.tenantCard.call}
          >
            <Phone className="w-4 h-4 text-slate-600" />
          </a>

          {/* Follow-up Notes Button with Counter */}
          <button
            type="button"
            onClick={() => onOpenNotes(tenant)}
            className="h-10 min-h-[42px] px-3 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 active:scale-95 rounded-xl border border-slate-200 transition-all shadow-2xs shrink-0 cursor-pointer whitespace-nowrap"
            title={t.tenantCard.addNote}
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span className="font-mono tabular-nums text-xs">
              {tenant.notes.length}
            </span>
          </button>
        </div>

        {/* Row 2: Lease Schedule & Management (Schedule, Edit, Delete) */}
        <div className="flex items-center gap-2 w-full pt-1.5 border-t border-slate-200/50">
          {/* View Schedule Button */}
          <button
            type="button"
            onClick={() => onOpenSchedule(tenant)}
            className="flex-1 h-9 min-h-[38px] inline-flex items-center justify-center gap-1.5 px-3 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 active:scale-95 rounded-xl border border-slate-200 transition-all shadow-2xs cursor-pointer whitespace-nowrap"
            title={t.tenantCard.viewSchedule}
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{t.tenantCard.viewSchedule}</span>
          </button>

          {/* Edit Tenant Button */}
          <button
            type="button"
            onClick={() => onEdit(tenant)}
            className="w-9 h-9 min-h-[38px] min-w-[38px] inline-flex items-center justify-center text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 active:scale-95 rounded-xl border border-slate-200 transition-all shadow-2xs shrink-0 cursor-pointer"
            title={t.tenantCard.edit}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Delete Tenant Button */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm(t.tenantCard.deleteConfirm)) {
                onDelete(tenant.id);
              }
            }}
            className="w-9 h-9 min-h-[38px] min-w-[38px] inline-flex items-center justify-center text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 active:scale-95 rounded-xl border border-slate-200 transition-all shadow-2xs shrink-0 cursor-pointer"
            title={t.tenantCard.delete}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
