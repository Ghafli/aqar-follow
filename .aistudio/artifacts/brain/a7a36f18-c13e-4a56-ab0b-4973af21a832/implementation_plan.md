# AqarFollow - Real Estate Rent Payment Reminder & Follow-up System

A clean, responsive, bilingual (Arabic RTL & English LTR) property management follow-up web application tailored for landlords and property managers to track upcoming tenant rent due dates, maintain chronological communication logs, and dispatch instant payment reminders via WhatsApp.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed in Phase 1 and will govern the application's design and feature implementation:

- **Visual Theme & Styling**: Modern Saudi Real Estate Emerald Slate aesthetic with deep slate neutral canvas (`#0F172A`), rich emerald green accents (`#059669` / `#10B981`), crisp border dividers, and high legibility typography in both Arabic (Cairo / IBM Plex Sans Arabic styling) and English.
- **Tenant Communication**: Direct WhatsApp click-to-chat integration featuring customizable, pre-filled bilingual message templates (Arabic and English) with tenant name, due amount (if recorded), and due date, alongside phone dialing options.
- **Initial Data State**: Pre-loaded with realistic Saudi market sample tenant records (Riyadh, Jeddah, Al-Khobar addresses) reflecting diverse payment cycles (Overdue, Due Soon within 7 days, Upcoming, and Completed) for immediate testing and verification.
- **Data Persistence**: Robust browser `localStorage` repository with automated validation, schema migration, reset to sample defaults, and export/import JSON capability for zero-friction client-side backups.

---

## 1. Overview & Core Concept

- **What It Does**: Automates the calculation of rent due dates across arbitrary rental periods and payment frequencies (Monthly, Quarterly, Semi-Annually, Annually). Monitors real-time payment status (Overdue, Due Soon $\le 7$ days, Upcoming, and Rent Ended), provides quick-action follow-up logging with timestamps, and generates direct WhatsApp reminders without needing accounting or payment processing complexity.
- **Target Audience / Persona**: Real estate property managers, commercial leasing agents, building superintendents, and private landlords across Saudi Arabia and the GCC who need a fast, reliable reminder tracker to keep tenancy agreements on schedule.
- **Key Value**: Eliminates missed payment follow-ups and spreadsheet confusion through automated schedule projections and one-click communication logs.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Dashboard Overview**: Landlord lands on an executive overview with KPI metric cards (Total Tenants, Overdue Payments, Due This Week, Up to Date) and quick filter chips.
2. **Adding a Tenant**: Intuitive modal form collecting Tenant Name, Saudi Mobile (`+966...`), National ID / Iqama / Commercial Registration, Email, Rent Start Date, Rent End Date, and Payment Cadence (Monthly, Quarterly, Semi-Annually, Annually). The system renders an instant preview of all projected payment milestones in the form before saving.
3. **Follow-Up Logging**: Clicking "Add Note" opens a dedicated quick-entry drawer to record notes (e.g., "Called tenant, agreed to transfer via SARIE on Sunday"). Notes are timestamped and preserved in reverse-chronological order.
4. **WhatsApp Dispatch**: One-click WhatsApp action opens `https://wa.me/...` with pre-formatted bilingual reminder text containing tenant name and upcoming payment due date.
5. **Schedule Inspection**: "View Schedule" modal reveals every payment milestone throughout the lease with milestone completion check-offs and overdue warnings.
6. **Language Toggle**: Header toggle between `العربية (RTL)` and `English (LTR)` instantly adapts typography, alignment, date formatting (Gregorian and Arabic localized dates), and UI labels.

### Visual Identity & Theme
- **Color Palette (60-30-10 Rule)**:
  - Canvas (60%): Clean Slate-50 light mode (`#F8FAFC`) / Slate-950 dark mode, pristine white card surfaces (`#FFFFFF`).
  - Structure (30%): Hairline borders (`border-slate-200`), muted slate secondary text (`#64748B`), subtle background fills (`bg-slate-50`).
  - Accents (10%): Saudi Emerald Green (`#059669` / `#10B981`) for primary actions and active states; semantic Crimson (`#DC2626`) for overdue alerts and Amber (`#D97706`) for payments due within 7 days.
- **Zero-Pill Discipline & Tabular Figures**:
  - Metadata rendered with unboxed clean text separated by typographic middots (`·`).
  - Filter bars styled as clean segmented control button bars.
  - All phone numbers, National IDs, and dates use `font-mono tabular-nums` to guarantee vertical alignment.
- **Bilingual Typography**:
  - Arabic: Modern Arabic sans-serif styling with optimal line-height and natural RTL layout flow (`dir="rtl"`).
  - English: Clean geometric sans-serif (`Plus Jakarta Sans` / `Outfit` stack).

