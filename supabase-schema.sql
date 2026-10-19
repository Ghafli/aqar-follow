-- ==========================================================
-- AqarFollow (عقار فولو) - Supabase Database Schema
-- Run this script in your Supabase SQL Editor
-- ==========================================================

-- 1. Create the tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    id_number TEXT NOT NULL,
    email TEXT,
    property_unit TEXT,
    rent_start_date DATE NOT NULL,
    rent_end_date DATE NOT NULL,
    payment_frequency TEXT NOT NULL CHECK (payment_frequency IN ('monthly', 'quarterly', 'semi-annually', 'annually')),
    rent_amount_per_period NUMERIC,
    paid_installments JSONB DEFAULT '[]'::jsonb,
    notes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create search performance indexes
CREATE INDEX IF NOT EXISTS idx_tenants_name ON public.tenants (name);
CREATE INDEX IF NOT EXISTS idx_tenants_mobile ON public.tenants (mobile);
CREATE INDEX IF NOT EXISTS idx_tenants_id_number ON public.tenants (id_number);
CREATE INDEX IF NOT EXISTS idx_tenants_dates ON public.tenants (rent_start_date, rent_end_date);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 4. Create policy allowing read and write access via anon key
-- Note: In production with authentication, you can restrict this to auth.uid() = user_id
CREATE POLICY "Allow public read-write for AqarFollow"
    ON public.tenants
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 5. Optional: Enable Realtime updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenants;
