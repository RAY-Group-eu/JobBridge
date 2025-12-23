-- ==============================================================================
-- JOBBRIDGE DB PATCH 003: Provider Locations (Default Address)
-- Purpose: Allow providers to save a default location for faster job posting.
-- ==============================================================================

-- 1. Create provider_locations table
CREATE TABLE IF NOT EXISTS provider_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    address_line1 TEXT NOT NULL,
    postal_code TEXT,
    city TEXT NOT NULL,
    lat FLOAT,
    lng FLOAT,
    public_label TEXT, -- e.g. "Rheinbach Zentrum" (Approx)
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one default per provider
CREATE UNIQUE INDEX IF NOT EXISTS idx_provider_locations_default 
ON provider_locations(provider_id) WHERE is_default = true;

-- 2. Link to job_private_details
-- Add nullable location_id to reference the source location
ALTER TABLE job_private_details ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES provider_locations(id);

-- Make address_full optional in job_private_details since it might be sourced from location_id
ALTER TABLE job_private_details ALTER COLUMN address_full DROP NOT NULL;

-- 3. RLS Policies

-- Enable RLS
ALTER TABLE provider_locations ENABLE ROW LEVEL SECURITY;

-- Policy: Provider manages their own locations
CREATE POLICY "Providers manage own locations" ON provider_locations
    FOR ALL USING (auth.uid() = provider_id);

-- Policy: Staff can view (optional, for later)
-- CREATE POLICY "Staff view locations" ...

-- Update job_private_details RLS to allow access if linked via location_id?
-- Actually, the existing policy relies on 'job_id' ownership.
-- We just need to ensure that when fetching private details, we can JOIN provider_locations if address_full is null.
-- But usually we copy/snapshot the address or just resolve it at runtime.
-- For now, we will probably COPY the data into job_private_details OR resolve it.
-- Let's stick to the plan: "INSERT job_private_details with provider_location_id (or override)".
-- If we store the ID, we need read access to provider_locations for the Seeker?
-- NO. Seeker sees public_label on the JOB. 
-- The private details (exact address) are only revealed if policy allows.
-- So we need a policy for Seekers to SELECT provider_locations IF they have access to a job linked to it.
-- OPTION: We can just SNAPSHOT the address into job_private_details to avoid complex joins/permissions.
-- DECISION: We will SNAPSHOT the address into job_private_details columns (address_full etc) AND store location_id as reference.
-- This keeps RLS simple (existing policies work) and history immutable (if default location changes later, old job doesn't change).

-- End of Patch
