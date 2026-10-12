-- Helper Functions

-- Function to check if a user is an approved member
CREATE OR REPLACE FUNCTION is_approved_member(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = p_user_id
      AND is_approved = true
      AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_permissions
    WHERE admin_user_id = is_admin.user_id
      AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- People / Access Tables

-- users table
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

-- Auth users to public.users sync trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, phone, status)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name',''), '', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- user_roles table
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('inventor', 'investor', 'author')),
    is_approved BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- admin_permissions table
CREATE TABLE admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module TEXT NOT NULL,  -- e.g., 'inventors', 'investors', 'ideas', 'case_studies', 'reviews', 'scoring', 'messaging', 'system'
    level TEXT NOT NULL CHECK (level IN ('view', 'edit', 'review', 'full')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- audit_log table
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

-- score_history table
CREATE TABLE score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('inventor_profile', 'investor_profile', 'idea', 'case_study')),
    entity_id UUID NOT NULL,
    rule TEXT NOT NULL,  -- What rule/achievement caused the score change
    points INTEGER NOT NULL,  -- Points awarded (can be negative for deductions)
    source TEXT NOT NULL CHECK (source IN ('AUTO', 'OVERRIDE')),  -- AUTO: system calculated, OVERRIDE: admin override
    override_by UUID REFERENCES users(id) ON DELETE SET NULL,  -- Who made the override (if source = OVERRIDE)
    reason TEXT,  -- Explanation for the score change
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Profiles & Content Tables

-- steps_master table
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

-- master_lists table
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
    deleted_at TIMESTAMPTZ
);

