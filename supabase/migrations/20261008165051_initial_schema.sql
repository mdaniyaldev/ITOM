CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,  -- Never shown in public APIs
    country TEXT,
    status TEXT CHECK (status IN ('active', 'off', 'suspended', 'under_review', 'under_decision')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('inventor', 'investor', 'case_study_author')),
    is_approved BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(user_id, role) WHERE deleted_at IS NULL
);
CREATE TABLE admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module TEXT NOT NULL,  -- e.g., 'inventors', 'investors', 'ideas', 'case_studies', 'reviews', 'scoring', 'messaging', 'system'
    level TEXT NOT NULL CHECK (level IN ('view', 'edit', 'review', 'full')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('create', 'update', 'delete', 'approve', 'reject', 'login', 'logout')),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('user', 'inventor_profile', 'investor_profile', 'idea', 'case_study', 'file', 'thread', 'message')),
    entity_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TABLE score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('inventor_profile', 'investor_profile', 'idea', 'case_study')),
    entity_id UUID NOT NULL,
    rule TEXT NOT NULL,  -- What rule/achievement caused the score change
    points INTEGER NOT NULL,  -- Points awarded (can be negative for deductions)
    source TEXT NOT NULL CHECK (source IN ('AUTO', 'OVERRIDE')),  -- AUTO: system calculated, OVERRIDE: admin override
    override_by UUID REFERENCES users(id) ON DELETE SET NULL,  -- Who made the override (if source = OVERRIDE)
    reason TEXT NOT NULL,  -- Explanation for the score change
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TABLE steps_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_no INTEGER NOT NULL UNIQUE CHECK (step_no BETWEEN 1 AND 10),
    name TEXT NOT NULL,
    description TEXT,
    required_proof TEXT,
    points_awarded INTEGER NOT NULL CHECK (points_awarded >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TABLE master_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_name TEXT NOT NULL CHECK (list_name IN (
        'field_of_work', 'kind_of_idea', 'investor_type', 
        'country', 'badge', 'contribution_type', 'reply_speed',
        'status_values'
    )),
    list_value TEXT NOT NULL,
    list_label TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(list_name, list_value) WHERE is_active = TRUE AND deleted_at IS NULL
);
CREATE TABLE inventor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    photo_url TEXT NOT NULL,  -- Mandatory upload
    country TEXT REFERENCES master_lists(list_value) WHERE list_name = 'country',
    city TEXT,
    field_of_work TEXT REFERENCES master_lists(list_value) WHERE list_name = 'field_of_work',
    what_you_do TEXT REFERENCES master_lists(list_value) WHERE list_name = 'kind_of_idea',  -- Actually stores roles
    where_you_work_or_study TEXT,
    qualification TEXT,
    team_details JSONB,  -- For repeatable team member sections
    phone TEXT NOT NULL,   -- Required but never shown in public APIs
    self_description TEXT CHECK (CHAR_LENGTH(self_description) <= 600),
    email_verified BOOLEAN DEFAULT FALSE,
    score INTEGER DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
    badge TEXT CHECK (badge IN ('bronze', 'silver', 'gold')),
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TABLE investor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT REFERENCES master_lists(list_value) WHERE list_name = 'investor_type',
    logo_url TEXT,
    country TEXT REFERENCES master_lists(list_value) WHERE list_name = 'country',
    investment_countries TEXT[],  -- Array of country references from master_lists
    what_you_give TEXT REFERENCES master_lists(list_value) WHERE list_name = 'contribution_type',
    looking_for TEXT,
    past_investments JSONB,  -- Structured array: [{name, year, amount, proof_url}]
    reply_speed TEXT REFERENCES master_lists(list_value) WHERE list_name = 'reply_speed',
    contact_person TEXT,
    contact_phone TEXT NOT NULL,  -- Required but never shown in public APIs
    score INTEGER DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
    badge TEXT CHECK (badge IN ('bronze', 'silver', 'gold')),
    status TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TABLE case_studies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    who_it_is_about TEXT NOT NULL CHECK (who_it_is_about IN ('myself', 'my_company', 'somebody_else_named', 'well_known_case')),
    field TEXT REFERENCES master_lists(list_value) WHERE list_name = 'field_of_work',
    country TEXT REFERENCES master_lists(list_value) WHERE list_name = 'country',
    main_card_description TEXT,
    box1_description TEXT,
    box2_description TEXT,
    box3_description TEXT,
    box4_description TEXT,
    box5_description TEXT,
    has_rights_tick BOOLEAN NOT NULL CHECK (has_rights_tick = TRUE),  -- Required true
    has_true_tick BOOLEAN NOT NULL CHECK (has_true_tick = TRUE),      -- Required true
    status TEXT,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    source_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TABLE ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    problem TEXT NOT NULL,
    how_it_works TEXT NOT NULL,
    kind_of_idea TEXT REFERENCES master_lists(list_value) WHERE list_name = 'kind_of_idea',
    current_step INTEGER CHECK (current_step BETWEEN 1 AND 10),
    score INTEGER DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
    badge TEXT CHECK (badge IN ('bronze', 'silver', 'gold')),
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    ownership TEXT,
    told_whom TEXT,
    filing_status TEXT,
    money_in_usd DECIMAL(10,2),
    money_needed_usd DECIMAL(10,2),
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TABLE idea_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    step_no INTEGER NOT NULL REFERENCES steps_master(step_no) CHECK (step_no BETWEEN 1 AND 10),
    status TEXT NOT NULL CHECK (status IN ('empty', 'under_review', 'changes_needed', 'approved', 'rejected')),
    proof_submitted TEXT,
    proof_approved BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(idea_id, step_no) WHERE deleted_at IS NULL
);
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('inventor_profile', 'investor_profile', 'idea', 'case_study')),
    entity_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,  -- URL to file in Supabase Storage
    file_type TEXT NOT NULL,  -- MIME type
    file_size INTEGER NOT NULL CHECK (file_size >= 0),
    visibility TEXT NOT NULL CHECK (visibility IN ('public', 'members', 'locked')),
    status TEXT NOT NULL CHECK (status IN ('uploaded', 'scanning', 'approved', 'rejected')),
    virus_scan_result TEXT,  -- Clean/Malware found details
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TABLE field_visibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('inventor_profile', 'investor_profile', 'idea', 'case_study')),
    entity_id UUID NOT NULL,
    field_name TEXT NOT NULL,
    visibility TEXT NOT NULL CHECK (visibility IN ('public', 'members', 'locked')),
    locked_by UUID REFERENCES users(id) ON DELETE SET NULL,  -- Admin who locked it
    locked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(entity_type, entity_id, field_name) WHERE deleted_at IS NULL
);
CREATE TABLE file_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    requester_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_message TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    responded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TABLE nda_acceptances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('inventor_profile', 'investor_profile', 'idea', 'case_study')),
    entity_id UUID NOT NULL,
    accepted BOOLEAN NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(user_id, entity_type, entity_id) WHERE accepted = TRUE AND deleted_at IS NULL
);
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('inventor_profile', 'investor_profile', 'idea', 'case_study')),
    entity_id UUID NOT NULL,
    reviewer_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'changes_needed', 'rejected')),
    decision_reason TEXT,  -- Required for 'changes_needed' and 'rejected'
    locked_by UUID REFERENCES users(id) ON DELETE SET NULL,  -- Admin who locked the review
    locked_at TIMESTAMPTZ,  -- When the review was locked
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TABLE revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('inventor_profile', 'investor_profile', 'idea', 'case_study')),
    entity_id UUID NOT NULL,
    field_name TEXT NOT NULL,  -- Name of the field being revised
    old_value TEXT,  -- Original value (as text for simplicity)
    new_value TEXT,  -- New value (as text for simplicity)
    status TEXT NOT NULL CHECK (status IN ('waiting', 'approved', 'rejected')),
    submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
