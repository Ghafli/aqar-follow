-- ==============================================================================
-- AqarFollow (عقار فولو) - Supabase Multi-User Database Schema with RLS
-- Run this script in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- ==============================================================================

-- 1. Create the tenants table with user_id foreign key linked to auth.users
CREATE TABLE IF NOT EXISTS public.tenants (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
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

-- If table already existed without user_id column, add it safely:
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tenants' 
        AND column_name = 'user_id'
    ) THEN 
        ALTER TABLE public.tenants ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
    END IF; 
END $$;

-- 2. Create search performance & user isolation indexes
CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON public.tenants (user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_name ON public.tenants (name);
CREATE INDEX IF NOT EXISTS idx_tenants_mobile ON public.tenants (mobile);
CREATE INDEX IF NOT EXISTS idx_tenants_id_number ON public.tenants (id_number);
CREATE INDEX IF NOT EXISTS idx_tenants_dates ON public.tenants (rent_start_date, rent_end_date);

-- 3. Enable Row Level Security (RLS) to enforce strict user data privacy
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 4. Clean up any existing broad policies
DROP POLICY IF EXISTS "Allow public read-write for AqarFollow" ON public.tenants;
DROP POLICY IF EXISTS "Users can only view their own tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can only insert their own tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can only update their own tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can only delete their own tenants" ON public.tenants;

-- 5. Create granular RLS policies for complete user data isolation
-- Only the owner can view their own tenant records:
CREATE POLICY "Users can only view their own tenants"
    ON public.tenants FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Only the owner can insert their own tenant records:
CREATE POLICY "Users can only insert their own tenants"
    ON public.tenants FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Only the owner can update their own tenant records:
CREATE POLICY "Users can only update their own tenants"
    ON public.tenants FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Only the owner can delete their own tenant records:
CREATE POLICY "Users can only delete their own tenants"
    ON public.tenants FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 6. Enable Supabase Realtime for instant multi-device syncing
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenants;