-- inventor_profiles table
CREATE TABLE inventor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    photo_url TEXT NOT NULL,  -- Mandatory upload
    country UUID REFERENCES master_lists(id),
    city TEXT,
    field_of_work UUID REFERENCES master_lists(id),
    what_you_do UUID REFERENCES master_lists(id),  -- Actually stores roles
    where_you_work_or_study TEXT,
    qualification TEXT,
    team_details JSONB,  -- For repeatable team member sections
    phone TEXT NOT NULL,   -- Required but never shown in public APIs
    self_description TEXT CHECK (CHAR_LENGTH(self_description) <= 600),
    email_verified BOOLEAN DEFAULT FALSE,
    score INTEGER DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
    badge TEXT CHECK (badge IN ('bronze', 'silver', 'gold')),
    status TEXT,
    visibility TEXT NOT NULL DEFAULT 'members' CHECK (visibility IN ('public', 'members', 'locked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- investor_profiles table
CREATE TABLE investor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type UUID REFERENCES master_lists(id),
    logo_url TEXT,
    country UUID REFERENCES master_lists(id),
    investment_countries TEXT[],  -- Array of country references from master_lists
    what_you_give UUID REFERENCES master_lists(id),
    looking_for TEXT,
    past_investments JSONB,  -- Structured array: [{name, year, amount, proof_url}]
    reply_speed UUID REFERENCES master_lists(id),
    contact_person TEXT,
    contact_phone TEXT NOT NULL,  -- Required but never shown in public APIs
    score INTEGER DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
    badge TEXT CHECK (badge IN ('bronze', 'silver', 'gold')),
    status TEXT,
    verified_at TIMESTAMPTZ,
    visibility TEXT NOT NULL DEFAULT 'members' CHECK (visibility IN ('public', 'members', 'locked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- case_studies table
CREATE TABLE case_studies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    who_it_is_about TEXT NOT NULL CHECK (who_it_is_about IN ('myself', 'my_company', 'somebody_else_named', 'well_known_case')),
    field UUID REFERENCES master_lists(id),
    country UUID REFERENCES master_lists(id),
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
    visibility TEXT NOT NULL DEFAULT 'members' CHECK (visibility IN ('public', 'members', 'locked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ideas table
CREATE TABLE ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    problem TEXT NOT NULL,
    how_it_works TEXT NOT NULL,
    kind_of_idea UUID REFERENCES master_lists(id),
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
    visibility TEXT NOT NULL DEFAULT 'members' CHECK (visibility IN ('public', 'members', 'locked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- idea_steps table
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
    deleted_at TIMESTAMPTZ
);

-- Proof & NDA Tables

-- files table
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

-- field_visibility table
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
    deleted_at TIMESTAMPTZ
);

-- file_access_requests table
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

-- nda_acceptances table
CREATE TABLE nda_acceptances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('inventor_profile', 'investor_profile', 'idea', 'case_study')),
    entity_id UUID NOT NULL,
    accepted BOOLEAN NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Review & Edits Tables

-- reviews table
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

-- revisions table
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

-- Messaging Tables

-- threads table
CREATE TABLE threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiator_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES ideas(id) ON DELETE SET NULL,  -- Which idea this thread is about
    status TEXT NOT NULL CHECK (status IN ('active', 'archived')),
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- messages table
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

-- thread_outcomes table
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

-- reports_blocks table
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

-- System / Lists Tables

-- notifications table
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

-- email_templates table
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

-- email_log table
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

-- views_likes table
CREATE TABLE views_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('inventor_profile', 'investor_profile', 'idea', 'case_study')),
    entity_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('view', 'like', 'share')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Partial indexes for conditional uniqueness
CREATE UNIQUE INDEX idx_user_roles_unique ON user_roles(user_id, role) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_master_lists_unique ON master_lists(list_name, list_value) WHERE is_active = TRUE AND deleted_at IS NULL;
CREATE UNIQUE INDEX idx_field_visibility_unique ON field_visibility(entity_type, entity_id, field_name) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_nda_acceptances_unique ON nda_acceptances(user_id, entity_type, entity_id) WHERE accepted = TRUE AND deleted_at IS NULL;
CREATE UNIQUE INDEX idx_idea_steps_unique ON idea_steps(idea_id, step_no) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_threads_unique ON threads(LEAST(initiator_user_id, recipient_user_id), GREATEST(initiator_user_id, recipient_user_id)) WHERE deleted_at IS NULL;

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE nda_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE views_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data" ON users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own row" ON users
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all users" ON users
FOR UPDATE USING (is_admin(auth.uid()));

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles" ON user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles" ON user_roles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roles" ON user_roles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user roles" ON user_roles
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for admin_permissions table
CREATE POLICY "Admins can view admin permissions" ON admin_permissions
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage admin permissions" ON admin_permissions
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for audit_log table
CREATE POLICY "Users can view their own audit logs" ON audit_log
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs" ON audit_log
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage audit logs" ON audit_log
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for score_history table
CREATE POLICY "Users can view their own score history" ON score_history
FOR SELECT USING (
    entity_type IN ('inventor_profile', 'investor_profile') AND
    entity_id IN (
        SELECT id FROM inventor_profiles WHERE user_id = auth.uid()
        UNION
        SELECT id FROM investor_profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can view score history for ideas and case studies they own" ON score_history
FOR SELECT USING (
    entity_type IN ('idea', 'case_study') AND
    entity_id IN (
        SELECT id FROM ideas WHERE user_id = auth.uid()
        UNION
        SELECT id FROM case_studies WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Admins can view all score history" ON score_history
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage score history" ON score_history
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for steps_master table
CREATE POLICY "Everyone can view steps master" ON steps_master
FOR SELECT USING (true);

CREATE POLICY "Admins can manage steps master" ON steps_master
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for master_lists table
CREATE POLICY "Everyone can view master lists" ON master_lists
FOR SELECT USING (true);

CREATE POLICY "Admins can manage master lists" ON master_lists
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for inventor_profiles table
CREATE POLICY "Public inventor profiles are viewable by everyone" ON inventor_profiles
FOR SELECT USING (visibility = 'public');

CREATE POLICY "Members can view public and members inventor profiles" ON inventor_profiles
FOR SELECT USING (
    visibility IN ('public', 'members') AND
    is_approved_member(auth.uid())
);

CREATE POLICY "Users can view their own locked inventor profiles" ON inventor_profiles
FOR SELECT USING (
    auth.uid() = user_id AND
    visibility = 'locked'
);

CREATE POLICY "Admins can view all inventor profiles" ON inventor_profiles
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Users can insert their own inventor profiles" ON inventor_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventor profiles" ON inventor_profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all inventor profiles" ON inventor_profiles
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for investor_profiles table
CREATE POLICY "Public investor profiles are viewable by everyone" ON investor_profiles
FOR SELECT USING (visibility = 'public');

CREATE POLICY "Members can view public and members investor profiles" ON investor_profiles
FOR SELECT USING (
    visibility IN ('public', 'members') AND
    is_approved_member(auth.uid())
);

CREATE POLICY "Users can view their own locked investor profiles" ON investor_profiles
FOR SELECT USING (
    auth.uid() = user_id AND
    visibility = 'locked'
);

CREATE POLICY "Admins can view all investor profiles" ON investor_profiles
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Users can insert their own investor profiles" ON investor_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investor profiles" ON investor_profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all investor profiles" ON investor_profiles
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for case_studies table
CREATE POLICY "Public case studies are viewable by everyone" ON case_studies
FOR SELECT USING (visibility = 'public');

CREATE POLICY "Members can view public and members case studies" ON case_studies
FOR SELECT USING (
    visibility IN ('public', 'members') AND
    is_approved_member(auth.uid())
);

CREATE POLICY "Users can view their own locked case studies" ON case_studies
FOR SELECT USING (
    auth.uid() = user_id AND
    visibility = 'locked'
);

CREATE POLICY "Admins can view all case studies" ON case_studies
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Users can insert their own case studies" ON case_studies
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own case studies" ON case_studies
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all case studies" ON case_studies
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for ideas table
CREATE POLICY "Public ideas are viewable by everyone" ON ideas
FOR SELECT USING (visibility = 'public');

CREATE POLICY "Members can view public and members ideas" ON ideas
FOR SELECT USING (
    visibility IN ('public', 'members') AND
    is_approved_member(auth.uid())
);

CREATE POLICY "Users can view their own locked ideas" ON ideas
FOR SELECT USING (
    auth.uid() = user_id AND
    visibility = 'locked'
);

CREATE POLICY "Admins can view all ideas" ON ideas
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Users can insert their own ideas" ON ideas
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas" ON ideas
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all ideas" ON ideas
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for idea_steps table
CREATE POLICY "Users can view idea steps for their own ideas" ON idea_steps
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM ideas i
        WHERE i.id = idea_steps.idea_id AND i.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert idea steps for their own ideas" ON idea_steps
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM ideas i
        WHERE i.id = idea_steps.idea_id AND i.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update idea steps for their own ideas" ON idea_steps
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM ideas i
        WHERE i.id = idea_steps.idea_id AND i.user_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage all idea steps" ON idea_steps
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for files table
CREATE POLICY "Public files are viewable by everyone" ON files
FOR SELECT USING (visibility = 'public');

CREATE POLICY "Members can view public and members files" ON files
FOR SELECT USING (
    visibility IN ('public', 'members') AND
    is_approved_member(auth.uid())
);

CREATE POLICY "Users can view their own locked files" ON files
FOR SELECT USING (auth.uid() = user_id AND visibility = 'locked');

CREATE POLICY "Admins can view all files" ON files
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Users can insert their own files" ON files
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files" ON files
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all files" ON files
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for field_visibility table
CREATE POLICY "Users can view field visibility for their own entities" ON field_visibility
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM inventor_profiles ip
        WHERE ip.id = field_visibility.entity_id AND ip.user_id = auth.uid()
        UNION
        SELECT 1 FROM investor_profiles inv
        WHERE inv.id = field_visibility.entity_id AND inv.user_id = auth.uid()
        UNION
        SELECT 1 FROM ideas i
        WHERE i.id = field_visibility.entity_id AND i.user_id = auth.uid()
        UNION
        SELECT 1 FROM case_studies cs
        WHERE cs.id = field_visibility.entity_id AND cs.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert field visibility for their own entities" ON field_visibility
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM inventor_profiles ip
        WHERE ip.id = field_visibility.entity_id AND ip.user_id = auth.uid()
        UNION
        SELECT 1 FROM investor_profiles inv
        WHERE inv.id = field_visibility.entity_id AND inv.user_id = auth.uid()
        UNION
        SELECT 1 FROM ideas i
        WHERE i.id = field_visibility.entity_id AND i.user_id = auth.uid()
        UNION
        SELECT 1 FROM case_studies cs
        WHERE cs.id = field_visibility.entity_id AND cs.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update field visibility for their own entities" ON field_visibility
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM inventor_profiles ip
        WHERE ip.id = field_visibility.entity_id AND ip.user_id = auth.uid()
        UNION
        SELECT 1 FROM investor_profiles inv
        WHERE inv.id = field_visibility.entity_id AND inv.user_id = auth.uid()
        UNION
        SELECT 1 FROM ideas i
        WHERE i.id = field_visibility.entity_id AND i.user_id = auth.uid()
        UNION
        SELECT 1 FROM case_studies cs
        WHERE cs.id = field_visibility.entity_id AND cs.user_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage all field visibility" ON field_visibility
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for file_access_requests table
CREATE POLICY "Users can view their own file access requests" ON file_access_requests
FOR SELECT USING (auth.uid() = requester_user_id);

CREATE POLICY "Users can insert file access requests" ON file_access_requests
FOR INSERT WITH CHECK (auth.uid() = requester_user_id);

CREATE POLICY "Users can update their own file access requests" ON file_access_requests
FOR UPDATE USING (auth.uid() = requester_user_id);

CREATE POLICY "Admins can manage all file access requests" ON file_access_requests
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for nda_acceptances table
CREATE POLICY "Users can view their own NDA acceptances" ON nda_acceptances
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own NDA acceptances" ON nda_acceptances
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all NDA acceptances" ON nda_acceptances
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for reviews table
CREATE POLICY "Users can view reviews for their own entities" ON reviews
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM inventor_profiles ip
        WHERE ip.id = reviews.entity_id AND ip.user_id = auth.uid()
        UNION
        SELECT 1 FROM investor_profiles inv
        WHERE inv.id = reviews.entity_id AND inv.user_id = auth.uid()
        UNION
        SELECT 1 FROM ideas i
        WHERE i.id = reviews.entity_id AND i.user_id = auth.uid()
        UNION
        SELECT 1 FROM case_studies cs
        WHERE cs.id = reviews.entity_id AND cs.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert reviews for their own entities" ON reviews
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM inventor_profiles ip
        WHERE ip.id = reviews.entity_id AND ip.user_id = auth.uid()
        UNION
        SELECT 1 FROM investor_profiles inv
        WHERE inv.id = reviews.entity_id AND inv.user_id = auth.uid()
        UNION
        SELECT 1 FROM ideas i
        WHERE i.id = reviews.entity_id AND i.user_id = auth.uid()
        UNION
        SELECT 1 FROM case_studies cs
        WHERE cs.id = reviews.entity_id AND cs.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update reviews for their own entities" ON reviews
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM inventor_profiles ip
        WHERE ip.id = reviews.entity_id AND ip.user_id = auth.uid()
        UNION
        SELECT 1 FROM investor_profiles inv
        WHERE inv.id = reviews.entity_id AND inv.user_id = auth.uid()
        UNION
        SELECT 1 FROM ideas i
        WHERE i.id = reviews.entity_id AND i.user_id = auth.uid()
        UNION
        SELECT 1 FROM case_studies cs
        WHERE cs.id = reviews.entity_id AND cs.user_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage all reviews" ON reviews
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for revisions table
CREATE POLICY "Users can view revisions for their own entities" ON revisions
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM inventor_profiles ip
        WHERE ip.id = revisions.entity_id AND ip.user_id = auth.uid()
        UNION
        SELECT 1 FROM investor_profiles inv
        WHERE inv.id = revisions.entity_id AND inv.user_id = auth.uid()
        UNION
        SELECT 1 FROM ideas i
        WHERE i.id = revisions.entity_id AND i.user_id = auth.uid()
        UNION
        SELECT 1 FROM case_studies cs
        WHERE cs.id = revisions.entity_id AND cs.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert revisions for their own entities" ON revisions
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM inventor_profiles ip
        WHERE ip.id = revisions.entity_id AND ip.user_id = auth.uid()
        UNION
        SELECT 1 FROM investor_profiles inv
        WHERE inv.id = revisions.entity_id AND inv.user_id = auth.uid()
        UNION
        SELECT 1 FROM ideas i
        WHERE i.id = revisions.entity_id AND i.user_id = auth.uid()
        UNION
        SELECT 1 FROM case_studies cs
        WHERE cs.id = revisions.entity_id AND cs.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update revisions for their own entities" ON revisions
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM inventor_profiles ip
        WHERE ip.id = revisions.entity_id AND ip.user_id = auth.uid()
        UNION
        SELECT 1 FROM investor_profiles inv
        WHERE inv.id = revisions.entity_id AND inv.user_id = auth.uid()
        UNION
        SELECT 1 FROM ideas i
        WHERE i.id = revisions.entity_id AND i.user_id = auth.uid()
        UNION
        SELECT 1 FROM case_studies cs
        WHERE cs.id = revisions.entity_id AND cs.user_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage all revisions" ON revisions
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for threads table
CREATE POLICY "Users can view threads they participate in" ON threads
FOR SELECT USING (auth.uid() = initiator_user_id OR auth.uid() = recipient_user_id);

CREATE POLICY "Users can insert threads" ON threads
FOR INSERT WITH CHECK (auth.uid() = initiator_user_id);

CREATE POLICY "Users can update threads they participate in" ON threads
FOR UPDATE USING (auth.uid() = initiator_user_id OR auth.uid() = recipient_user_id);

CREATE POLICY "Admins can manage all threads" ON threads
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for messages table
CREATE POLICY "Users can view messages in threads they participate in" ON messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM threads t
        WHERE t.id = messages.thread_id AND (t.initiator_user_id = auth.uid() OR t.recipient_user_id = auth.uid())
    )
);

CREATE POLICY "Users can insert messages in threads they participate in" ON messages
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM threads t
        WHERE t.id = messages.thread_id AND (t.initiator_user_id = auth.uid() OR t.recipient_user_id = auth.uid())
    )
);

CREATE POLICY "Users can update messages in threads they participate in" ON messages
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM threads t
        WHERE t.id = messages.thread_id AND (t.initiator_user_id = auth.uid() OR t.recipient_user_id = auth.uid())
    )
);

CREATE POLICY "Admins can manage all messages" ON messages
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for thread_outcomes table
CREATE POLICY "Users can view thread outcomes for threads they participate in" ON thread_outcomes
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM threads t
        WHERE t.id = thread_outcomes.thread_id AND (t.initiator_user_id = auth.uid() OR t.recipient_user_id = auth.uid())
    )
);