-- Enforce one waiting revision per entity via partial index
CREATE UNIQUE INDEX idx_revisions_one_waiting ON revisions(entity_type, entity_id) 
WHERE status = 'waiting' AND deleted_at IS NULL;
CREATE TABLE threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiator_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES ideas(id) ON DELETE SET NULL,  -- Which idea this thread is about
    status TEXT NOT NULL CHECK (status IN ('active', 'archived')),
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(LEAST(initiator_user_id, recipient_user_id), GREATEST(initiator_user_id, recipient_user_id)) WHERE deleted_at IS NULL
);
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    sender_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    file_id UUID REFERENCES files(id) ON DELETE SET NULL,  -- Single file attachment
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TABLE thread_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    outcome TEXT NOT NULL CHECK (outcome IN ('talking', 'deal', 'no_deal', 'not_saying')),
    decided_by UUID REFERENCES users(id) ON DELETE SET NULL,  -- Which user decided the outcome
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TABLE reports_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('report', 'block')),
    reason TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'message_received', 'profile_approved', 'idea_approved', 
        'case_study_approved', 'review_completed', 'score_updated',
        'system_announcement'
    )),
    entity_type TEXT,
    entity_id UUID,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name TEXT NOT NULL UNIQUE CHECK (template_name IN (
        'welcome', 'profile_approved', 'idea_changes_needed', 
        'idea_rejected', 'case_study_approved', 'review_completed',
        'score_updated', 'system_announcement', 'file_access_approved',
        'file_access_rejected'
    )),
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TABLE email_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    template_key TEXT NOT NULL REFERENCES email_templates(template_name),
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'bounced')),
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TABLE views_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('inventor_profile', 'investor_profile', 'idea', 'case_study')),
    entity_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('view', 'like', 'share')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE OR REPLACE FUNCTION is_approved_member(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = is_approved_member.user_id 
      AND is_approved = true 
      AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Enable RLS
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_permissions
    WHERE admin_user_id = user_id
      AND module IN ('inventors', 'investors', 'ideas', 'case_studies', 'reviews', 'scoring', 'messaging', 'system')
      AND level IN ('view', 'edit', 'review', 'full')
      AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
ALTER TABLE inventor_profiles ENABLE ROW LEVEL SECURITY;

-- Public policy: Anyone can see public profiles
CREATE POLICY "Public profiles are viewable by everyone" ON inventor_profiles
FOR SELECT USING (
  visibility = 'public'
);

-- Members policy: Approved members can see public and members profiles
CREATE POLICY "Members profiles are viewable by approved members" ON inventor_profiles
FOR SELECT USING (
  visibility IN ('public', 'members') AND 
  is_approved_member(auth.uid())
);

-- Owner policy: Users can see their own locked profiles
CREATE POLICY "Users can see their own locked profiles" ON inventor_profiles
FOR SELECT USING (
  auth.uid() = user_id AND
  visibility = 'locked'
);


-- Admin policy: Admins can see all profiles
CREATE POLICY "Admins can see all profiles" ON inventor_profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM admin_permissions
    WHERE admin_user_id = auth.uid()
      AND module = 'inventors'
      AND level IN ('view', 'edit', 'review', 'full')
      AND deleted_at IS NULL
  )
);