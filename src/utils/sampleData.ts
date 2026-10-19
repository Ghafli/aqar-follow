import { TenantRecord } from '../types';

export const INITIAL_SAMPLE_TENANTS: TenantRecord[] = [
  {
    id: 'tenant-001',
    name: 'سلطان بن فهد العتيبي',
    mobile: '+966505432198',
    idNumber: '1045892301',
    email: 's.alotaibi@example.com',
    propertyUnit: 'فيلا 14 - حي الملقا، الرياض',
    rentStartDate: '2026-01-01',
    rentEndDate: '2026-12-31',
    paymentFrequency: 'quarterly',
    rentAmountPerPeriod: 22500,
    paidInstallments: [1, 2, 3], // 4th installment on 2026-10-01 is unpaid and OVERDUE relative to Oct 19, 2026
    notes: [
      {
        id: 'note-1-1',
        timestamp: '2026-10-05T10:30:00Z',
        text: 'تم الاتصال بالمستأجر ولم يرد، تم إرسال رسالة تذكير أولى عبر واتساب.',
        category: 'call',
      },
      {
        id: 'note-1-2',
        timestamp: '2026-10-12T14:15:00Z',
        text: 'تواصل المستأجر هاتفياً واعتذر عن التأخير، ووعد بالتحويل البنكي يوم الأحد القادم عبر سريع.',
        category: 'promise',
      },
    ],
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-10-12T14:15:00Z',
  },
  {
    id: 'tenant-002',
    name: 'م. فهد عبدالرحمن الزهراني',
    mobile: '+966551122334',
    idNumber: '1089201948',
    email: 'fahad.alzahrani@example.com',
    propertyUnit: 'شقة فاخرة 302 - برج الكورنيش، جدة',
    rentStartDate: '2026-04-23',
    rentEndDate: '2027-04-22',
    paymentFrequency: 'monthly',
    rentAmountPerPeriod: 4500,
    paidInstallments: [1, 2, 3, 4, 5, 6], // Next installment 7 is on 2026-10-23 (in 4 days! DUE SOON)
    notes: [
      {
        id: 'note-2-1',
        timestamp: '2026-09-24T09:00:00Z',
        text: 'تم تأكيد استلام دفعة سبتمبر في الموعد بدون أي تأخير.',
        category: 'general',
      },
    ],
    createdAt: '2026-04-23T11:00:00Z',
    updatedAt: '2026-09-24T09:00:00Z',
  },
  {
    id: 'tenant-003',
    name: 'شركة البيان للتجارة والمقاولات',
    mobile: '+966548899001',
    idNumber: '7001928374',
    email: 'accounts@albayan-sa.com',
    propertyUnit: 'مكتب تجاري 12 - مجمع اليرموك، الخبر',
    rentStartDate: '2026-06-01',
    rentEndDate: '2027-05-31',
    paymentFrequency: 'semi-annually',
    rentAmountPerPeriod: 45000,
    paidInstallments: [1], // Next is installment 2 on 2026-12-01 (UPCOMING)
    notes: [
      {
        id: 'note-3-1',
        timestamp: '2026-06-01T12:00:00Z',
        text: 'توقيع العقد التجاري واستلام الدفعة الأولى بشيك مصدق وتسليم المفاتيح.',
        category: 'visit',
      },
    ],
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-01T12:00:00Z',
  },
  {
    id: 'tenant-004',
    name: 'د. نورة بنت خالد الغامدي',
    mobile: '+966567788990',
    idNumber: '1023456789',
    email: 'noura.alghamdi@example.com',
    propertyUnit: 'دور سكني علوي - حي النرجس، الرياض',
    rentStartDate: '2026-03-15',
    rentEndDate: '2027-03-14',
    paymentFrequency: 'quarterly',
    rentAmountPerPeriod: 16000,
    paidInstallments: [1, 2, 3], // Next is installment 4 on 2026-12-15 (UPCOMING)
    notes: [
      {
        id: 'note-4-1',
        timestamp: '2026-09-15T16:00:00Z',
        text: 'تم استلام الدفعة الثالثة مع طلب صيانة بسيطة لمكيف الصالة وتم إرسال الفني.',
        category: 'general',
      },
    ],
    createdAt: '2026-03-15T09:00:00Z',
    updatedAt: '2026-09-15T16:00:00Z',
  },
  {
    id: 'tenant-005',
    name: 'طارق عبدالعزيز الشهري',
    mobile: '+966532211445',
    idNumber: '1098765432',
    email: 'tariq.shehri@example.com',
    propertyUnit: 'استوديو مفروش 5 - حي الشاطئ، الدمام',
    rentStartDate: '2025-09-01',
    rentEndDate: '2026-08-31', // Contract ended August 2026 (COMPLETED)
    paymentFrequency: 'quarterly',
    rentAmountPerPeriod: 8000,
    paidInstallments: [1, 2, 3, 4],
    notes: [
      {
        id: 'note-5-1',
        timestamp: '2026-08-31T18:00:00Z',
        text: 'تم تسليم الشقة بالكامل واستلام المفاتيح وإرجاع مبلغ التأمين وإغلاق العقد بنجاح.',
        category: 'visit',
      },
    ],
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2026-08-31T18:00:00Z',
  },
];