CREATE POLICY "Users can insert thread outcomes for threads they participate in" ON thread_outcomes
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM threads t
        WHERE t.id = thread_outcomes.thread_id AND (t.initiator_user_id = auth.uid() OR t.recipient_user_id = auth.uid())
    )
);

CREATE POLICY "Users can update thread outcomes for threads they participate in" ON thread_outcomes
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM threads t
        WHERE t.id = thread_outcomes.thread_id AND (t.initiator_user_id = auth.uid() OR t.recipient_user_id = auth.uid())
    )
);

CREATE POLICY "Admins can manage all thread outcomes" ON thread_outcomes
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for reports_blocks table
CREATE POLICY "Users can view reports/blocks for threads they participate in" ON reports_blocks
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM threads t
        WHERE t.id = reports_blocks.thread_id AND (t.initiator_user_id = auth.uid() OR t.recipient_user_id = auth.uid())
    )
);

CREATE POLICY "Users can insert reports/blocks for threads they participate in" ON reports_blocks
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM threads t
        WHERE t.id = reports_blocks.thread_id AND (t.initiator_user_id = auth.uid() OR t.recipient_user_id = auth.uid())
    )
);

CREATE POLICY "Users can update reports/blocks for threads they participate in" ON reports_blocks
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM threads t
        WHERE t.id = reports_blocks.thread_id AND (t.initiator_user_id = auth.uid() OR t.recipient_user_id = auth.uid())
    )
);

