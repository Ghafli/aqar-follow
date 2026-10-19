import { createClient } from '@supabase/supabase-js';
import { TenantRecord } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('YOUR_SUPABASE')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Fetch all tenants from Supabase (ordered by created_at desc)
 */
export async function fetchTenantsFromSupabase(): Promise<TenantRecord[] | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return null;
    }

    if (!data) return [];

    return data.map((row: any): TenantRecord => ({
      id: row.id,
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
 * Insert or update tenant in Supabase
 */
export async function upsertTenantToSupabase(tenant: TenantRecord): Promise<boolean> {
  if (!supabase) return false;

  try {
    const row = {
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
