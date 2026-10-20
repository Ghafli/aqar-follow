import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { AuthUser, TenantRecord } from '../types';
import { 
  localSignIn, 
  localSignUp, 
  localGetSession, 
  localSetSession, 
  localClearSession, 
  localGetTenants, 
  localSaveTenant, 
  localDeleteTenant, 
  localSyncTenants 
} from './localVault';

// Storage keys for runtime configuration
const STORAGE_SUPABASE_URL_KEY = 'aqar_supabase_url_v1';
const STORAGE_SUPABASE_ANON_KEY = 'aqar_supabase_anon_key_v1';

export function isFakeOrInvalidUrl(url?: string | null): boolean {
  if (!url) return true;
  const lower = url.trim().toLowerCase();
  return (
    lower.includes('hts2sfjb6baktjds2dkjog') || 
    lower.includes('your-project') || 
    lower.includes('localhost') || 
    !lower.startsWith('https://')
  );
}

export function isFakeOrInvalidKey(key?: string | null): boolean {
  if (!key) return true;
  const trimmed = key.trim();
  return trimmed.includes('default_fixed_key') || trimmed.length < 20;
}

// Automatically purge any leftover fabricated or invalid keys in localStorage
if (typeof window !== 'undefined') {
  try {
    const storedUrl = localStorage.getItem(STORAGE_SUPABASE_URL_KEY) || '';
    const storedKey = localStorage.getItem(STORAGE_SUPABASE_ANON_KEY) || '';
    if (storedUrl && (isFakeOrInvalidUrl(storedUrl) || isFakeOrInvalidKey(storedKey))) {
      localStorage.removeItem(STORAGE_SUPABASE_URL_KEY);
      localStorage.removeItem(STORAGE_SUPABASE_ANON_KEY);
    }
  } catch {
    // Ignore storage errors in private browsing
  }
}

/**
 * Get active Supabase configuration (prefers env vars, falls back to runtime localStorage)
 */
export function getSupabaseConfig(): { url: string; anonKey: string; isFromEnv: boolean; isConfigured: boolean } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  if (envUrl && envKey && !isFakeOrInvalidUrl(envUrl) && !isFakeOrInvalidKey(envKey)) {
    return { url: envUrl, anonKey: envKey, isFromEnv: true, isConfigured: true };
  }

  const storedUrl = (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_SUPABASE_URL_KEY) || '' : '').trim();
  const storedKey = (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_SUPABASE_ANON_KEY) || '' : '').trim();

  if (storedUrl && storedKey && !isFakeOrInvalidUrl(storedUrl) && !isFakeOrInvalidKey(storedKey)) {
    return { url: storedUrl, anonKey: storedKey, isFromEnv: false, isConfigured: true };
  }

  // No real Supabase credentials configured yet
  return { url: '', anonKey: '', isFromEnv: false, isConfigured: false };
}

/**
 * Save runtime Supabase configuration to localStorage
 */
export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_SUPABASE_URL_KEY, url.trim());
    localStorage.setItem(STORAGE_SUPABASE_ANON_KEY, anonKey.trim());
    window.location.reload(); // Refresh to re-instantiate client cleanly
  }
}

/**
 * Clear stored Supabase configuration
 */
export function clearSupabaseConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_SUPABASE_URL_KEY);
    localStorage.removeItem(STORAGE_SUPABASE_ANON_KEY);
    window.location.reload();
  }
}

const currentConfig = getSupabaseConfig();
export const isSupabaseConfigured = currentConfig.isConfigured;

// Instantiate Supabase client ONLY when valid real credentials are provided
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(currentConfig.url, currentConfig.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function isNetworkError(errorMsg?: string | null): boolean {
  if (!errorMsg) return false;
  const lower = errorMsg.toLowerCase();
  return (
    lower.includes('load failed') ||
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('timeout') ||
    lower.includes('abort') ||
    lower.includes('could not resolve host')
  );
}

export function translateAuthError(rawError?: string | null): string {
  if (!rawError) return 'حدث خطأ غير متوقع أثناء المعالجة';
  const lower = rawError.toLowerCase();

  if (isNetworkError(rawError)) {
    return 'تعذر الاتصال بالخادم السحابي (خطأ شبكة). يرجى التحقق من اتصال الإنترنت أو استخدام وضع الحساب المحلي.';
  }
  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
  }
  if (lower.includes('user already registered') || lower.includes('already exists')) {
    return 'هذا البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول';
  }
  if (lower.includes('password should be at least')) {
    return 'كلمة المرور يجب أن لا تقل عن 6 أحرف';
  }
  if (lower.includes('email not confirmed')) {
    return 'يرجى مراجعة بريدك الإلكتروني لتأكيد الحساب';
  }
  return rawError;
}

/**
 * Test connectivity with provided or active Supabase credentials
 */