CREATE POLICY "Admins can manage all reports/blocks" ON reports_blocks
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for notifications table
CREATE POLICY "Users can view their own notifications" ON notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert notifications" ON notifications
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications" ON notifications
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for email_templates table
CREATE POLICY "Everyone can view email templates" ON email_templates
FOR SELECT USING (true);

CREATE POLICY "Admins can manage email templates" ON email_templates
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for email_log table
CREATE POLICY "Users can view their own email log" ON email_log
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all email log" ON email_log
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage email log" ON email_log
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for views_likes table
CREATE POLICY "Users can view their own views/likes/shares" ON views_likes
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert views/likes/shares" ON views_likes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all views/likes/shares" ON views_likes
FOR ALL USING (is_admin(auth.uid()));

-- Indexes on Foreign Key Columns

-- Indexes for users table (references auth.users, handled by Supabase)
-- No additional indexes needed for users table FK as it's to auth.users

-- Indexes for user_roles table
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- Indexes for admin_permissions table
CREATE INDEX idx_admin_permissions_admin_user_id ON admin_permissions(admin_user_id);

-- Indexes for audit_log table
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_entity_type_entity_id ON audit_log(entity_type, entity_id);

-- Indexes for score_history table
CREATE INDEX idx_score_history_entity_type_entity_id ON score_history(entity_type, entity_id);
CREATE INDEX idx_score_history_override_by ON score_history(override_by);

