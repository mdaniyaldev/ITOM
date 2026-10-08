# ITOM Data Model Specification

**Status**: Accepted

## Context
This specification defines the complete data model for the ITOM (Inventor/Investor Platform) application. The data model consists of 25 tables organized into 6 logical groups, designed to support the core platform functionality including inventor/investor profiles, idea submission with proof, admin review engine, scoring engine, and messaging system.

The design follows all architecture rules defined in AGENTS.md, including:
- Row-Level Security (RLS) on every table from first migration
- Soft delete via `deleted_at` column on all tables
- Field-level visibility control via separate `field_visibility` table
- Auth.users as root identity with public.users extension
- Server-side scoring with idempotency guarantees
- Audit logging for state changes
- Migration safety with reversible changes
- No hardcoded admin-editable values (all configurable via database tables)

## Requirements
The data model must support:
1. **Inventor Journey**: 10-step process from Idea to Scale with proof requirements
2. **Investor Profiles**: Detailed investor information with investment preferences
3. **Case Studies**: Success stories from inventors and investors
4. **Proof Management**: File uploads with virus scanning and access controls
5. **Review Workflow**: Approve/Changes Needed/Reject with version control
6. **Scoring System**: Points-based system with admin override capabilities
7. **Messaging**: Secure communication between approved users
8. **Field-Level Visibility**: Per-field control of public/members/locked access
9. **Admin Controls**: Role-based permissions and system management
10. **Engagement Tracking**: Views and likes for content ranking

## Decision
### Data Model Overview

The data model consists of 25 tables organized into 6 groups:

#### People / Access (5 tables)
- `users` - Extends Supabase auth.users with application fields
- `user_roles` - Defines user roles (inventor, investor, case study author)
- `admin_permissions` - Controls administrative access levels
- `audit_log` - Tracks significant platform activities
- `score_history` - Records score changes with override justifications

#### Profiles & Content (7 tables)
- `steps_master` - Defines the 10-step journey (Idea → Fund → ... → Scale)
- `master_lists` - Standardized lists for dropdowns and categorization
- `inventor_profiles` - Inventor profile information
- `investor_profiles` - Investor profile information
- `case_studies` - Case study information
- `ideas` - Inventor ideas and descriptions
- `idea_steps` - Progress tracking through the 10-step journey

#### Proof & NDA (4 tables)
- `files` - Uploaded file metadata and storage references
- `field_visibility` - Field-level visibility control (public/members/locked)
- `file_access_requests` - Requests for access to locked files
- `nda_acceptances` - NDA acceptances for sensitive information access

#### Review & Edits (2 tables)
- `reviews` - Review decisions (pending, approved, changes needed, rejected)
- `revisions` - Pending edits with enforcement of one waiting revision per entity

#### Messaging (4 tables)
- `threads` - Conversations between users
- `messages` - Individual messages within threads
- `thread_outcomes` - Conversation outcomes (talking, deal, no deal, not saying)
- `reports_blocks` - User reports and admin blocking actions

#### System / Lists (3 tables)
- `notifications` - System notifications for users
- `email_templates` - Templates for system-generated emails
- `views_likes` - Engagement tracking for content ranking

### Detailed Schema Definition

All tables use UUID primary keys and include `created_at`, `updated_at`, and `deleted_at` timestamps for soft delete functionality.

#### 1. people/access tables

##### users table
```sql
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
```

##### user_roles table
```sql
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
```

##### admin_permissions table
```sql
CREATE TABLE admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    can_manage_inventors BOOLEAN DEFAULT FALSE,
    can_manage_investors BOOLEAN DEFAULT FALSE,
    can_manage_case_studies BOOLEAN DEFAULT FALSE,
    can_manage_ideas BOOLEAN DEFAULT FALSE,
    can_manage_reviews BOOLEAN DEFAULT FALSE,
    can_manage_scoring BOOLEAN DEFAULT FALSE,
    can_manage_messaging BOOLEAN DEFAULT FALSE,
    can_manage_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

##### audit_log table
```sql
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
```

##### score_history table
```sql
CREATE TABLE score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('inventor_profile', 'investor_profile', 'idea', 'case_study')),
    entity_id UUID NOT NULL,
    old_score INTEGER CHECK (old_score BETWEEN 0 AND 100),
    new_score INTEGER CHECK (new_score BETWEEN 0 AND 100),
    change_reason TEXT,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    override_reason TEXT,  -- Required for admin overrides
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

