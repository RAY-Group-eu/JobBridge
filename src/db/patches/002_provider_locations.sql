-- Migration: Add provider_locations table
-- Description: Stores default location data for providers to avoid re-entering addresses for every job.

CREATE TABLE If NOT EXISTS public.provider_locations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    address_line1 text NOT NULL, -- Private Street + Number
    postal_code text NOT NULL,
    city text NOT NULL,
    lat double precision,
    lng double precision,
    approx_label text, -- "Rheinbach Zentrum"
    is_default boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.provider_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own locations" ON public.provider_locations
    FOR ALL
    TO authenticated
    USING (auth.uid() = provider_id)
    WITH CHECK (auth.uid() = provider_id);

-- Index
CREATE INDEX idx_provider_locations_provider_id ON public.provider_locations(provider_id);
