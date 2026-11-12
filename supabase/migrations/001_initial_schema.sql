-- ============================================================
-- Winick CRM — Initial Schema
-- Run this in the Supabase Dashboard > SQL Editor
-- ============================================================

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id              UUID REFERENCES categories(id) ON DELETE SET NULL,
  first_name               TEXT NOT NULL,
  last_name                TEXT,
  company                  TEXT,
  job_title                TEXT,
  email                    TEXT,
  phone                    TEXT,
  linkedin_url             TEXT,
  notes                    TEXT,
  outreach_frequency_days  INTEGER NOT NULL DEFAULT 30,
  last_contacted_at        TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Interactions
CREATE TABLE IF NOT EXISTS interactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id  UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('call','email','text','coffee','linkedin','meeting','other')),
  notes       TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Custom fields
CREATE TABLE IF NOT EXISTS contact_custom_fields (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id  UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  field_key   TEXT NOT NULL,
  field_value TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE categories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_custom_fields ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own data
CREATE POLICY "own categories" ON categories
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own contacts" ON contacts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own interactions" ON interactions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own custom fields" ON contact_custom_fields
  FOR ALL USING (
    EXISTS (SELECT 1 FROM contacts WHERE id = contact_id AND user_id = auth.uid())
  );

-- ============================================================
-- Indexes for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_contacts_user_id    ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_category_id ON contacts(category_id);
CREATE INDEX IF NOT EXISTS idx_interactions_contact ON interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_custom_fields_contact ON contact_custom_fields(contact_id);