-- Indexes for steps_master table (no FKs)

-- Indexes for master_lists table (no FKs)

-- Indexes for inventor_profiles table
CREATE INDEX idx_inventor_profiles_user_id ON inventor_profiles(user_id);
CREATE INDEX idx_inventor_profiles_country ON inventor_profiles(country);
CREATE INDEX idx_inventor_profiles_field_of_work ON inventor_profiles(field_of_work);
CREATE INDEX idx_inventor_profiles_what_you_do ON inventor_profiles(what_you_do);

-- Indexes for investor_profiles table
CREATE INDEX idx_investor_profiles_user_id ON investor_profiles(user_id);
CREATE INDEX idx_investor_profiles_type ON investor_profiles(type);
CREATE INDEX idx_investor_profiles_country ON investor_profiles(country);
CREATE INDEX idx_investor_profiles_what_you_give ON investor_profiles(what_you_give);
CREATE INDEX idx_investor_profiles_reply_speed ON investor_profiles(reply_speed);

-- Indexes for case_studies table
CREATE INDEX idx_case_studies_user_id ON case_studies(user_id);
CREATE INDEX idx_case_studies_field ON case_studies(field);
CREATE INDEX idx_case_studies_country ON case_studies(country);

-- Indexes for ideas table
CREATE INDEX idx_ideas_user_id ON ideas(user_id);
CREATE INDEX idx_ideas_kind_of_idea ON ideas(kind_of_idea);