---

## 3. Key Product Decisions & Trade-Offs

- **Automated Milestone Projection Algorithm**:
  - *Chosen Approach*: Pure deterministic date-arithmetic generator iterating from `Rent Start Date` to `Rent End Date` using month increments (1, 3, 6, 12 months) preserving original day-of-month (with month-end clamping).
  - *Why*: Instant calculation without network lag; enables full visibility into all 4 or 12 installments upon contract creation.
- **Client-Side LocalStorage with Backup Export**:
  - *Chosen Approach*: Browser `localStorage` storage key `aqar_tenant_records_v1` accompanied by JSON export/import actions.
  - *Why*: Satisfies zero-dependency prompt requirement while preventing data loss through exportable backups.
- **Follow-up Interaction Model**:
  - *Chosen Approach*: Granular note objects with exact ISO timestamps, author tag, and note text, displayed as a vertical timeline.
  - *Why*: Gives landlords an audit trail of every conversation when following up on overdue rent.

---

## 4. Technical Architecture & Data Strategy

### System Layout & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          App Container                                 │
│  - Language State (AR/EN, RTL/LTR)                                    │
│  - Filter & Search State (Status, Query, Sorting)                     │
│  - Tenants State (LocalStorage Sync)                                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
┌──────────────────┐    ┌───────────────────────┐    ┌─────────────────────┐
│ Header Bar       │    │ Dashboard Stats       │    │ Search & Filter Bar │
│ - Brand Wordmark │    │ - Total Tenants       │    │ - Search Input      │
│ - Language AR/EN │    │ - Overdue Alerts      │    │ - Status Filter     │
│ - Add Tenant CTA │    │ - Due This Week       │    │ - Export / Backup   │
└──────────────────┘    └───────────────────────┘    └─────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Tenant Grid / Table View                                               │
│ - Tenant Card with Name, Iqama/CR, Phone, Email                       │
│ - Next Due Date (with relative days countdown)                         │
│ - Payment Frequency & Status Badge (Overdue / Due Soon / Upcoming)    │
│ - Action Menu: Add Note | WhatsApp Reminder | Schedule | Edit | Delete│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    ▼                               ▼                               ▼
┌──────────────────┐    ┌───────────────────────┐    ┌─────────────────────┐
│ Tenant Form Modal│    │ Schedule Detail Modal │    │ Follow-Up Log Drawer│
│ - Input Controls │    │ - Milestone Timeline  │    │ - History Timeline  │
│ - Auto Schedule  │    │ - Status Check-off    │    │ - New Note Input    │
│   Preview Matrix │    │ - Print / Export      │    │ - Quick WhatsApp    │
└──────────────────┘    └───────────────────────┘    └─────────────────────┘
```

### Data Model

```typescript
export type PaymentFrequency = 'monthly' | 'quarterly' | 'semi-annually' | 'annually';

export type PaymentStatus = 'overdue' | 'due_soon' | 'upcoming' | 'completed';

export interface FollowUpNote {
  id: string;
  timestamp: string; // ISO string
  text: string;
}

export interface PaymentMilestone {
  installmentNumber: number;
  dueDate: string; // YYYY-MM-DD
  status: PaymentStatus;
  isPaid?: boolean;
}

export interface TenantRecord {
  id: string;
  name: string;
  mobile: string; // e.g. +966501234567
  idNumber: string; // National ID / Iqama / CR
  email: string;
  rentStartDate: string; // YYYY-MM-DD
  rentEndDate: string; // YYYY-MM-DD
  paymentFrequency: PaymentFrequency;
  notes: FollowUpNote[];
  createdAt: string;
  updatedAt: string;
}
```

### Automated Schedule Calculation Algorithm
For any tenant with `rentStartDate`, `rentEndDate`, and `paymentFrequency`:
1. Frequency interval in months: Monthly = 1, Quarterly = 3, Semi-Annually = 6, Annually = 12.
2. Generate installment milestone dates starting from `rentStartDate`, adding step months until `date >= rentEndDate`.
3. Locate the earliest unpaid milestone:
   - If milestone date is in the past ($< \text{today}$): Status = **Overdue (متأخر)**.
   - If milestone date is within the next 7 days ($0 \le \text{date} - \text{today} \le 7$): Status = **Due Soon (مستحق قريباً)**.
   - If milestone date is $> 7$ days away: Status = **Upcoming (قادم)**.
   - If $\text{today} > \text{rentEndDate}$: Status = **Completed / Rent Ended (منتهي)**.
