-- ==============================================================================
-- JOBBRIDGE PATCH 004
-- Purpose: Fix Guardian Redemption FK Violation (Auto-create missing profiles)
-- ==============================================================================

-- Function to Redeem Invitation (Enhanced with Profile Check)
CREATE OR REPLACE FUNCTION redeem_guardian_invitation(token_input TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (allows access to auth.users)
AS $$
DECLARE
    invitation_record RECORD;
    parent_id UUID;
    user_email TEXT;
BEGIN
    -- Check authentication
    parent_id := auth.uid();
    IF parent_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- 1. Check if profile exists; if not, attempt to create it
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = parent_id) THEN
        -- Fetch email from auth.users (requires security definer)
        SELECT email INTO user_email FROM auth.users WHERE id = parent_id;
        
        BEGIN
            INSERT INTO profiles (id, email, full_name, account_type, created_at)
            VALUES (
                parent_id, 
                user_email, 
                'Guardian (Auto-created)', 
                'job_provider'::public.account_type, 
                NOW()
            );
        EXCEPTION WHEN OTHERS THEN
            -- Capture specific error if possible, but generally return a friendly message
            RETURN jsonb_build_object(
                'success', false, 
                'error', 'Dein Benutzerkonto ist unvollständig. Bitte vervollständige dein Profil im Onboarding.'
            );
        END;
    END IF;

    -- 2. Find valid invitation
    SELECT * INTO invitation_record FROM guardian_invitations 
    WHERE token = token_input AND status = 'active' AND expires_at > NOW();

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Ungültiger oder abgelaufener Link');
    END IF;

    -- 3. Prevent self-guardian
    IF invitation_record.child_id = parent_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Du kannst nicht dein eigener Erziehungsberechtigter sein.');
    END IF;

    -- 4. Mark invitation as redeemed
    UPDATE guardian_invitations 
    SET status = 'redeemed', redeemed_by = parent_id, updated_at = NOW()
    WHERE id = invitation_record.id;

    -- 5. Link guardian to child profile and set status
    UPDATE profiles 
    SET 
        guardian_id = parent_id,
        guardian_status = 'linked',
        guardian_verified_at = NOW()
    WHERE id = invitation_record.child_id;

    RETURN jsonb_build_object('success', true);
END;
$$;