-- Indexes for idea_steps table
CREATE INDEX idx_idea_steps_idea_id ON idea_steps(idea_id);
CREATE INDEX idx_idea_steps_step_no ON idea_steps(step_no);

-- Indexes for files table
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_entity_type_entity_id ON files(entity_type, entity_id);

-- Indexes for field_visibility table
CREATE INDEX idx_field_visibility_entity_type_entity_id ON field_visibility(entity_type, entity_id);
CREATE INDEX idx_field_visibility_locked_by ON field_visibility(locked_by);

-- Indexes for file_access_requests table
CREATE INDEX idx_file_access_requests_file_id ON file_access_requests(file_id);
CREATE INDEX idx_file_access_requests_requester_user_id ON file_access_requests(requester_user_id);
CREATE INDEX idx_file_access_requests_responded_by ON file_access_requests(responded_by);

-- Indexes for nda_acceptances table
CREATE INDEX idx_nda_acceptances_user_id ON nda_acceptances(user_id);
CREATE INDEX idx_nda_acceptances_entity_type_entity_id ON nda_acceptances(entity_type, entity_id);

-- Indexes for reviews table
CREATE INDEX idx_reviews_entity_type_entity_id ON reviews(entity_type, entity_id);
CREATE INDEX idx_reviews_reviewer_user_id ON reviews(reviewer_user_id);
CREATE INDEX idx_reviews_locked_by ON reviews(locked_by);

