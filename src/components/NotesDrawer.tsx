import React, { useState } from 'react';
import { X, Send, Clock, FileText, MessageSquare, Plus, Building, Phone } from 'lucide-react';
import { Language, TenantRecord } from '../types';
import { translations } from '../utils/translations';

interface NotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: TenantRecord | null;
  language: Language;
  onAddNote: (tenantId: string, noteText: string) => void;
  onOpenWhatsApp: (tenant: TenantRecord) => void;
}

export const NotesDrawer: React.FC<NotesDrawerProps> = ({
  isOpen,
  onClose,
  tenant,
  language,
  onAddNote,
  onOpenWhatsApp,
}) => {
  const t = translations[language];
  const [newNoteText, setNewNoteText] = useState('');

  if (!isOpen || !tenant) return null;

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote(tenant.id, newNoteText.trim());
    setNewNoteText('');
  };

  const handleApplyShortcut = (shortcut: string) => {
    onAddNote(tenant.id, shortcut);
  };

  // Sort notes newest first
  const sortedNotes = [...(tenant.notes || [])].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg h-[92vh] sm:h-full bg-white rounded-t-3xl sm:rounded-none shadow-2xl flex flex-col justify-between border-t sm:border-t-0 sm:border-s border-slate-200 animate-in slide-in-from-bottom sm:slide-in-from-right duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                {t.notesDrawer.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200/60">
            <h3 className="text-sm font-semibold text-slate-800">
              {tenant.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
              {tenant.propertyUnit && (
                <span className="flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-400" />
                  <span>{tenant.propertyUnit}</span>
                </span>
              )}
              <span className="font-mono tabular-nums flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <bdi>{tenant.mobile}</bdi>
              </span>
            </div>
          </div>
        </div>

        {/* Notes Timeline Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Quick WhatsApp Reminder shortcut banner */}
          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/70 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs text-emerald-900 font-medium">
                {language === 'ar' ? 'تواصل فوري وتذكير بالدفعة:' : 'Instant Payment Follow-up:'}
              </span>
            </div>
            <button
              onClick={() => onOpenWhatsApp(tenant)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-all shadow-xs shrink-0"
            >
              <MessageSquare className="w-3 h-3" />
              <span>{t.notesDrawer.quickWhatsApp}</span>
            </button>
          </div>

          {/* Quick predefined phrases */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              {t.notesDrawer.quickShortcuts}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {t.notesDrawer.shortcuts.map((sc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyShortcut(sc)}
                  className="text-[11px] text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 px-2.5 py-1 rounded-md transition-all flex items-center gap-1"
                >
                  <Plus className="w-2.5 h-2.5 text-slate-400" />
                  <span>{sc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes Log */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-3">
              {language === 'ar' ? 'سجل المحادثات المؤرخ:' : 'Chronological Timeline:'}
            </span>

            {sortedNotes.length > 0 ? (
              <div className="space-y-3 relative before:absolute before:inset-y-0 before:start-3.5 before:w-0.5 before:bg-slate-200">
                {sortedNotes.map((note) => {
                  const dateObj = new Date(note.timestamp);
                  const formattedDate = dateObj.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });
                  const formattedTime = dateObj.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div key={note.id} className="relative ps-8 group">
                      {/* Timeline dot */}
                      <div className="absolute start-2 top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-600 group-hover:scale-110 transition-transform" />

                      <div className="bg-slate-50 hover:bg-slate-100/80 p-3 rounded-lg border border-slate-200/80 transition-colors">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="font-mono tabular-nums">{formattedDate} · {formattedTime}</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                          {note.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl p-4">
                <FileText className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                <p>{t.notesDrawer.emptyNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 pb-safe sm:pb-4 border-t border-slate-200 bg-white shrink-0">
          <form onSubmit={handleAdd} className="space-y-2">
            <textarea
              rows={2}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder={t.notesDrawer.newNotePlaceholder}
              className="w-full p-3 text-sm sm:text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {language === 'ar' ? 'يتم حفظ الوقت تلقائياً' : 'Timestamp auto-logged'}
              </span>
              <button
                type="submit"
                disabled={!newNoteText.trim()}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 min-h-[44px] text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.notesDrawer.addNoteBtn}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
