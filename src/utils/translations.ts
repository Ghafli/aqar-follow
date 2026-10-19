import { PaymentFrequency, PaymentStatus } from '../types';

export const translations = {
  ar: {
    brandName: 'عقار فولو',
    brandTagline: 'نظام متابعة وتذكير دفعات الإيجار',
    languageToggle: 'English',
    languageLabel: 'اللغة',

    // Top actions
    addTenant: 'إضافة مستأجر جديد',
    exportBackup: 'تصدير نسخة احتياطية',
    importBackup: 'استيراد نسخة',
    resetData: 'استعادة البيانات التجريبية',

    // Mobile Navigation Bar
    mobileNav: {
      all: 'الكل',
      overdue: 'المتأخرات',
      add: 'إضافة',
      dueSoon: 'قريباً',
      more: 'خيارات',
    },

    // Dashboard metrics
    metrics: {
      totalTenants: 'إجمالي المستأجرين',
      overduePayments: 'دفعات متأخرة',
      dueThisWeek: 'مستحقة خلال 7 أيام',
      upToDate: 'دفعات منتظمة وقادمة',
      completedContracts: 'عقود منتهية',
    },

    // Search and filters
    searchPlaceholder: 'ابحث باسم المستأجر، رقم الجوال، أو الهوية / الإقامة / السجل...',
    filterByStatus: 'تصفية حسب الحالة',
    allStatuses: 'الكل',
    statusLabels: {
      overdue: 'متأخر',
      due_soon: 'مستحق قريباً',
      upcoming: 'قادم',
      completed: 'منتهي',
    } as Record<PaymentStatus, string>,

    frequencyLabels: {
      'monthly': 'شهري (كل شهر)',
      'quarterly': 'ربع سنوي (كل 3 أشهر)',
      'semi-annually': 'نصف سنوي (كل 6 أشهر)',
      'annually': 'سنوي (كل 12 شهر)',
    } as Record<PaymentFrequency, string>,

    frequencyShort: {
      'monthly': 'شهري',
      'quarterly': 'ربع سنوي',
      'semi-annually': 'نصف سنوي',
      'annually': 'سنوي',
    } as Record<PaymentFrequency, string>,

    // Tenant Card & Table
    tenantCard: {
      nextPayment: 'الدفعة القادمة',
      dueOn: 'تستحق في',
      daysLeft: 'متبقي {days} يوم',
      daysOverdue: 'متأخر منذ {days} يوم',
      dueToday: 'مستحقة اليوم!',
      noUpcoming: 'لا توجد دفعات قادمة',
      notesCount: '{count} ملاحظة تواصل',
      propertyUnit: 'الوحدة / العقار',
      idNumber: 'الهوية / الإقامة / السجل',
      phone: 'الجوال',
      email: 'البريد',
      contractPeriod: 'فترة الإيجار',
      from: 'من',
      to: 'إلى',
      frequency: 'دورية الدفع',
      installmentsProgress: 'سداد الدفعات',
      paidOf: '{paid} من {total} مسددة',
      actions: 'إجراءات سريعة',
      whatsapp: 'تذكير واتساب',
      call: 'اتصال هاتف',
      addNote: 'إضافة ملاحظة',
      viewSchedule: 'جدول الدفعات',
      edit: 'تعديل',
      delete: 'حذف',
      deleteConfirm: 'هل أنت متأكد من حذف سجل المستأجر؟',
    },

    // View toggles
    viewCards: 'عرض البطاقات',
    viewTable: 'عرض الجدول',

    // Modals
    tenantForm: {
      addTitle: 'إضافة مستأجر جديد',
      editTitle: 'تعديل بيانات المستأجر',
      nameLabel: 'اسم المستأجر الكامل',
      namePlaceholder: 'مثال: محمد عبدالله الشمري أو شركة الأفق',
      mobileLabel: 'رقم الجوال (مع كود الدولة)',
      mobilePlaceholder: 'مثال: +966501234567',
      idNumberLabel: 'رقم الهوية الوطنية / الإقامة / السجل التجاري',
      idNumberPlaceholder: 'مثال: 1087654321 أو 7001234567',
      emailLabel: 'البريد الإلكتروني',
      emailPlaceholder: 'tenant@example.com',
      propertyUnitLabel: 'العقار / رقم الوحدة (اختياري)',
      propertyUnitPlaceholder: 'مثال: شقة 4B - برج النرجس، الرياض',
      rentStartDateLabel: 'تاريخ بداية الإيجار',
      rentEndDateLabel: 'تاريخ نهاية الإيجار',
      frequencyLabel: 'دورية سداد الإيجار',
      amountLabel: 'قيمة الدفعة الواحدة (اختياري بالريال)',
      amountPlaceholder: 'مثال: 12500',
      cancelBtn: 'إلغاء',
      saveBtn: 'حفظ المستأجر',
      updateBtn: 'تحديث البيانات',
      schedulePreviewTitle: 'المعاينة التلقائية لجدول الدفعات',
      schedulePreviewDesc: 'يتم احتساب تواريخ الاستحقاق تلقائياً بناءً على بداية ونهاية الإيجار والدورية:',
      installmentHeader: 'الدفعة',
      dateHeader: 'تاريخ الاستحقاق',
      statusHeader: 'الحالة التقديرية',
      validationErrors: {
        nameRequired: 'يرجى إدخال اسم المستأجر',
        mobileRequired: 'يرجى إدخال رقم جوال صحيح (10 أرقام على الأقل)',
        idRequired: 'يرجى إدخال رقم الهوية أو الإقامة أو السجل التجاري',
        emailInvalid: 'يرجى إدخال بريد إلكتروني صحيح',
        datesRequired: 'يرجى تحديد تاريخ بداية ونهاية الإيجار',
        datesInvalid: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية',
      },
    },

    // Notes Drawer
    notesDrawer: {
      title: 'سجل التواصل والمتابعة',
      tenantSubtitle: 'متابعة المستأجر:',
      newNotePlaceholder: 'اكتب ملاحظة جديدة (مثال: تم الاتصال، وعد بالتحويل عبر سريع يوم الأحد)...',
      addNoteBtn: 'تسجيل الملاحظة',
      emptyNotes: 'لا توجد ملاحظات مسجلة بعد. ابدأ بتسجيل أول تواصل مع المستأجر.',
      quickShortcuts: 'عبارات سريعة:',
      shortcuts: [
        'تم الاتصال وتذكير المستأجر بالدفعة',
        'لم يرد على الاتصال، تم إرسال رسالة تذكير',
        'وعد بالتحويل البنكي خلال يومين',
        'طلب مهلة إضافية حتى نهاية الأسبوع',
        'تم تأكيد استلام الدفعة بنجاح',
      ],
      quickWhatsApp: 'إرسال تذكير واتساب',
      timestampPrefix: 'بتاريخ',
    },

    // Schedule Modal
    scheduleModal: {
      title: 'جدول استحقاق دفعات الإيجار',
      tenantSubtitle: 'عقد المستأجر:',
      summaryContract: 'مدة العقد الكلية:',
      frequencyNote: 'دورية السداد:',
      totalInstallmentsCount: 'إجمالي الدفعات المتوقعة:',
      markPaid: 'تحديد كمسددة',
      markUnpaid: 'إلغاء التسديد',
      installmentCol: 'رقم الدفعة',
      dueDateCol: 'تاريخ الاستحقاق',
      statusCol: 'الحالة',
      actionCol: 'حالة الدفعة',
      paidBadge: 'تم السداد',
      unpaidBadge: 'معلقة',
      closeBtn: 'إغلاق',
      printSchedule: 'طباعة الجدول',
    },

    // WhatsApp Modal
    whatsappModal: {
      title: 'إرسال تذكير عبر واتساب',
      tenantName: 'المستأجر:',
      phoneNumber: 'رقم الواتساب:',
      templateChoice: 'اختر لغة الرسالة:',
      templateAr: 'الرسالة باللغة العربية',
      templateEn: 'الرسالة باللغة الإنجليزية',
      previewLabel: 'معاينة نص الرسالة قبل الإرسال:',
      sendViaWhatsApp: 'فتح ومراسلة عبر واتساب',
      copyText: 'نسخ النص',
      copied: 'تم النسخ بنجاح!',
      closeBtn: 'إلغاء',
    },

    // Empty states
    emptyState: {
      noResultsTitle: 'لم يتم العثور على مستأجرين',
      noResultsDesc: 'جرب تغيير عبارة البحث أو فلتر الحالة.',
      clearFilters: 'إعادة ضبط الفلاتر',
      noTenantsTitle: 'لا يوجد مستأجرين مضافين حالياً',
      noTenantsDesc: 'ابدأ بإضافة أول مستأجر لتوليد جدول الدفعات والتنبيهات تلقائياً.',
      addFirstTenant: 'إضافة أول مستأجر الآن',
    },
  },

  en: {
    brandName: 'AqarFollow',
    brandTagline: 'Rent Payment Reminder & Follow-up System',
    languageToggle: 'العربية',
    languageLabel: 'Language',

    // Top actions
    addTenant: 'Add New Tenant',
    exportBackup: 'Export Backup',
    importBackup: 'Import Backup',
    resetData: 'Load Sample Tenants',

    // Mobile Navigation Bar
    mobileNav: {
      all: 'All',
      overdue: 'Overdue',
      add: 'Add',
      dueSoon: 'Due Soon',
      more: 'Options',
    },

    // Dashboard metrics
    metrics: {
      totalTenants: 'Total Active Tenants',
      overduePayments: 'Overdue Payments',
      dueThisWeek: 'Due Within 7 Days',
      upToDate: 'Up to Date & Upcoming',
      completedContracts: 'Completed Leases',
    },

    // Search and filters
    searchPlaceholder: 'Search by tenant name, mobile, or National ID / Iqama / CR...',
    filterByStatus: 'Filter by Status',
    allStatuses: 'All',
    statusLabels: {
      overdue: 'Overdue',
      due_soon: 'Due Soon',
      upcoming: 'Upcoming',
      completed: 'Completed',
    } as Record<PaymentStatus, string>,

    frequencyLabels: {
      'monthly': 'Monthly (Every 1 month)',
      'quarterly': 'Quarterly (Every 3 months)',
      'semi-annually': 'Semi-Annually (Every 6 months)',
      'annually': 'Annually (Every 12 months)',
    } as Record<PaymentFrequency, string>,

    frequencyShort: {
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'semi-annually': 'Semi-Annually',
      'annually': 'Annually',
    } as Record<PaymentFrequency, string>,

    // Tenant Card & Table
    tenantCard: {
      nextPayment: 'Next Payment Due',
      dueOn: 'Due on',
      daysLeft: '{days} days remaining',
      daysOverdue: '{days} days overdue',
      dueToday: 'Due Today!',
      noUpcoming: 'No upcoming payments',
      notesCount: '{count} follow-up notes',
      propertyUnit: 'Property / Unit',
      idNumber: 'National ID / Iqama / CR',
      phone: 'Mobile',
      email: 'Email',
      contractPeriod: 'Lease Period',
      from: 'From',
      to: 'To',
      frequency: 'Schedule Cadence',
      installmentsProgress: 'Installments Paid',
      paidOf: '{paid} of {total} paid',
      actions: 'Quick Actions',
      whatsapp: 'WhatsApp Reminder',
      call: 'Phone Call',
      addNote: 'Add Note',
      viewSchedule: 'View Schedule',
      edit: 'Edit',
      delete: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this tenant record?',
    },

    // View toggles
    viewCards: 'Cards View',
    viewTable: 'Table View',

    // Modals
    tenantForm: {
      addTitle: 'Add New Tenant',
      editTitle: 'Edit Tenant Details',
      nameLabel: 'Tenant Full Name',
      namePlaceholder: 'e.g. Mohammed Al-Shammari or Horizon Est.',
      mobileLabel: 'Mobile Number (with country code)',
      mobilePlaceholder: 'e.g. +966501234567',
      idNumberLabel: 'National ID / Iqama / Commercial Reg. Number',
      idNumberPlaceholder: 'e.g. 1087654321 or 7001234567',
      emailLabel: 'Email Address',
      emailPlaceholder: 'tenant@example.com',
      propertyUnitLabel: 'Property / Unit Name (optional)',
      propertyUnitPlaceholder: 'e.g. Unit 4B - Al Narjis Tower, Riyadh',
      rentStartDateLabel: 'Rent Start Date',
      rentEndDateLabel: 'Rent End Date',
      frequencyLabel: 'Payment Frequency',
      amountLabel: 'Installment Amount (optional SAR)',
      amountPlaceholder: 'e.g. 12500',
      cancelBtn: 'Cancel',
      saveBtn: 'Save Tenant',
      updateBtn: 'Update Tenant',
      schedulePreviewTitle: 'Automated Payment Schedule Preview',
      schedulePreviewDesc: 'Milestone due dates are generated automatically based on lease period and frequency:',
      installmentHeader: 'Installment',
      dateHeader: 'Due Date',
      statusHeader: 'Projected Status',
      validationErrors: {
        nameRequired: 'Please enter tenant full name',
        mobileRequired: 'Please enter a valid mobile number (at least 10 digits)',
        idRequired: 'Please enter ID, Iqama, or Commercial Registration number',
        emailInvalid: 'Please enter a valid email address',
        datesRequired: 'Please specify both rent start and end dates',
        datesInvalid: 'End date must be chronologically after start date',
      },
    },

    // Notes Drawer
    notesDrawer: {
      title: 'Follow-up Notes & Communication Log',
      tenantSubtitle: 'Tenant:',
      newNotePlaceholder: 'Write a follow-up note (e.g., Called tenant, agreed to wire transfer on Sunday)...',
      addNoteBtn: 'Log Note',
      emptyNotes: 'No follow-up notes recorded yet. Log your first communication.',
      quickShortcuts: 'Quick Shortcuts:',
      shortcuts: [
        'Called and reminded tenant of upcoming installment',
        'No answer on call; sent reminder SMS / WhatsApp',
        'Tenant promised wire transfer within 2 business days',
        'Requested grace period until end of the week',
        'Confirmed payment received successfully',
      ],
      quickWhatsApp: 'Send WhatsApp Reminder',
      timestampPrefix: 'Logged on',
    },

    // Schedule Modal
    scheduleModal: {
      title: 'Rent Payment Schedule & Milestones',
      tenantSubtitle: 'Lease Agreement:',
      summaryContract: 'Total Lease Duration:',
      frequencyNote: 'Payment Frequency:',
      totalInstallmentsCount: 'Total Scheduled Installments:',
      markPaid: 'Mark Paid',
      markUnpaid: 'Unmark',
      installmentCol: 'Installment #',
      dueDateCol: 'Due Date',
      statusCol: 'Status',
      actionCol: 'Payment State',
      paidBadge: 'Paid',
      unpaidBadge: 'Pending',
      closeBtn: 'Close',
      printSchedule: 'Print Schedule',
    },

    // WhatsApp Modal
    whatsappModal: {
      title: 'Dispatch WhatsApp Reminder',
      tenantName: 'Tenant:',
      phoneNumber: 'WhatsApp Number:',
      templateChoice: 'Select Message Language:',
      templateAr: 'Arabic Message Template',
      templateEn: 'English Message Template',
      previewLabel: 'Message Preview Before Sending:',
      sendViaWhatsApp: 'Open in WhatsApp',
      copyText: 'Copy Text',
      copied: 'Copied to clipboard!',
      closeBtn: 'Cancel',
    },

    // Empty states
    emptyState: {
      noResultsTitle: 'No Tenants Found',
      noResultsDesc: 'Try adjusting your search query or status filter.',
      clearFilters: 'Reset Filters',
      noTenantsTitle: 'No Tenants Added Yet',
      noTenantsDesc: 'Add your first tenant to automatically generate their payment schedule and reminders.',
      addFirstTenant: 'Add First Tenant Now',
    },
  },
};
