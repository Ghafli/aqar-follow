export type Language = 'ar' | 'en';

export type PaymentFrequency = 'monthly' | 'quarterly' | 'semi-annually' | 'annually';

export type PaymentStatus = 'overdue' | 'due_soon' | 'upcoming' | 'completed';

export interface FollowUpNote {
  id: string;
  timestamp: string; // ISO string
  text: string;
  category?: 'call' | 'whatsapp' | 'promise' | 'visit' | 'general';
}

export interface PaymentMilestone {
  installmentNumber: number;
  dueDate: string; // YYYY-MM-DD
  status: PaymentStatus;
  isPaid?: boolean;
  paidDate?: string;
}

export interface TenantRecord {
  id: string;
  userId?: string;
  name: string;
  mobile: string; // e.g. +966501234567
  idNumber: string; // National ID, Iqama, or Commercial Registration
  email: string;
  propertyUnit: string; // e.g. "Villa 12 - Al Malqa, Riyadh"
  rentStartDate: string; // YYYY-MM-DD
  rentEndDate: string; // YYYY-MM-DD
  paymentFrequency: PaymentFrequency;
  rentAmountPerPeriod?: number; // In SAR (optional helper)
  notes: FollowUpNote[];
  paidInstallments: number[]; // Array of installment numbers marked as paid
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export interface DashboardMetrics {
  totalTenants: number;
  overdueCount: number;
  dueSoonCount: number;
  upcomingCount: number;
  completedCount: number;
}
