import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Copy, Check, ExternalLink, Phone } from 'lucide-react';
import { Language, TenantRecord } from '../types';
import { evaluateTenantStatus } from '../utils/scheduleCalculator';
import { translations } from '../utils/translations';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: TenantRecord | null;
  language: Language;
  onNoteLogged?: (tenantId: string, noteText: string) => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  tenant,
  language,
  onNoteLogged,
}) => {
  const t = translations[language];
  const [templateLang, setTemplateLang] = useState<'ar' | 'en'>(language);
  const [messageText, setMessageText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTemplateLang(language);
  }, [language, isOpen]);

  useEffect(() => {
    if (!tenant) return;

    const evalResult = evaluateTenantStatus(tenant);
    const milestone = evalResult.nextMilestone;
    const dueDate = milestone ? milestone.dueDate : tenant.rentEndDate;
    const installmentNumber = milestone ? milestone.installmentNumber : 1;
    const amountStr = tenant.rentAmountPerPeriod 
      ? ` بمبلغ قدره (${tenant.rentAmountPerPeriod.toLocaleString()} ر.س)` 
      : '';
    const amountStrEn = tenant.rentAmountPerPeriod 
      ? ` in the amount of (${tenant.rentAmountPerPeriod.toLocaleString()} SAR)` 
      : '';

    if (templateLang === 'ar') {
      setMessageText(
        `السلام عليكم ورحمة الله وبركاته،\nالأخ/الأخت ${tenant.name} المحترم،\n\nنود تذكيركم بموعد استحقاق دفعة الإيجار (دفعة رقم ${installmentNumber})${amountStr} الخاصة بـ ${tenant.propertyUnit || 'العقار'} والمستحقة بتاريخ ${dueDate}.\n\nنرجو التكرم بالتحويل شاكرين ومقدرين لكم حسن تعاونكم الدائم.\n\nمع التحية والتقدير،\nإدارة العقار.`
      );
    } else {
      setMessageText(
        `Dear ${tenant.name},\n\nThis is a polite reminder regarding your upcoming rental installment (#${installmentNumber})${amountStrEn} for ${tenant.propertyUnit || 'the property'}, which is due on ${dueDate}.\n\nKindly proceed with the transfer at your earliest convenience. Thank you for your continued cooperation.\n\nBest regards,\nProperty Management.`
      );
    }
    setCopied(false);
  }, [tenant, templateLang]);

  if (!isOpen || !tenant) return null;

  // Clean phone number for wa.me URL (remove '+', spaces, dashes)
  const cleanPhone = tenant.mobile.replace(/[^0-9]/g, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(messageText);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // Automatically append a follow-up log note if callback provided
    if (onNoteLogged) {
      const logNote = language === 'ar'
        ? `تم إرسال رسالة تذكير بالدفعة عبر تطبيق واتساب (${templateLang === 'ar' ? 'بالعربية' : 'بالإنجليزية'})`
        : `Sent payment reminder via WhatsApp (${templateLang === 'ar' ? 'Arabic' : 'English'})`;
      onNoteLogged(tenant.id, logNote);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-0 sm:my-8 max-h-[92vh] sm:max-h-[85vh] flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-none duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {t.whatsappModal.title}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                {t.whatsappModal.tenantName} <span className="font-semibold text-slate-800">{tenant.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Target Number */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-600 font-medium">{t.whatsappModal.phoneNumber}</span>
            <span className="font-mono tabular-nums font-bold text-slate-800" dir="ltr">
              {tenant.mobile}
            </span>
          </div>

          {/* Template Choice Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              {t.whatsappModal.templateChoice}
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setTemplateLang('ar')}
                className={`py-1.5 px-3 rounded-md transition-all ${
                  templateLang === 'ar'
                    ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.whatsappModal.templateAr}
              </button>
              <button
                type="button"
                onClick={() => setTemplateLang('en')}
                className={`py-1.5 px-3 rounded-md transition-all ${
                  templateLang === 'en'
                    ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.whatsappModal.templateEn}
              </button>
            </div>
          </div>

          {/* Editable Message Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {t.whatsappModal.previewLabel}
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-medium"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>{t.whatsappModal.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{t.whatsappModal.copyText}</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={6}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-3 text-xs leading-relaxed bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-sans"
              dir={templateLang === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-3.5 pb-safe sm:pb-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2.5 shrink-0">
          <a
            href={`tel:${tenant.mobile}`}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 h-11 min-h-[44px] text-xs font-semibold text-slate-700 hover:bg-slate-200/80 active:scale-95 rounded-xl transition-colors border border-slate-200"
          >
            <Phone className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">{language === 'ar' ? 'اتصال هاتف' : 'Phone Call'}</span>
          </a>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
            <button
              onClick={onClose}
              className="px-3.5 h-11 min-h-[44px] text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/80 active:scale-95 rounded-xl transition-colors"
            >
              {t.whatsappModal.closeBtn}
            </button>
            <button
              onClick={handleOpenWhatsApp}
              className="inline-flex items-center justify-center gap-2 px-5 h-11 min-h-[44px] text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-sm transition-all flex-1 sm:flex-initial cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{t.whatsappModal.sendViaWhatsApp}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
