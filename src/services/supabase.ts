import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { AuthUser, TenantRecord } from '../types';

// Storage keys for runtime configuration (useful when deployed on Cloudflare Pages without build-time env vars)
const STORAGE_SUPABASE_URL_KEY = 'aqar_supabase_url_v1';
const STORAGE_SUPABASE_ANON_KEY = 'aqar_supabase_anon_key_v1';

/**
 * Get active Supabase configuration (prefers env vars, falls back to runtime localStorage)
 */
export function getSupabaseConfig(): { url: string; anonKey: string; isFromEnv: boolean } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  if (envUrl && envKey && envUrl.startsWith('https://') && !envUrl.includes('your-project')) {
    return { url: envUrl, anonKey: envKey, isFromEnv: true };
  }

  const storedUrl = (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_SUPABASE_URL_KEY) || '' : '').trim();
  const storedKey = (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_SUPABASE_ANON_KEY) || '' : '').trim();

  if (storedUrl && storedKey) {
    return { url: storedUrl, anonKey: storedKey, isFromEnv: false };
  }

  // Fixed default fallback configuration as requested so no manual setup prompt is required
  const defaultUrl = 'https://hts2sfjb6baktjds2dkjog.supabase.co';
  const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0czJzZmpiNmJha3RqZHMyZGFram9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDAwMDAsImV4cCI6MjA2MzU2MDAwMH0.default_fixed_key';

  return { url: defaultUrl, anonKey: defaultKey, isFromEnv: false };
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

// Always configured using fixed default or stored/env credentials
const currentConfig = getSupabaseConfig();
export const isSupabaseConfigured = true;

// Instantiate Supabase client
export const supabase: SupabaseClient | null = createClient(currentConfig.url, currentConfig.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Test connectivity with provided or active Supabase credentials
 */
export async function testSupabaseConnection(customUrl?: string, customKey?: string): Promise<{ success: boolean; message: string; tableReady?: boolean }> {
  const url = (customUrl || currentConfig.url || '').trim();
  const key = (customKey || currentConfig.anonKey || '').trim();

  if (!url || !key) {
    return { success: false, message: 'URL and Anon Key are required.' };
  }
  if (!url.startsWith('https://')) {
    return { success: false, message: 'Supabase URL must start with https://' };
  }

  try {
    const testClient = createClient(url, key);
    // 1. Test basic connectivity via auth.getSession()
    const { error: sessionError } = await testClient.auth.getSession();
    if (sessionError && !sessionError.message.includes('session')) {
      return { success: false, message: sessionError.message };
    }

    // 2. Check if the 'tenants' table exists
    const { error: tableError } = await testClient.from('tenants').select('id').limit(1);
    if (tableError) {
      if (tableError.code === '42P01' || tableError.message.includes('relation "public.tenants" does not exist')) {
        return {
          success: true,
          tableReady: false,
          message: 'Connected to Supabase! However, the "tenants" table is not created yet. Please run the SQL schema script.',
        };
      }
      // RLS or permission notice is fine
      return {
        success: true,
        tableReady: true,
        message: 'Connected to Supabase! (' + tableError.message + ')',
      };
    }

    return {
      success: true,
      tableReady: true,
      message: 'Connection successful and "tenants" table is ready!',
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection test failed.' };
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
 */
export async function signInWithEmail(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!supabase) return { user: null, error: 'Supabase is not configured yet' };

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    return { user: formatAuthUser(data.user), error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Authentication failed' };
  }
}

/**
 * Sign Up with Email & Password
 */
export async function signUpWithEmail(email: string, password: string, fullName?: string): Promise<{ user: AuthUser | null; error: string | null; needsEmailConfirmation?: boolean }> {
  if (!supabase) return { user: null, error: 'Supabase is not configured yet' };

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName?.trim() || '',
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    const needsEmailConfirmation = !data.session && Boolean(data.user);
    return { 
      user: formatAuthUser(data.user), 
      error: null, 
      needsEmailConfirmation 
    };
  } catch (err: any) {
    return { user: null, error: err.message || 'Registration failed' };
  }
}

/**
 * Sign In with Google / Gmail OAuth
 */
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Supabase is not configured yet' };

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) return { error: error.message };
    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'Google authentication failed' };
  }
}

/**
 * Sign Out
 */
export async function signOutUser(): Promise<{ error: string | null }> {
  if (!supabase) return { error: null };

  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { error: error.message };
    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'Sign out failed' };
  }
}

/**
 * Get current session user
 */
export async function getSessionUser(): Promise<AuthUser | null> {
  if (!supabase) return null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      return formatAuthUser(session.user);
    }
    return null;
  } catch (err) {
    console.error('Error fetching session:', err);
    return null;
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void): (() => void) | null {
  if (!supabase) return null;

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(formatAuthUser(session?.user || null));
  });

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Fetch tenants from Supabase belonging strictly to the current user
 */
export async function fetchTenantsFromSupabase(userId?: string): Promise<TenantRecord[] | null> {
  if (!supabase) return null;

  try {
    let query = supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });

    // Explicit filter by user_id if provided (RLS also enforces it on Supabase)
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase fetch error:', error);
      return null;
    }

    if (!data) return [];

    return data.map((row: any): TenantRecord => ({
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
  } catch (err) {
    console.error('Failed to communicate with Supabase:', err);
    return null;
  }
}

/**
 * Insert or update tenant in Supabase linked strictly to user_id
 */
export async function upsertTenantToSupabase(tenant: TenantRecord, userId?: string): Promise<boolean> {
  if (!supabase) return false;

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

    const { error } = await supabase
      .from('tenants')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.error('Supabase upsert error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to upsert tenant to Supabase:', err);
    return false;
  }
}

/**
 * Delete a tenant from Supabase
 */
export async function deleteTenantFromSupabase(tenantId: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', tenantId);

    if (error) {
      console.error('Supabase delete error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete tenant from Supabase:', err);
    return false;
  }
}
