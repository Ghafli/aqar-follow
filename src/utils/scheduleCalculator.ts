import { PaymentFrequency, PaymentMilestone, PaymentStatus, TenantRecord } from '../types';

/**
 * Format a Date object to YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse YYYY-MM-DD safely into Date at local midnight
 */
export function parseDateISO(isoString: string): Date {
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

/**
 * Add months to a date, handling month-end overflow correctly
 * e.g., Jan 31 + 1 month -> Feb 28/29
 */
export function addMonthsSafe(baseDate: Date, monthsToAdd: number): Date {
  const target = new Date(baseDate.getTime());
  const expectedMonth = (target.getMonth() + monthsToAdd) % 12;
  const targetMonthIndex = (expectedMonth + 12) % 12;
  const targetYear = target.getFullYear() + Math.floor((target.getMonth() + monthsToAdd) / 12);
  const originalDay = baseDate.getDate();

  // Find max days in target month
  const maxDays = new Date(targetYear, targetMonthIndex + 1, 0).getDate();
  const clampedDay = Math.min(originalDay, maxDays);

  return new Date(targetYear, targetMonthIndex, clampedDay);
}

/**
 * Get interval in months for each frequency
 */
export function getFrequencyMonthStep(frequency: PaymentFrequency): number {
  switch (frequency) {
    case 'monthly':
      return 1;
    case 'quarterly':
      return 3;
    case 'semi-annually':
      return 6;
    case 'annually':
      return 12;
    default:
      return 1;
  }
}

/**
 * Generate all payment milestones for a rental period and frequency
 */
export function calculatePaymentSchedule(
  startDateStr: string,
  endDateStr: string,
  frequency: PaymentFrequency,
  paidInstallmentNumbers: number[] = [],
  currentDateOverride?: Date
): PaymentMilestone[] {
  if (!startDateStr || !endDateStr) return [];

  const startDate = parseDateISO(startDateStr);
  const endDate = parseDateISO(endDateStr);

  if (endDate < startDate) return [];

  const monthStep = getFrequencyMonthStep(frequency);
  const today = currentDateOverride ? new Date(currentDateOverride) : new Date();
  today.setHours(0, 0, 0, 0);

  const milestones: PaymentMilestone[] = [];
  let currentMilestoneDate = new Date(startDate.getTime());
  let installment = 1;

  // Maximum safeguard to avoid infinite loop (e.g. max 120 payments / 10 years monthly)
  const maxInstallments = 120;

  while (currentMilestoneDate <= endDate && installment <= maxInstallments) {
    const dueStr = formatDateISO(currentMilestoneDate);
    const isPaid = paidInstallmentNumbers.includes(installment);
    const dueDate = parseDateISO(dueStr);
    dueDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let status: PaymentStatus;
    if (isPaid) {
      status = 'completed';
    } else if (today > endDate) {
      status = 'completed';
    } else if (diffDays < 0) {
      status = 'overdue';
    } else if (diffDays >= 0 && diffDays <= 7) {
      status = 'due_soon';
    } else {
      status = 'upcoming';
    }

    milestones.push({
      installmentNumber: installment,
      dueDate: dueStr,
      status,
      isPaid,
    });

    installment++;
    currentMilestoneDate = addMonthsSafe(startDate, (installment - 1) * monthStep);
  }

  return milestones;
}

/**
 * Determine overall tenant status & identify the next due payment
 */
export function evaluateTenantStatus(
  tenant: Pick<TenantRecord, 'rentStartDate' | 'rentEndDate' | 'paymentFrequency' | 'paidInstallments'>,
  currentDateOverride?: Date
): {
  status: PaymentStatus;
  nextMilestone: PaymentMilestone | null;
  daysRemaining: number | null;
  allMilestones: PaymentMilestone[];
  completedCount: number;
  totalInstallments: number;
} {
  const today = currentDateOverride ? new Date(currentDateOverride) : new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = parseDateISO(tenant.rentEndDate);
  endDate.setHours(0, 0, 0, 0);

  const allMilestones = calculatePaymentSchedule(
    tenant.rentStartDate,
    tenant.rentEndDate,
    tenant.paymentFrequency,
    tenant.paidInstallments || [],
    today
  );

  const completedCount = allMilestones.filter((m) => m.isPaid).length;

  // 1. If contract has ended
  if (today > endDate) {
    return {
      status: 'completed',
      nextMilestone: null,
      daysRemaining: null,
      allMilestones,
      completedCount,
      totalInstallments: allMilestones.length,
    };
  }

  // 2. Find earliest unpaid milestone
  const unpaidMilestones = allMilestones.filter((m) => !m.isPaid);

  if (unpaidMilestones.length === 0) {
    return {
      status: 'completed',
      nextMilestone: null,
      daysRemaining: null,
      allMilestones,
      completedCount,
      totalInstallments: allMilestones.length,
    };
  }

  const nextMilestone = unpaidMilestones[0];
  const nextDueDate = parseDateISO(nextMilestone.dueDate);
  nextDueDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let status: PaymentStatus;
  if (diffDays < 0) {
    status = 'overdue';
  } else if (diffDays <= 7) {
    status = 'due_soon';
  } else {
    status = 'upcoming';
  }

  return {
    status,
    nextMilestone,
    daysRemaining: diffDays,
    allMilestones,
    completedCount,
    totalInstallments: allMilestones.length,
  };
}
