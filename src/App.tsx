/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  LayoutGrid, 
  Table as TableIcon, 
  Filter, 
  X, 
  Plus, 
  FileDown, 
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Lock,
  LogIn,
  Database,
  ShieldCheck,
  UserCheck,
  Sparkles
} from 'lucide-react';

import { Language, PaymentStatus, TenantRecord, DashboardMetrics, AuthUser } from './types';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { TenantCard } from './components/TenantCard';
import { TenantTable } from './components/TenantTable';
import { TenantFormModal } from './components/TenantFormModal';
import { ScheduleModal } from './components/ScheduleModal';
import { NotesDrawer } from './components/NotesDrawer';
import { WhatsAppModal } from './components/WhatsAppModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileOptionsSheet } from './components/MobileOptionsSheet';
import { AuthModal } from './components/AuthModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';

import { evaluateTenantStatus } from './utils/scheduleCalculator';
import { translations } from './utils/translations';
import { 
  isSupabaseConfigured, 
  fetchTenantsFromSupabase, 
  upsertTenantToSupabase, 
  deleteTenantFromSupabase,
  getSessionUser,
  signOutUser,
  onAuthStateChange
} from './services/supabase';

const LANG_STORAGE_KEY = 'aqar_language_pref_v1';

export default function App() {
  // 1. Language state (Arabic default as per requirements)
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return (saved === 'ar' || saved === 'en') ? saved : 'ar';
  });

  const t = translations[language];

  // Update HTML root dir and lang
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem(LANG_STORAGE_KEY, language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  // 2. User Authentication State
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSupabaseConfigOpen, setIsSupabaseConfigOpen] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // 3. Tenants state - Starts strictly with ZERO data as requested (relies solely on live Supabase)
  const [tenants, setTenants] = useState<TenantRecord[]>([]);

  // Load tenants strictly belonging to current authenticated user
  const loadUserTenants = async (userId?: string) => {
    setIsDataLoading(true);
    const data = await fetchTenantsFromSupabase(userId);
    if (data !== null) {
      setTenants(data);
    } else {
      setTenants([]);
    }
    setIsDataLoading(false);
  };

  // Auth session initialization & listener
  useEffect(() => {
    if (isSupabaseConfigured) {
      getSessionUser().then((currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          loadUserTenants(currentUser.id);
        } else {
          setTenants([]);
          setIsDataLoading(false);
        }
      });

      const unsubscribe = onAuthStateChange((newUser) => {
        setUser(newUser);
        if (newUser) {
          loadUserTenants(newUser.id);
        } else {
          setTenants([]);
          setIsDataLoading(false);
        }
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    } else {
      setIsDataLoading(false);
    }
  }, []);

  // Handler: Sign out
  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    setTenants([]);
    showToast(language === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Signed out successfully');
  };

  // 4. Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // 5. Modal & Drawer States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantRecord | null>(null);

  const [scheduleTenant, setScheduleTenant] = useState<TenantRecord | null>(null);
  const [notesTenant, setNotesTenant] = useState<TenantRecord | null>(null);
  const [whatsappTenant, setWhatsappTenant] = useState<TenantRecord | null>(null);
  const [isMobileOptionsOpen, setIsMobileOptionsOpen] = useState(false);

  // Hidden file input for import
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 6. Dashboard Metrics Calculation
  const metrics: DashboardMetrics = useMemo(() => {
    let overdueCount = 0;
    let dueSoonCount = 0;
    let upcomingCount = 0;
    let completedCount = 0;

    tenants.forEach((tenant) => {
      const evaluation = evaluateTenantStatus(tenant);
      switch (evaluation.status) {
        case 'overdue':
          overdueCount++;
          break;
        case 'due_soon':
          dueSoonCount++;
          break;
        case 'upcoming':
          upcomingCount++;
          break;
        case 'completed':
          completedCount++;
          break;
      }
    });

    return {
      totalTenants: tenants.length,
      overdueCount,
      dueSoonCount,
      upcomingCount,
      completedCount,
    };
  }, [tenants]);

  // 7. Filtered Tenants List
  const filteredTenants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return tenants.filter((tenant) => {
      // Status matching
      if (statusFilter !== 'all') {
        const evaluation = evaluateTenantStatus(tenant);
        if (evaluation.status !== statusFilter) {
          return false;
        }
      }

      // Search matching (Name, Mobile, ID/Iqama/CR, or Property/Unit)
      if (q) {
        const matchName = tenant.name.toLowerCase().includes(q);
        const matchMobile = tenant.mobile.toLowerCase().includes(q);
        const matchId = tenant.idNumber.toLowerCase().includes(q);
        const matchUnit = tenant.propertyUnit ? tenant.propertyUnit.toLowerCase().includes(q) : false;
        return matchName || matchMobile || matchId || matchUnit;
      }

      return true;
    });
  }, [tenants, searchQuery, statusFilter]);

  // 8. Handler: Add or Update Tenant
  const handleSaveTenant = async (
    formData: Omit<TenantRecord, 'id' | 'notes' | 'paidInstallments' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!isSupabaseConfigured) {
      setIsSupabaseConfigOpen(true);
      return;
    }

    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    const nowIso = new Date().toISOString();

    if (editingTenant) {
      const updated: TenantRecord = {
        ...editingTenant,
        ...formData,
        userId: user.id,
        updatedAt: nowIso,
      };
      setTenants((prev) =>
        prev.map((t) => (t.id === editingTenant.id ? updated : t))
      );
      await upsertTenantToSupabase(updated, user.id);
      showToast(language === 'ar' ? 'تم تحديث بيانات المستأجر في Supabase' : 'Tenant details updated in Supabase');
    } else {
      const newTenant: TenantRecord = {
        ...formData,
        id: `tenant-${Date.now()}`,
        userId: user.id,
        notes: [
          {
            id: `note-${Date.now()}`,
            timestamp: nowIso,
            text: language === 'ar' ? 'تم إنشاء السجل وتوليد جدول الاستحقاق' : 'Tenant record created and schedule generated',
            category: 'general',
          },
        ],
        paidInstallments: [],
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      setTenants((prev) => [newTenant, ...prev]);
      await upsertTenantToSupabase(newTenant, user.id);
      showToast(language === 'ar' ? 'تم إضافة المستأجر وحفظه في حسابك السحابي' : 'Tenant saved to your cloud account');
    }

    setEditingTenant(null);
  };

  // 9. Handler: Delete Tenant
  const handleDeleteTenant = async (id: string) => {
    setTenants((prev) => prev.filter((t) => t.id !== id));
    if (isSupabaseConfigured) {
      await deleteTenantFromSupabase(id);
    }
    showToast(language === 'ar' ? 'تم حذف السجل من قاعدة البيانات' : 'Tenant deleted from database');
  };

  // 10. Handler: Add Follow-up Note
  const handleAddNote = async (tenantId: string, noteText: string) => {
    const nowIso = new Date().toISOString();
    const newNote = {
      id: `note-${Date.now()}`,
      timestamp: nowIso,
      text: noteText,
    };

    let targetUpdated: TenantRecord | null = null;

    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          const updated = {
            ...t,
            notes: [...(t.notes || []), newNote],
            updatedAt: nowIso,
          };
          targetUpdated = updated;
          if (notesTenant && notesTenant.id === tenantId) {
            setNotesTenant(updated);
          }
          return updated;
        }
        return t;
      })
    );

    if (targetUpdated && isSupabaseConfigured && user) {
      await upsertTenantToSupabase(targetUpdated, user.id);
    }

    showToast(language === 'ar' ? 'تم حفظ الملاحظة في السجل السحابي' : 'Follow-up note logged');
  };

  // 11. Handler: Toggle Milestone Paid
  const handleToggleInstallmentPaid = async (tenantId: string, installmentNumber: number) => {
    let targetUpdated: TenantRecord | null = null;

    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          const currentPaid = t.paidInstallments || [];
          const isCurrentlyPaid = currentPaid.includes(installmentNumber);
          const updatedPaid = isCurrentlyPaid
            ? currentPaid.filter((n) => n !== installmentNumber)
            : [...currentPaid, installmentNumber];

          const updatedTenant = {
            ...t,
            paidInstallments: updatedPaid,
            updatedAt: new Date().toISOString(),
          };
          targetUpdated = updatedTenant;

          if (scheduleTenant && scheduleTenant.id === tenantId) {
            setScheduleTenant(updatedTenant);
          }
          return updatedTenant;
        }
        return t;
      })
    );

    if (targetUpdated && isSupabaseConfigured && user) {
      await upsertTenantToSupabase(targetUpdated, user.id);
    }
  };

  // 12. Handler: Export JSON Backup
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tenants, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aqar_follow_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(language === 'ar' ? 'تم تحميل ملف النسخة الاحتياطية' : 'Backup file downloaded');
  };

  // 13. Handler: Import JSON Backup
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          setTenants(parsed);
          // Sync imported records if logged in
          if (isSupabaseConfigured && user) {
            for (const item of parsed) {
              await upsertTenantToSupabase(item, user.id);
            }
          }
          showToast(language === 'ar' ? 'تم استيراد ومزامنة البيانات بنجاح' : 'Data imported and synced successfully');
        } else {
          alert('Invalid JSON file format');
        }
      } catch (err) {
        alert('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 14. Handler: Clear / Reset Data
  const handleResetData = () => {
    if (window.confirm(language === 'ar' ? 'هل تريد تصفير الشاشة والبدء بسجل فارغ؟' : 'Clear current records to zero?')) {
      setTenants([]);
      showToast(language === 'ar' ? 'تم تصفير البيانات بنجاح' : 'Data cleared to zero');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col text-slate-900">
      {/* Top Bar Header */}
      <Header
        language={language}
        user={user}
        onToggleLanguage={toggleLanguage}
        onOpenAddTenant={() => {
          if (!isSupabaseConfigured) {
            setIsSupabaseConfigOpen(true);
            return;
          }
          if (!user) {
            setIsAuthOpen(true);
            return;
          }
          setEditingTenant(null);
          setIsFormOpen(true);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
        onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
        onExportData={handleExportData}
        onImportData={handleImportClick}
        onResetData={handleResetData}
      />

      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json"
        className="hidden"
      />

      {/* Main Viewport */}
      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3.5 sm:py-6 flex-1 w-full pb-28 md:pb-8">
        




        {/* KPI Metric Dashboard Cards */}
        <DashboardStats
          metrics={metrics}
          language={language}
          activeStatusFilter={statusFilter}
          onSelectStatusFilter={setStatusFilter}
        />

        {/* Filter & Search Bar */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs mb-4 sm:mb-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute inset-y-0 start-3.5 my-auto pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full ps-10 pe-9 h-11 sm:h-10 text-sm sm:text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 end-3 flex items-center justify-center w-7 h-7 my-auto text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Buttons Segmented Control */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none -mx-1 px-1">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3.5 py-2 min-h-[36px] rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                {t.allStatuses} ({metrics.totalTenants})
              </button>

              <button
                onClick={() => setStatusFilter('overdue')}
                className={`px-3.5 py-2 min-h-[36px] rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                  statusFilter === 'overdue'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
                }`}
              >
                {t.statusLabels.overdue} ({metrics.overdueCount})
              </button>

              <button
                onClick={() => setStatusFilter('due_soon')}
                className={`px-3.5 py-2 min-h-[36px] rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                  statusFilter === 'due_soon'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
                }`}
              >
                {t.statusLabels.due_soon} ({metrics.dueSoonCount})
              </button>

              <button
                onClick={() => setStatusFilter('upcoming')}
                className={`px-3.5 py-2 min-h-[36px] rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                  statusFilter === 'upcoming'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
                }`}
              >
                {t.statusLabels.upcoming} ({metrics.upcomingCount})
              </button>

              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3.5 py-2 min-h-[36px] rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                  statusFilter === 'completed'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.statusLabels.completed} ({metrics.completedCount})
              </button>

              {/* View Mode Toggle (Cards vs Table) */}
              <div className="hidden sm:flex items-center gap-1 p-0.5 ms-2 bg-slate-100 rounded-lg border border-slate-200/60">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title={t.viewCards}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title={t.viewTable}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section: Cards or Table */}
        {filteredTenants.length > 0 ? (
          viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTenants.map((tenant) => (
                <TenantCard
                  key={tenant.id}
                  tenant={tenant}
                  language={language}
                  onOpenNotes={(t) => setNotesTenant(t)}
                  onOpenSchedule={(t) => setScheduleTenant(t)}
                  onOpenWhatsApp={(t) => setWhatsappTenant(t)}
                  onEdit={(t) => {
                    setEditingTenant(t);
                    setIsFormOpen(true);
                  }}
                  onDelete={handleDeleteTenant}
                />
              ))}
            </div>
          ) : (
            <TenantTable
              tenants={filteredTenants}
              language={language}
              onOpenNotes={(t) => setNotesTenant(t)}
              onOpenSchedule={(t) => setScheduleTenant(t)}
              onOpenWhatsApp={(t) => setWhatsappTenant(t)}
              onEdit={(t) => {
                setEditingTenant(t);
                setIsFormOpen(true);
              }}
              onDelete={handleDeleteTenant}
            />
          )
        ) : (
          /* Empty State - Starts with 0 data */
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-4">
              <Plus className="w-7 h-7" />
            </div>
            {tenants.length === 0 ? (
              <>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                  {user 
                    ? (language === 'ar' ? 'لا يوجد مستأجرين مضافين في حسابك حتى الآن' : 'No tenants added to your account yet')
                    : (language === 'ar' ? 'سجل خالٍ - ابدأ بإضافة أول مستأجر' : 'Clean Slate - Add Your First Tenant')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
                  {user
                    ? (language === 'ar' 
                        ? 'أضف أول مستأجر لتوليد جدول الاستحقاق وحساب مواعيد الدفعات تلقائياً.' 
                        : 'Add your first tenant to automatically generate their installment schedule and track due dates.')
                    : (language === 'ar'
                        ? 'سجل دخولك أولاً لربط عقاراتك بحسابك المشفر في Supabase ومنع مشاركتها مع أي شخص آخر.'
                        : 'Sign in to bind your tenants to your private cloud partition in Supabase.')}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {user ? (
                    <button
                      onClick={() => {
                        setEditingTenant(null);
                        setIsFormOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t.emptyState.addFirstTenant}</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsAuthOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>{language === 'ar' ? 'تسجيل الدخول لإضافة مستأجر' : 'Sign In to Add Tenant'}</span>
                      </button>
                      {!isSupabaseConfigured && (
                        <button
                          onClick={() => setIsSupabaseConfigOpen(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                        >
                          <Database className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{language === 'ar' ? 'ربط Supabase' : 'Connect Supabase'}</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  {t.emptyState.noResultsTitle}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  {t.emptyState.noResultsDesc}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.emptyState.clearFilters}</span>
                </button>
              </>
            )}
          </div>
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 start-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals & Drawers */}
      <TenantFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTenant(null);
        }}
        onSave={handleSaveTenant}
        initialData={editingTenant}
        language={language}
      />

      <ScheduleModal
        isOpen={!!scheduleTenant}
        onClose={() => setScheduleTenant(null)}
        tenant={scheduleTenant}
        language={language}
        onToggleInstallmentPaid={handleToggleInstallmentPaid}
      />

      <NotesDrawer
        isOpen={!!notesTenant}
        onClose={() => setNotesTenant(null)}
        tenant={notesTenant}
        language={language}
        onAddNote={handleAddNote}
        onOpenWhatsApp={(t) => setWhatsappTenant(t)}
      />

      <WhatsAppModal
        isOpen={!!whatsappTenant}
        onClose={() => setWhatsappTenant(null)}
        tenant={whatsappTenant}
        language={language}
        onNoteLogged={handleAddNote}
      />

      {/* Mobile App Bottom Navigation Bar */}
      <MobileBottomNav
        language={language}
        activeStatusFilter={statusFilter}
        onSelectStatusFilter={setStatusFilter}
        onOpenAddTenant={() => {
          if (!isSupabaseConfigured) {
            setIsSupabaseConfigOpen(true);
            return;
          }
          if (!user) {
            setIsAuthOpen(true);
            return;
          }
          setEditingTenant(null);
          setIsFormOpen(true);
        }}
        onOpenMoreOptions={() => setIsMobileOptionsOpen(true)}
        metrics={metrics}
      />

      {/* Mobile App Options Bottom Sheet */}
      <MobileOptionsSheet
        isOpen={isMobileOptionsOpen}
        onClose={() => setIsMobileOptionsOpen(false)}
        language={language}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
        onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
        onToggleLanguage={toggleLanguage}
        onExportData={handleExportData}
        onImportData={handleImportClick}
        onResetData={handleResetData}
      />

      {/* User Authentication Modal (Email / Password & Google OAuth) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        language={language}
        onAuthSuccess={(authUser) => {
          setUser(authUser);
          loadUserTenants(authUser.id);
          showToast(language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Signed in successfully');
        }}
        onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
      />

      {/* Supabase Database Connection & SQL Schema Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseConfigOpen}
        onClose={() => setIsSupabaseConfigOpen(false)}
        language={language}
      />
    </div>
  );
}