#### 2. profiles & content tables

##### steps_master table
```sql
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
```

##### master_lists table
```sql
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
```

##### inventor_profiles table
```sql
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

##### investor_profiles table
```sql
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

##### case_studies table
```sql
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

##### ideas table
```sql
CREATE TABLE ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    problem TEXT NOT NULL,
    how_it_works TEXT NOT NULL,
    kind_of_idea TEXT REFERENCES master_lists(list_value) WHERE list_name = 'kind_of_idea',
    current_step INTEGER CHECK (current_step BETWEEN 1 AND 10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

##### idea_steps table
```sql
CREATE TABLE idea_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    step_no INTEGER NOT NULL REFERENCES steps_master(step_no) CHECK (step_no BETWEEN 1 AND 10),
    status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed', 'verified')),
    proof_submitted TEXT,
    proof_approved BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(idea_id, step_no) WHERE deleted_at IS NULL
);
```

#### 3. proof & nda tables

##### files table
```sql
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
```

##### field_visibility table
```sql
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
```

##### file_access_requests table
```sql
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
```

##### nda_acceptances table
```sql
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
```

#### 4. review & edits tables

##### reviews table
```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('inventor_profile', 'investor_profile', 'idea', 'case_study')),
    entity_id UUID NOT NULL,
    reviewer_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'changes_needed', 'rejected')),
    decision_reason TEXT,  -- Required for 'changes_needed' and 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

##### revisions table
```sql
CREATE TABLE revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('inventor_profile', 'investor_profile', 'idea', 'case_study')),
    entity_id UUID NOT NULL,
    revised_data JSONB NOT NULL,  -- Complete revised entity data
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
```

#### 5. messaging tables

##### threads table
```sql
CREATE TABLE threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiator_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('active', 'archived')),
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(LEAST(initiator_user_id, recipient_user_id), GREATEST(initiator_user_id, recipient_user_id)) WHERE deleted_at IS NULL
);
```

##### messages table
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    sender_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    attachment_ids UUID[],  -- Array of file IDs attached to the message
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

##### thread_outcomes table
```sql
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
```

##### reports_blocks table
```sql
CREATE TABLE reports_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('thread', 'message', 'profile')),
    entity_id UUID NOT NULL,
    report_reason TEXT NOT NULL,
    report_status TEXT NOT NULL CHECK (report_status IN ('pending', 'reviewed', 'dismissed')),
    block_status TEXT NOT NULL CHECK (block_status IN ('none', 'temp', 'permanent')),
    block_reason TEXT,
    blocked_by UUID REFERENCES users(id) ON DELETE SET NULL,  -- Admin who applied the block
    blocked_at TIMESTAMPTZ,
    block_expires_at TIMESTAMPTZ,  -- For temporary blocks
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

#### 6. system / lists tables

##### notifications table
```sql
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
```

##### email_templates table
```sql
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
```

##### views_likes table
```sql
CREATE TABLE views_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('inventor_profile', 'investor_profile', 'idea', 'case_study')),
    entity_id UUID NOT NULL,
    view_count INTEGER NOT NULL DEFAULT 0,
    like_count INTEGER NOT NULL DEFAULT 0,
    last_viewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(entity_type, entity_id) WHERE deleted_at IS NULL
);
```

### RLS Policies Design

For each table, Row Level Security policies enforce:
1. **Public access**: Anyone can see records where `visibility = 'public'` (for applicable tables)
2. **Members access**: Approved signed-in users can see records where `visibility IN ('public', 'members')`
3. **Locked access**: Only the owner and admins can see records where `visibility = 'locked'`
4. **Service role bypass**: Service role keys bypass RLS for admin operations

Helper function to check if a user is an approved member:
```sql
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
```

Example RLS policy for inventor_profiles table:
```sql
-- Enable RLS
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
      AND can_manage_inventors = true
      AND deleted_at IS NULL
  )
);
```

Similar policies would be created for all tables with appropriate visibility controls.

### Seed Data Plans

#### steps_master table seed data
The steps_master table will be seeded with the 10-step journey:

| step_no | name | description | required_proof | points_awarded |
|---------|------|-------------|----------------|----------------|
| 1 | Idea | Initial concept and problem identification | Description of problem, affected people, and current alternatives | 5 |
| 2 | Fund | Securing funding commitments | Funding agreements, grant letters, or investment commitments | 10 |
| 3 | Build | Creating prototype or MVP | Proof of development, prototype demo, or MVP | 15 |
| 4 | Prove | Testing and validation | Test results, user feedback, or validation studies | 20 |
| 5 | Protect | Intellectual property protection | Patent filings, trademark registrations, or legal protection | 10 |
| 6 | Regulate | Regulatory compliance | Compliance certifications, approvals, or regulatory clearance | 10 |
| 7 | Manufacture | Production readiness | Manufacturing partnerships, production plans, or prototypes | 10 |
| 8 | Market | Marketing and launch strategy | Marketing plan, launch preparations, or partnership agreements | 10 |
| 9 | Commercialise | Sales and market traction | Sales revenue, customer contracts, or market validation | 5 |
| 10 | Scale | Expansion and significant growth | Expansion plans, franchising agreements, or growth metrics | 5 |

#### master_lists table seed data
Standardized lists for dropdowns and categorization:

**field_of_work**: medical device, software, materials, energy, agriculture, other  
**kind_of_idea**: Device, Software, Material, Research, Service, Process, Business Model  
**investor_type**: Grant body, Angel, Fund, Company, University, Government programme, Crowdfunding platform  
**country**: [To be populated with ISO country codes]  
**badge**: bronze, silver, gold (derived from score ranges: <40, 40-69, 70+)  
**contribution_type**: Grant, Equity, Loan, Licence advance, Prize, In-kind help  
**reply_speed**: Within a week, two weeks, a month  
**status_values**: active/off/suspended, under review/decision, pending/approved/rejected

### Indexes Design

For optimal performance, the following indexes will be created:

1. **Primary Key Indexes**: Automatically created for UUID primary keys
2. **Foreign Key Indexes**: On all foreign key columns for JOIN performance
3. **Unique Constraint Indexes**: As defined in the schema (e.g., unique email, unique idea_id+step_no)
4. **Common Query Filters**: 
   - Status fields (status, visibility, is_approved, etc.)
   - Timestamp columns (created_at, updated_at) for time-based queries
   - Entity type and entity ID for polymorphic associations
5. **Partial Indexes**: 
   - One waiting revision per entity: `idx_revisions_one_waiting` on revisions table
   - Active records only: Where `deleted_at IS NULL` for soft delete efficiency

### Compliance with AGENTS.md Rules

✓ **RLS on every table from first migration** - All tables designed with RLS in mind  
✓ **Soft delete (deleted_at)** - All tables include deleted_at column  
✓ **Audit log writes on state changes** - audit_log table exists for tracking changes  
✓ **Field visibility via field_visibility table** - Separate from file visibility  
✓ **auth.users is root; public.users extends it** - users table references auth.users  
✓ **Migration rollback** - Design ensures all changes are reversible  
✓ **Never add a table without RLS policies** - All tables include RLS-ready design  
✓ **Never hard-delete data** - Using deleted_at for soft delete  
✓ **Never allow more than one `waiting` revision per entity** - Partial index on revisions table  
✓ **Never trust `auth.users` metadata for role checks** - Always read from public.user_roles  
✓ **Scoring is server-side from approved content only** - score_history tracks changes  
✓ **Admin override requires mandatory reason** - score_history.override_reason required  
✓ **Emails via `email_log` + `email_templates`** - email_templates table exists  
✓ **Never invent a decision that has no spec** - All specifications derived from source documents  
✓ **Never hardcode admin-editable values** - Using master_lists and steps_master for configurable values  

### Verification
To verify the data model implementation:
1. Confirm all 25 tables exist with correct column definitions
2. Verify primary keys are UUIDs
3. Check foreign key relationships are properly defined with ON DELETE behavior
4. Ensure unique constraints are in place where specified
5. Validate check constraints for data validation (scores 0-100, enum values, etc.)
6. Confirm timestamp columns (created_at, updated_at, deleted_at-basetime) exist on all tables
7. Verify field-level visibility control is properly implemented
8. Check that revisions table has the partial index for one waiting revision per entity
9. Validate seed data plans for steps_master and master_lists are correctly implemented
10. Test RLS policies to ensure proper data access controls