export async function testSupabaseConnection(customUrl?: string, customKey?: string): Promise<{ success: boolean; message: string; tableReady?: boolean }> {
  const url = (customUrl || currentConfig.url || '').trim();
  const key = (customKey || currentConfig.anonKey || '').trim();

  if (!url || !key) {
    return { success: false, message: 'رابط المشروع (URL) والمفتاح العام (Anon Key) مطلوبان.' };
  }
  if (!url.startsWith('https://')) {
    return { success: false, message: 'يجب أن يبدأ رابط Supabase بـ https://' };
  }
  if (isFakeOrInvalidUrl(url) || isFakeOrInvalidKey(key)) {
    return { success: false, message: 'يرجى إدخال رابط ومفتاح حقيقيين لمشروعك في Supabase.' };
  }

  try {
    const testClient = createClient(url, key);
    const { error: sessionError } = await testClient.auth.getSession();
    if (sessionError && !sessionError.message.includes('session')) {
      return { success: false, message: translateAuthError(sessionError.message) };
    }

    const { error: tableError } = await testClient.from('tenants').select('id').limit(1);
    if (tableError) {
      if (tableError.code === '42P01' || tableError.message.includes('relation "public.tenants" does not exist')) {
        return {
          success: true,
          tableReady: false,
          message: 'تم الاتصال بـ Supabase بنجاح! ولكن جدول "tenants" غير منشأ بعد. يرجى نسخ وتشغيل مخطط SQL.',
        };
      }
      return {
        success: true,
        tableReady: true,
        message: 'تم الاتصال بـ Supabase بنجاح! (' + tableError.message + ')',
      };
    }

    return {
      success: true,
      tableReady: true,
      message: 'الاتصال ناجح وقاعدة بيانات المستأجرين جاهزة تماماً!',
    };
  } catch (err: any) {
    const msg = err?.message || '';
    if (isNetworkError(msg)) {
      return { 
        success: false, 
        message: 'تعذر الاتصال بعنوان Supabase المدخل (خطأ شبكة). يرجى التأكد من صحة الرابط واتصالك بالإنترنت.' 
      };
    }
    return { success: false, message: translateAuthError(msg) };
  }
}

/**
 * Ready-to-run PostgreSQL schema with Row Level Security (RLS) for Supabase SQL Editor
 */
export const SUPABASE_SQL_SETUP = `-- ========================================================
-- AqarFollow (عقار فولو) - Supabase Database Schema
-- Run this script in your Supabase SQL Editor
-- ========================================================

-- 1. Create the tenants table
create table if not exists public.tenants (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  name text not null,
  mobile text not null,
  id_number text not null,
  email text default '',
  property_unit text default '',
  rent_start_date text not null,
  rent_end_date text not null,
  payment_frequency text not null,
  rent_amount_per_period numeric,
  paid_installments jsonb default '[]'::jsonb,
  notes jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable Row Level Security (RLS) so each user has isolated data
alter table public.tenants enable row level security;

-- 3. Drop existing policies if re-running
drop policy if exists "Users can only select their own tenants" on public.tenants;
drop policy if exists "Users can only insert their own tenants" on public.tenants;
drop policy if exists "Users can only update their own tenants" on public.tenants;
drop policy if exists "Users can only delete their own tenants" on public.tenants;

-- 4. Create RLS Policies ensuring zero data sharing between users
create policy "Users can only select their own tenants"
  on public.tenants for select
  using (auth.uid() = user_id);

create policy "Users can only insert their own tenants"
  on public.tenants for insert
  with check (auth.uid() = user_id);

create policy "Users can only update their own tenants"
  on public.tenants for update
  using (auth.uid() = user_id);

create policy "Users can only delete their own tenants"
  on public.tenants for delete
  using (auth.uid() = user_id);

-- 5. Create index for fast user queries
create index if not exists tenants_user_id_idx on public.tenants(user_id);
`;

/**
 * Format Supabase User into our AuthUser
 */
export function formatAuthUser(user: User | null): AuthUser | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
  };
}

/**
 * Sign In with Email & Password
 * Automatically falls back to local authentication if Supabase is offline or not configured.
 * Eliminates "Load failed" on mobile Safari and Chrome.
 */
export async function signInWithEmail(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
  // If real Supabase is configured, attempt Supabase cloud authentication
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { user: null, error: translateAuthError(error.message) };
      }

      if (data?.user) {
        const authUser = formatAuthUser(data.user);
        if (authUser) localSetSession(authUser);
        return { user: authUser, error: null };
      }
    } catch (err: any) {
      const msg = err?.message || '';
      console.warn('Supabase remote sign in error:', msg);
      if (isNetworkError(msg)) {
        // Fall back to local account if exists with this email
        const localAttempt = localSignIn(email, password);
        if (localAttempt.user) {
          return localAttempt;
        }
        return {
          user: null,
          error: 'تعذر الاتصال بخادم قاعدة البيانات (خطأ شبكة). يرجى التحقق من اتصال الإنترنت، أو إنشاء حساب محلي.',
        };
      }
      return { user: null, error: translateAuthError(msg) };
    }
  }

  // Supabase not configured: Use 100% reliable local authentication
  return localSignIn(email, password);
}

