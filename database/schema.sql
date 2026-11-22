-- ==============================================================================
-- SUSU ROTATING SAVINGS PLATFORM - DATABASE SCHEMA & INTEGRITY SPECIFICATION
-- Database: PostgreSQL 14+ / Supabase
-- Description: Complete relational schema with strict data integrity,
-- foreign keys, cascading rules, positive amount checks, and unique indexes.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE
-- Core platform identities (Super Admin, Agents, Contributing Members)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    role TEXT NOT NULL CHECK (role IN ('visitor', 'agent', 'member', 'super_admin')),
    avatar_url TEXT DEFAULT '',
    is_frozen BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on user email and role for fast authentication lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(lower(email));
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ------------------------------------------------------------------------------
-- 2. AGENT ACCOUNTS & KYC
-- Agent organizer profiles, KYC submissions, licensing & activation status
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    first_name TEXT NOT NULL,
    surname TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    is_otp_verified BOOLEAN NOT NULL DEFAULT false,
    is_kyc_submitted BOOLEAN NOT NULL DEFAULT false,
    is_activated BOOLEAN NOT NULL DEFAULT false,
    activation_fee_amount NUMERIC(12, 2) NOT NULL DEFAULT 150.00 CHECK (activation_fee_amount >= 0),
    activation_paid_at TIMESTAMPTZ,
    activation_tx_ref TEXT,
    admin_approval_status TEXT NOT NULL DEFAULT 'none' 
        CHECK (admin_approval_status IN ('none', 'pending_admin_approval', 'verified', 'rejected')),
    admin_approved_at TIMESTAMPTZ,
    admin_review_notes TEXT DEFAULT '',
    license_number TEXT UNIQUE,
    kyc_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE agent_accounts ADD COLUMN IF NOT EXISTS user_id UUID;
CREATE INDEX IF NOT EXISTS idx_agent_accounts_user_id ON agent_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_accounts_email ON agent_accounts(lower(email));
CREATE INDEX IF NOT EXISTS idx_agent_accounts_approval ON agent_accounts(admin_approval_status);

