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
  Building
} from 'lucide-react';
import { Language, TenantRecord } from '../types';
import { evaluateTenantStatus } from '../utils/scheduleCalculator';
import { translations } from '../utils/translations';

interface TenantTableProps {
  tenants: TenantRecord[];
  language: Language;
  onOpenNotes: (tenant: TenantRecord) => void;
  onOpenSchedule: (tenant: TenantRecord) => void;
  onOpenWhatsApp: (tenant: TenantRecord) => void;
  onEdit: (tenant: TenantRecord) => void;
  onDelete: (id: string) => void;
}

export const TenantTable: React.FC<TenantTableProps> = ({
  tenants,
  language,
  onOpenNotes,
  onOpenSchedule,
  onOpenWhatsApp,
  onEdit,
  onDelete,
}) => {
  const t = translations[language];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
            <tr>
              <th className="px-4 py-3.5">{language === 'ar' ? 'المستأجر / الوحدة' : 'Tenant / Unit'}</th>
              <th className="px-4 py-3.5">{language === 'ar' ? 'الهوية / الجوال' : 'ID & Mobile'}</th>
              <th className="px-4 py-3.5">{language === 'ar' ? 'دورية السداد' : 'Frequency'}</th>
              <th className="px-4 py-3.5">{language === 'ar' ? 'الدفعة القادمة' : 'Next Due Date'}</th>
              <th className="px-4 py-3.5">{language === 'ar' ? 'الحالة' : 'Status'}</th>
              <th className="px-4 py-3.5 text-center">{language === 'ar' ? 'الملاحظات' : 'Notes'}</th>
              <th className="px-4 py-3.5 text-right whitespace-nowrap">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tenants.map((tenant) => {
              const { status, nextMilestone, daysRemaining } = evaluateTenantStatus(tenant);

              const getStatusBadge = () => {
                switch (status) {
                  case 'overdue':
                    return (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        {t.statusLabels.overdue}
                      </span>
                    );
                  case 'due_soon':
                    return (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        {t.statusLabels.due_soon}
                      </span>
                    );
                  case 'upcoming':
                    return (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        {t.statusLabels.upcoming}
                      </span>
                    );
                  case 'completed':
                    return (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200">
                        <CheckCircle className="w-3 h-3 text-slate-500" />
                        {t.statusLabels.completed}
                      </span>
                    );
                }
              };

              return (
                <tr key={tenant.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Name and unit */}
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{tenant.name}</div>
                    {tenant.propertyUnit && (
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{tenant.propertyUnit}</span>
                      </div>
                    )}
                  </td>

                  {/* ID & Mobile */}
                  <td className="px-4 py-3.5">
                    <div className="font-mono tabular-nums text-xs font-medium text-slate-800">
                      <bdi>{tenant.mobile}</bdi>
                    </div>
                    <div className="text-xs font-mono tabular-nums text-slate-500 mt-0.5">
                      {tenant.idNumber}
                    </div>
                  </td>

                  {/* Frequency */}
                  <td className="px-4 py-3.5 text-xs text-slate-700">
                    {t.frequencyShort[tenant.paymentFrequency]}
                  </td>

                  {/* Next Due Date & Days Countdown */}
                  <td className="px-4 py-3.5">
                    {nextMilestone ? (
                      <div>
                        <div className="font-mono tabular-nums font-semibold text-slate-900 text-xs">
                          {nextMilestone.dueDate}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                          {daysRemaining !== null && (
                            daysRemaining < 0
                              ? t.tenantCard.daysOverdue.replace('{days}', Math.abs(daysRemaining).toString())
                              : daysRemaining === 0
                              ? t.tenantCard.dueToday
                              : t.tenantCard.daysLeft.replace('{days}', daysRemaining.toString())
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        {t.tenantCard.noUpcoming}
                      </span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-3.5">
                    {getStatusBadge()}
                  </td>

                  {/* Notes Count button */}
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => onOpenNotes(tenant)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                      title={t.tenantCard.notesCount.replace('{count}', tenant.notes.length.toString())}
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono tabular-nums font-semibold">
                        {tenant.notes.length}
                      </span>
                    </button>
                  </td>

                  {/* Quick Action buttons */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
                      <button
                        onClick={() => onOpenWhatsApp(tenant)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                        title={t.tenantCard.whatsapp}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={`tel:${tenant.mobile}`}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                        title={t.tenantCard.call}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => onOpenSchedule(tenant)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                        title={t.tenantCard.viewSchedule}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEdit(tenant)}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
                        title={t.tenantCard.edit}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(t.tenantCard.deleteConfirm)) {
                            onDelete(tenant.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title={t.tenantCard.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