/**
 * Sign Up with Email & Password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName?: string
): Promise<{ user: AuthUser | null; error: string | null; needsEmailConfirmation?: boolean }> {
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
          data: {
            full_name: fullName?.trim() || '',
          },
        },
      });

      if (error) {
        return { user: null, error: translateAuthError(error.message) };
      }

      const needsEmailConfirmation = !data.session && Boolean(data.user);
      const authUser = formatAuthUser(data.user);
      if (authUser && !needsEmailConfirmation) {
        localSetSession(authUser);
      }
      return { 
        user: authUser, 
        error: null, 
        needsEmailConfirmation 
      };
    } catch (err: any) {
      const msg = err?.message || '';
      console.warn('Supabase remote sign up error:', msg);
      if (isNetworkError(msg)) {
        return {
          user: null,
          error: 'تعذر الاتصال بخادم التسجيل السحابي (خطأ شبكة). يمكنك استخدام الحساب المحلي في وضع عدم الاتصال.',
        };
      }
      return { user: null, error: translateAuthError(msg) };
    }
  }

  // Supabase not configured: Use local registration
  return localSignUp(email, password, fullName);
}

/**
 * Sign Out
 */
export async function signOutUser(): Promise<{ error: string | null }> {
  localClearSession();
  if (supabase && isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase sign out error:', err);
    }
  }
  return { error: null };
}

/**
 * Get current session user
 */
export async function getSessionUser(): Promise<AuthUser | null> {
  if (supabase && isSupabaseConfigured) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const u = formatAuthUser(session.user);
        if (u) localSetSession(u);
        return u;
      }
    } catch (err) {
      console.warn('Supabase getSession error, falling back to local session:', err);
    }
  }
  return localGetSession();
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void): (() => void) | null {
  if (supabase && isSupabaseConfigured) {
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        const u = formatAuthUser(session?.user || null);
        if (u) localSetSession(u);
        callback(u);
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      console.warn('Supabase auth state listener error:', err);
    }
  }

  return () => {};
}

/**
 * Fetch tenants belonging to the active user
 * Always checks local cache and synchronizes with Supabase if online.
 */
export async function fetchTenantsFromSupabase(userId?: string): Promise<TenantRecord[] | null> {
  const localData = localGetTenants(userId);

  if (supabase && isSupabaseConfigured) {
    try {
      let query = supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (!error && data) {
        const mapped = data.map((row: any): TenantRecord => ({
          id: row.id,
          userId: row.user_id,
          name: row.name,
          mobile: row.mobile,
          idNumber: row.id_number,
          email: row.email || '',
          propertyUnit: row.property_unit || '',
          rentStartDate: row.rent_start_date,
          rentEndDate: row.rent_end_date,
          paymentFrequency: row.payment_frequency,
          rentAmountPerPeriod: row.rent_amount_per_period ? Number(row.rent_amount_per_period) : undefined,
          paidInstallments: Array.isArray(row.paid_installments) ? row.paid_installments : [],
          notes: Array.isArray(row.notes) ? row.notes : [],
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
        localSyncTenants(mapped, userId);
        return mapped;
      }
    } catch (err) {
      console.warn('Failed to fetch from Supabase, returning local data:', err);
    }
  }

  return localData;
}

/**
 * Insert or update tenant linked to user_id
 */
export async function upsertTenantToSupabase(tenant: TenantRecord, userId?: string): Promise<boolean> {
  // Always save locally first so user never loses their data
  localSaveTenant(tenant, userId);

  if (supabase && isSupabaseConfigured) {
    try {
      const row: any = {
        id: tenant.id,
        name: tenant.name,
        mobile: tenant.mobile,
        id_number: tenant.idNumber,
        email: tenant.email,
        property_unit: tenant.propertyUnit,
        rent_start_date: tenant.rentStartDate,
        rent_end_date: tenant.rentEndDate,
        payment_frequency: tenant.paymentFrequency,
        rent_amount_per_period: tenant.rentAmountPerPeriod,
        paid_installments: tenant.paidInstallments || [],
        notes: tenant.notes || [],
        created_at: tenant.createdAt,
        updated_at: tenant.updatedAt || new Date().toISOString(),
      };

      if (userId || tenant.userId) {
        row.user_id = userId || tenant.userId;
      }

      const { error } = await supabase.from('tenants').upsert(row, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase remote upsert error:', error);
      }
    } catch (err) {
      console.warn('Failed to upsert tenant to Supabase:', err);
    }
  }

  return true;
}

/**
 * Delete a tenant
 */
export async function deleteTenantFromSupabase(tenantId: string): Promise<boolean> {
  localDeleteTenant(tenantId);

  if (supabase && isSupabaseConfigured) {
    try {
      await supabase.from('tenants').delete().eq('id', tenantId);
    } catch (err) {
      console.warn('Failed to delete tenant from Supabase:', err);
    }
  }

  return true;
}
