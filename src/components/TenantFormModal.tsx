import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Check, AlertCircle } from 'lucide-react';
import { Language, PaymentFrequency, TenantRecord } from '../types';
import { calculatePaymentSchedule } from '../utils/scheduleCalculator';
import { translations } from '../utils/translations';

interface TenantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tenantData: Omit<TenantRecord, 'id' | 'notes' | 'paidInstallments' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: TenantRecord | null;
  language: Language;
}

export const TenantFormModal: React.FC<TenantFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  language,
}) => {
  const t = translations[language];

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('+966');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [propertyUnit, setPropertyUnit] = useState('');
  const [rentStartDate, setRentStartDate] = useState('');
  const [rentEndDate, setRentEndDate] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>('quarterly');
  const [rentAmountPerPeriod, setRentAmountPerPeriod] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or populate form when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setMobile(initialData.mobile);
      setIdNumber(initialData.idNumber);
      setEmail(initialData.email || '');
      setPropertyUnit(initialData.propertyUnit || '');
      setRentStartDate(initialData.rentStartDate);
      setRentEndDate(initialData.rentEndDate);
      setPaymentFrequency(initialData.paymentFrequency);
      setRentAmountPerPeriod(initialData.rentAmountPerPeriod ? String(initialData.rentAmountPerPeriod) : '');
    } else {
      // Default: 1 year contract starting today
      const now = new Date();
      const startStr = now.toISOString().split('T')[0];
      const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate() - 1);
      const endStr = nextYear.toISOString().split('T')[0];

      setName('');
      setMobile('+9665');
      setIdNumber('');
      setEmail('');
      setPropertyUnit('');
      setRentStartDate(startStr);
      setRentEndDate(endStr);
      setPaymentFrequency('quarterly');
      setRentAmountPerPeriod('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Live calculation of preview payment milestones
  const previewMilestones = useMemo(() => {
    if (!rentStartDate || !rentEndDate) return [];
    return calculatePaymentSchedule(rentStartDate, rentEndDate, paymentFrequency);
  }, [rentStartDate, rentEndDate, paymentFrequency]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t.tenantForm.validationErrors.nameRequired;
    }

    if (!mobile.trim() || mobile.trim().length < 9) {
      newErrors.mobile = t.tenantForm.validationErrors.mobileRequired;
    }

    if (!idNumber.trim()) {
      newErrors.idNumber = t.tenantForm.validationErrors.idRequired;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = t.tenantForm.validationErrors.emailInvalid;
    }

    if (!rentStartDate || !rentEndDate) {
      newErrors.dates = t.tenantForm.validationErrors.datesRequired;
    } else if (new Date(rentEndDate) <= new Date(rentStartDate)) {
      newErrors.dates = t.tenantForm.validationErrors.datesInvalid;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      name: name.trim(),
      mobile: mobile.trim(),
      idNumber: idNumber.trim(),
      email: email.trim(),
      propertyUnit: propertyUnit.trim(),
      rentStartDate,
      rentEndDate,
      paymentFrequency,
      rentAmountPerPeriod: rentAmountPerPeriod ? parseFloat(rentAmountPerPeriod) : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-0 sm:my-8 max-h-[92vh] sm:max-h-[85vh] flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-none duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {initialData ? t.tenantForm.editTitle : t.tenantForm.addTitle}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              {language === 'ar'
                ? 'إدخال بيانات المستأجر واحتساب جدول استحقاق الدفعات تلقائياً'
                : 'Enter tenant details to automatically project payment milestones'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Tenant Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t.tenantForm.nameLabel} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.tenantForm.namePlaceholder}
              className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all ${
                errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
          </div>

          {/* Row: Mobile & ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.tenantForm.mobileLabel} <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder={t.tenantForm.mobilePlaceholder}
                dir="ltr"
                className={`w-full px-3.5 py-2 text-sm font-mono tabular-nums bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all ${
                  errors.mobile ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.mobile && <p className="text-xs text-rose-600 mt-1">{errors.mobile}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.tenantForm.idNumberLabel} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder={t.tenantForm.idNumberPlaceholder}
                className={`w-full px-3.5 py-2 text-sm font-mono tabular-nums bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all ${
                  errors.idNumber ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.idNumber && <p className="text-xs text-rose-600 mt-1">{errors.idNumber}</p>}
            </div>
          </div>

          {/* Row: Email & Property/Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.tenantForm.emailLabel}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.tenantForm.emailPlaceholder}
                dir="ltr"
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all ${
                  errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.tenantForm.propertyUnitLabel}
              </label>
              <input
                type="text"
                value={propertyUnit}
                onChange={(e) => setPropertyUnit(e.target.value)}
                placeholder={t.tenantForm.propertyUnitPlaceholder}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              />
            </div>
          </div>

          {/* Row: Dates (Start & End) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.tenantForm.rentStartDateLabel} <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={rentStartDate}
                onChange={(e) => setRentStartDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.tenantForm.rentEndDateLabel} <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={rentEndDate}
                onChange={(e) => setRentEndDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              />
            </div>
          </div>
          {errors.dates && <p className="text-xs text-rose-600">{errors.dates}</p>}

          {/* Row: Payment Frequency & Installment Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.tenantForm.frequencyLabel} <span className="text-rose-500">*</span>
              </label>
              <select
                value={paymentFrequency}
                onChange={(e) => setPaymentFrequency(e.target.value as PaymentFrequency)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all cursor-pointer"
              >
                <option value="monthly">{t.frequencyLabels.monthly}</option>
                <option value="quarterly">{t.frequencyLabels.quarterly}</option>
                <option value="semi-annually">{t.frequencyLabels['semi-annually']}</option>
                <option value="annually">{t.frequencyLabels.annually}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.tenantForm.amountLabel}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={rentAmountPerPeriod}
                  onChange={(e) => setRentAmountPerPeriod(e.target.value)}
                  placeholder={t.tenantForm.amountPlaceholder}
                  className="w-full px-3.5 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
                <span className="absolute inset-y-0 end-3 flex items-center text-xs text-slate-400 pointer-events-none">
                  {language === 'ar' ? 'ر.س' : 'SAR'}
                </span>
              </div>
            </div>
          </div>

          {/* Automated Schedule Generator Live Preview */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-800">
                {t.tenantForm.schedulePreviewTitle}
              </h4>
              <span className="text-[11px] font-mono tabular-nums text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                {language === 'ar'
                  ? `${previewMilestones.length} دفعات محسوبة`
                  : `${previewMilestones.length} installments generated`}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              {t.tenantForm.schedulePreviewDesc}
            </p>

            {previewMilestones.length > 0 ? (
              <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200/90 bg-white divide-y divide-slate-100">
                {previewMilestones.map((m) => (
                  <div key={m.installmentNumber} className="flex items-center justify-between px-3 py-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        {language === 'ar' ? `الدفعة ${m.installmentNumber}` : `Installment #${m.installmentNumber}`}
                      </span>
                      {rentAmountPerPeriod && (
                        <span className="text-slate-500 font-mono tabular-nums text-[11px]">
                          ({rentAmountPerPeriod} {language === 'ar' ? 'ر.س' : 'SAR'})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono tabular-nums text-slate-700 font-medium">
                        {m.dueDate}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        m.status === 'overdue'
                          ? 'text-rose-700 bg-rose-50'
                          : m.status === 'due_soon'
                          ? 'text-amber-800 bg-amber-50'
                          : 'text-emerald-800 bg-emerald-50'
                      }`}>
                        {t.statusLabels[m.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-400">
                <AlertCircle className="w-4 h-4 mx-auto mb-1 text-slate-300" />
                {language === 'ar'
                  ? 'يرجى تحديد تواريخ بداية ونهاية الإيجار لعرض جدول الدفعات'
                  : 'Specify valid start and end dates to calculate schedule'}
              </div>
            )}
          </div>

          {/* Form Actions Footer */}
          <div className="pt-3 pb-safe sm:pb-3 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 min-h-[44px] text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
            >
              {t.tenantForm.cancelBtn}
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] text-xs sm:text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 active:scale-95 shadow-sm transition-all flex-1 sm:flex-initial"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? t.tenantForm.updateBtn : t.tenantForm.saveBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