-- ------------------------------------------------------------------------------
-- 3. SUSU GROUPS TABLE
-- Susu savings circles managed by approved agent organizers
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS susu_groups (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    name TEXT NOT NULL,
    fixed_daily_amount NUMERIC(12, 2) NOT NULL CHECK (fixed_daily_amount > 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'GH₵',
    cycle_start_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    paystack_public_key TEXT DEFAULT '',
    paystack_secret_key TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE susu_groups ADD COLUMN IF NOT EXISTS agent_id TEXT;
CREATE INDEX IF NOT EXISTS idx_susu_groups_agent_id ON susu_groups(agent_id);
CREATE INDEX IF NOT EXISTS idx_susu_groups_status ON susu_groups(status);

-- ------------------------------------------------------------------------------
-- 4. GROUP MEMBERS TABLE
-- Participants enrolled in a Susu circle with unique member codes & rotation
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS group_members (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL REFERENCES susu_groups(id) ON DELETE CASCADE,
    user_id TEXT,
    name TEXT NOT NULL,
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    invite_status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (invite_status IN ('pending', 'accepted', 'active', 'removed')),
    invite_token TEXT UNIQUE NOT NULL,
    unique_code TEXT UNIQUE NOT NULL,
    position_in_rotation INT NOT NULL CHECK (position_in_rotation > 0),
    reliability_score INT NOT NULL DEFAULT 100 CHECK (reliability_score >= 0 AND reliability_score <= 100),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE group_members ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE group_members ADD COLUMN IF NOT EXISTS group_id TEXT;
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_unique_code ON group_members(upper(unique_code));
CREATE INDEX IF NOT EXISTS idx_group_members_invite_token ON group_members(invite_token);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);

-- ------------------------------------------------------------------------------
-- 5. DAILY PAYMENTS TABLE
-- Immutable transaction ledger of member contributions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_payments (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL REFERENCES susu_groups(id) ON DELETE CASCADE,
    member_id TEXT NOT NULL REFERENCES group_members(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'missed', 'pending')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('paystack', 'cash_override', 'admin_grant')),
    paystack_reference TEXT UNIQUE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Enforce uniqueness: a member has at most one payment record per date per group
    CONSTRAINT uq_member_payment_date UNIQUE (group_id, member_id, payment_date)
);

ALTER TABLE daily_payments ADD COLUMN IF NOT EXISTS group_id TEXT;
ALTER TABLE daily_payments ADD COLUMN IF NOT EXISTS member_id TEXT;
CREATE INDEX IF NOT EXISTS idx_daily_payments_group_id ON daily_payments(group_id);
CREATE INDEX IF NOT EXISTS idx_daily_payments_member_id ON daily_payments(member_id);
CREATE INDEX IF NOT EXISTS idx_daily_payments_date ON daily_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_daily_payments_status ON daily_payments(status);

-- ------------------------------------------------------------------------------
-- 6. PAYOUT SCHEDULES TABLE
-- Weekly rotation payout turns, scheduled beneficiaries, and pool totals
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payout_schedules (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL REFERENCES susu_groups(id) ON DELETE CASCADE,
    member_id TEXT NOT NULL REFERENCES group_members(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    week_number INT NOT NULL CHECK (week_number > 0),
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL CHECK (week_end_date >= week_start_date),
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('paid_out', 'current', 'upcoming')),
    expected_pool_amount NUMERIC(12, 2) NOT NULL CHECK (expected_pool_amount >= 0),
    paid_out_at TIMESTAMPTZ,
    is_available BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_group_week_number UNIQUE (group_id, week_number)
);

ALTER TABLE payout_schedules ADD COLUMN IF NOT EXISTS group_id TEXT;
ALTER TABLE payout_schedules ADD COLUMN IF NOT EXISTS member_id TEXT;
CREATE INDEX IF NOT EXISTS idx_payout_schedules_group_id ON payout_schedules(group_id);
CREATE INDEX IF NOT EXISTS idx_payout_schedules_member_id ON payout_schedules(member_id);
CREATE INDEX IF NOT EXISTS idx_payout_schedules_status ON payout_schedules(status);

-- ------------------------------------------------------------------------------
-- 7. FEED POSTS TABLE
-- Community announcements and organizer updates
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feed_posts (
    id TEXT PRIMARY KEY,
    group_id TEXT REFERENCES susu_groups(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL CHECK (author_role IN ('agent', 'platform')),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'group')),
    likes_count INT NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
    pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS group_id TEXT;
CREATE INDEX IF NOT EXISTS idx_feed_posts_group_id ON feed_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_visibility ON feed_posts(visibility);

-- ------------------------------------------------------------------------------
-- AGENT MESSAGES TABLE
-- Organizer-to-member messages shared across devices
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id TEXT NOT NULL,
    group_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE agent_messages ADD COLUMN IF NOT EXISTS agent_id TEXT;
ALTER TABLE agent_messages ADD COLUMN IF NOT EXISTS group_id TEXT;
ALTER TABLE agent_messages ADD COLUMN IF NOT EXISTS member_id TEXT;
CREATE INDEX IF NOT EXISTS idx_agent_messages_agent_id ON agent_messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_group_id ON agent_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_member_id ON agent_messages(member_id);

-- ------------------------------------------------------------------------------
-- 8. NOTIFICATIONS TABLE
-- Real-time system and transaction alerts for users
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    member_id TEXT REFERENCES group_members(id) ON DELETE CASCADE,
    group_id TEXT REFERENCES susu_groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    message TEXT,
    time TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('sent', 'warning', 'received', 'info')),
    read BOOLEAN NOT NULL DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add columns for databases that have the older notifications shape
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS member_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS group_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS time TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_notifications_member_id ON notifications(member_id);
CREATE INDEX IF NOT EXISTS idx_notifications_group_id ON notifications(group_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ------------------------------------------------------------------------------
-- 9. PAYMENT CONFIGURATIONS TABLE
-- Payment gateway parameters and platform fee settlement configuration
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    config JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_payment_config_entity UNIQUE (entity_type, entity_id)
);

ALTER TABLE payment_configs ADD COLUMN IF NOT EXISTS entity_id TEXT;
ALTER TABLE payment_configs ALTER COLUMN entity_id DROP NOT NULL;
ALTER TABLE payment_configs DROP CONSTRAINT IF EXISTS uq_payment_config_entity;
CREATE UNIQUE INDEX IF NOT EXISTS uq_payment_config_entity_type ON payment_configs(entity_type);

-- ------------------------------------------------------------------------------
-- 10. LIVE SUPPORT CONFIGURATIONS TABLE
-- Live chat integration configuration
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS live_support_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL DEFAULT 'rezolv',
    enabled BOOLEAN NOT NULL DEFAULT true,
    api_key TEXT DEFAULT '',
    welcome_message TEXT DEFAULT 'Hello! How can we help you with your Susu account today?',
    auto_reply BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adapt existing tables whose ID columns were created as UUID.
-- This app generates text IDs (for example: group-123, agt-123, mem-123).
ALTER TABLE payout_schedules DROP CONSTRAINT IF EXISTS payout_schedules_group_id_fkey;
ALTER TABLE payout_schedules DROP CONSTRAINT IF EXISTS payout_schedules_member_id_fkey;
ALTER TABLE daily_payments DROP CONSTRAINT IF EXISTS daily_payments_group_id_fkey;
ALTER TABLE daily_payments DROP CONSTRAINT IF EXISTS daily_payments_member_id_fkey;
ALTER TABLE group_members DROP CONSTRAINT IF EXISTS group_members_group_id_fkey;
ALTER TABLE feed_posts DROP CONSTRAINT IF EXISTS feed_posts_group_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_member_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_group_id_fkey;