-- Indexes for revisions table
CREATE INDEX idx_revisions_entity_type_entity_id ON revisions(entity_type, entity_id);
CREATE INDEX idx_revisions_submitted_by ON revisions(submitted_by);
CREATE INDEX idx_revisions_reviewed_by ON revisions(reviewed_by);

-- Indexes for threads table
CREATE INDEX idx_threads_initiator_user_id ON threads(initiator_user_id);
CREATE INDEX idx_threads_recipient_user_id ON threads(recipient_user_id);
CREATE INDEX idx_threads_idea_id ON threads(idea_id);

-- Indexes for messages table
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_sender_user_id ON messages(sender_user_id);
CREATE INDEX idx_messages_file_id ON messages(file_id);

-- Indexes for thread_outcomes table
CREATE INDEX idx_thread_outcomes_thread_id ON thread_outcomes(thread_id);
CREATE INDEX idx_thread_outcomes_decided_by ON thread_outcomes(decided_by);

-- Indexes for reports_blocks table
CREATE INDEX idx_reports_blocks_thread_id ON reports_blocks(thread_id);
CREATE INDEX idx_reports_blocks_reporter_id ON reports_blocks(reporter_id);

-- Indexes for notifications table
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_entity_type_entity_id ON notifications(entity_type, entity_id);

-- Indexes for email_log table
CREATE INDEX idx_email_log_user_id ON email_log(user_id);
CREATE INDEX idx_email_log_template_key ON email_log(template_key);

-- Indexes for views_likes table
CREATE INDEX idx_views_likes_entity_type_entity_id ON views_likes(entity_type, entity_id);
CREATE INDEX idx_views_likes_user_id ON views_likes(user_id);

-- Create updated_at triggers for all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_permissions_updated_at BEFORE UPDATE ON admin_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audit_log_updated_at BEFORE UPDATE ON audit_log FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_score_history_updated_at BEFORE UPDATE ON score_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_steps_master_updated_at BEFORE UPDATE ON steps_master FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_master_lists_updated_at BEFORE UPDATE ON master_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventor_profiles_updated_at BEFORE UPDATE ON inventor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investor_profiles_updated_at BEFORE UPDATE ON investor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_case_studies_updated_at BEFORE UPDATE ON case_studies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_idea_steps_updated_at BEFORE UPDATE ON idea_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_field_visibility_updated_at BEFORE UPDATE ON field_visibility FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_file_access_requests_updated_at BEFORE UPDATE ON file_access_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nda_acceptances_updated_at BEFORE UPDATE ON nda_acceptances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_revisions_updated_at BEFORE UPDATE ON revisions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_threads_updated_at BEFORE UPDATE ON threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_thread_outcomes_updated_at BEFORE UPDATE ON thread_outcomes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_blocks_updated_at BEFORE UPDATE ON reports_blocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_log_updated_at BEFORE UPDATE ON email_log FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_views_likes_updated_at BEFORE UPDATE ON views_likes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed Data for steps_master
INSERT INTO steps_master (step_no, name, description, required_proof, points_awarded) VALUES
(1, 'Idea', 'Initial concept and problem identification', 'Description of problem, affected people, and current alternatives', 5),
(2, 'Fund', 'Securing funding commitments', 'Funding agreements, grant letters, or investment commitments', 10),
(3, 'Build', 'Creating prototype or MVP', 'Proof of development, prototype demo, or MVP', 15),
(4, 'Prove', 'Testing and validation', 'Test results, user feedback, or validation studies', 20),
(5, 'Protect', 'Intellectual property protection', 'Patent filings, trademark registrations, or legal protection', 10),
(6, 'Regulate', 'Regulatory compliance', 'Compliance certifications, approvals, or regulatory clearance', 10),
(7, 'Manufacture', 'Production readiness', 'Manufacturing partnerships, production plans, or prototypes', 10),
(8, 'Market', 'Marketing and launch strategy', 'Marketing plan, launch preparations, or partnership agreements', 10),
(9, 'Commercialise', 'Sales and market traction', 'Sales revenue, customer contracts, or market validation', 5),
(10, 'Scale', 'Expansion and significant growth', 'Expansion plans, franchising agreements, or growth metrics', 5);