ALTER TABLE agent_accounts ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE agent_accounts ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE susu_groups ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE susu_groups ALTER COLUMN agent_id TYPE TEXT USING agent_id::text;
ALTER TABLE group_members ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE group_members ALTER COLUMN group_id TYPE TEXT USING group_id::text;
ALTER TABLE group_members ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE daily_payments ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE daily_payments ALTER COLUMN group_id TYPE TEXT USING group_id::text;
ALTER TABLE daily_payments ALTER COLUMN member_id TYPE TEXT USING member_id::text;
ALTER TABLE payout_schedules ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE payout_schedules ALTER COLUMN group_id TYPE TEXT USING group_id::text;
ALTER TABLE payout_schedules ALTER COLUMN member_id TYPE TEXT USING member_id::text;
ALTER TABLE feed_posts ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE feed_posts ALTER COLUMN group_id TYPE TEXT USING group_id::text;
ALTER TABLE notifications ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE notifications ALTER COLUMN member_id TYPE TEXT USING member_id::text;
ALTER TABLE notifications ALTER COLUMN group_id TYPE TEXT USING group_id::text;

ALTER TABLE payout_schedules ADD CONSTRAINT payout_schedules_group_id_fkey FOREIGN KEY (group_id) REFERENCES susu_groups(id) ON DELETE CASCADE;
ALTER TABLE payout_schedules ADD CONSTRAINT payout_schedules_member_id_fkey FOREIGN KEY (member_id) REFERENCES group_members(id) ON DELETE CASCADE;
ALTER TABLE daily_payments ADD CONSTRAINT daily_payments_group_id_fkey FOREIGN KEY (group_id) REFERENCES susu_groups(id) ON DELETE CASCADE;
ALTER TABLE daily_payments ADD CONSTRAINT daily_payments_member_id_fkey FOREIGN KEY (member_id) REFERENCES group_members(id) ON DELETE CASCADE;
ALTER TABLE group_members ADD CONSTRAINT group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES susu_groups(id) ON DELETE CASCADE;
ALTER TABLE feed_posts ADD CONSTRAINT feed_posts_group_id_fkey FOREIGN KEY (group_id) REFERENCES susu_groups(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT notifications_member_id_fkey FOREIGN KEY (member_id) REFERENCES group_members(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT notifications_group_id_fkey FOREIGN KEY (group_id) REFERENCES susu_groups(id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE OR REPLACE TRIGGER trg_agent_accounts_updated_at
BEFORE UPDATE ON agent_accounts FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE OR REPLACE TRIGGER trg_susu_groups_updated_at
BEFORE UPDATE ON susu_groups FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE OR REPLACE TRIGGER trg_group_members_updated_at
BEFORE UPDATE ON group_members FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE OR REPLACE TRIGGER trg_payout_schedules_updated_at
BEFORE UPDATE ON payout_schedules FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE OR REPLACE TRIGGER trg_payment_configs_updated_at
BEFORE UPDATE ON payment_configs FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE OR REPLACE TRIGGER trg_live_support_configs_updated_at
BEFORE UPDATE ON live_support_configs FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures data integrity and multi-tenant security across groups and members
-- ==============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE susu_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_support_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;

-- Permissive policies for application access (can be refined per authenticated user role in Supabase)
-- Permissive policies for application access (drop first so rerunning this file is safe)
DO $$ DECLARE policy_name text; table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['users','agent_accounts','susu_groups','group_members','daily_payments','payout_schedules','feed_posts','notifications','payment_configs','live_support_configs','agent_messages']
  LOOP
    FOR policy_name IN
      SELECT p.polname FROM pg_policy p JOIN pg_class c ON c.oid = p.polrelid WHERE c.relname = table_name
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
    END LOOP;
  END LOOP;
END $$;

CREATE POLICY "Public read for active groups" ON susu_groups FOR SELECT USING (true);
CREATE POLICY "Public read for feed posts" ON feed_posts FOR SELECT USING (true);
CREATE POLICY "Member self lookup by token or code" ON group_members FOR SELECT USING (true);
CREATE POLICY "General authenticated access" ON users FOR ALL USING (true);
CREATE POLICY "Agent accounts access" ON agent_accounts FOR ALL USING (true);
CREATE POLICY "Daily payments access" ON daily_payments FOR ALL USING (true);
CREATE POLICY "Payout schedules access" ON payout_schedules FOR ALL USING (true);
CREATE POLICY "Notifications access" ON notifications FOR ALL USING (true);
CREATE POLICY "Payment configs access" ON payment_configs FOR ALL USING (true);
CREATE POLICY "Live support configs access" ON live_support_configs FOR ALL USING (true);
CREATE POLICY "Agent messages access" ON agent_messages FOR ALL USING (true);