-- Seed Data for master_lists
-- field_of_work
INSERT INTO master_lists (list_name, list_value, list_label, sort_order) VALUES
('field_of_work', 'medical_device', 'Medical Device', 1),
('field_of_work', 'software', 'Software', 2),
('field_of_work', 'materials', 'Materials', 3),
('field_of_work', 'energy', 'Energy', 4),
('field_of_work', 'agriculture', 'Agriculture', 5),
('field_of_work', 'other', 'Other', 6);

-- kind_of_idea
INSERT INTO master_lists (list_name, list_value, list_label, sort_order) VALUES
('kind_of_idea', 'device', 'Device', 1),
('kind_of_idea', 'software', 'Software', 2),
('kind_of_idea', 'material', 'Material', 3),
('kind_of_idea', 'research', 'Research', 4),
('kind_of_idea', 'service', 'Service', 5),
('kind_of_idea', 'process', 'Process', 6),
('kind_of_idea', 'business_model', 'Business Model', 7);

-- investor_type
INSERT INTO master_lists (list_name, list_value, list_label, sort_order) VALUES
('investor_type', 'grant_body', 'Grant Body', 1),
('investor_type', 'angel', 'Angel Investor', 2),
('investor_type', 'fund', 'Fund', 3),
('investor_type', 'company', 'Company', 4),
('investor_type', 'university', 'University', 5),
('investor_type', 'government_programme', 'Government Programme', 6),
('investor_type', 'crowdfunding_platform', 'Crowdfunding Platform', 7);

-- country (sample ISO codes)
INSERT INTO master_lists (list_name, list_value, list_label, sort_order) VALUES
('country', 'US', 'United States', 1),
('country', 'UK', 'United Kingdom', 2),
('country', 'CA', 'Canada', 3),
('country', 'DE', 'Germany', 4),
('country', 'FR', 'France', 5),
('country', 'AU', 'Australia', 6),
('country', 'JP', 'Japan', 7),
('country', 'IN', 'India', 8),
('country', 'BR', 'Brazil', 9),
('country', 'CN', 'China', 10);

-- badge
INSERT INTO master_lists (list_name, list_value, list_label, sort_order) VALUES
('badge', 'bronze', 'Bronze', 1),
('badge', 'silver', 'Silver', 2),
('badge', 'gold', 'Gold', 3);

-- contribution_type
INSERT INTO master_lists (list_name, list_value, list_label, sort_order) VALUES
('contribution_type', 'grant', 'Grant', 1),
('contribution_type', 'equity', 'Equity', 2),
('contribution_type', 'loan', 'Loan', 3),
('contribution_type', 'licence_advance', 'Licence Advance', 4),
('contribution_type', 'prize', 'Prize', 5),
('contribution_type', 'in_kind_help', 'In-kind Help', 6);

-- reply_speed
INSERT INTO master_lists (list_name, list_value, list_label, sort_order) VALUES
('reply_speed', 'within_a_week', 'Within a Week', 1),
('reply_speed', 'two_weeks', 'Two Weeks', 2),
('reply_speed', 'a_month', 'A Month', 3);

-- status_values
INSERT INTO master_lists (list_name, list_value, list_label, sort_order) VALUES
('status_values', 'active', 'Active', 1),
('status_values', 'off', 'Off', 2),
('status_values', 'suspended', 'Suspended', 3),
('status_values', 'under_review', 'Under Review', 4),
('status_values', 'under_decision', 'Under Decision', 5),
('status_values', 'pending', 'Pending', 6),
('status_values', 'approved', 'Approved', 7),
('status_values', 'rejected', 'Rejected', 8);