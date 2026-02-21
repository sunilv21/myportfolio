-- Simplified RLS Policies for Radsting Dev Admin Access
-- This script allows ANY authenticated user (logged-in user) to create and manage content
-- Use this if the admin profile check is not working

-- Drop all existing policies on content table
DROP POLICY IF EXISTS "Enable read published content" ON content;
DROP POLICY IF EXISTS "Enable authenticated users to view content" ON content;
DROP POLICY IF EXISTS "Enable authenticated users to insert content" ON content;
DROP POLICY IF EXISTS "Enable authenticated users to update content" ON content;
DROP POLICY IF EXISTS "Enable authenticated users to delete content" ON content;
DROP POLICY IF EXISTS "Published content is publicly readable" ON content;
DROP POLICY IF EXISTS "Admins can view all content" ON content;
DROP POLICY IF EXISTS "Admins can manage content" ON content;

-- Simplified Content Policies
-- Anyone can view published content
CREATE POLICY "Public can view published content"
  ON content
  FOR SELECT
  USING (published = true);

-- Authenticated users can view all content (to see drafts)
CREATE POLICY "Auth users can view all content"
  ON content
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ANY authenticated user can insert content
CREATE POLICY "Auth users can insert content"
  ON content
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ANY authenticated user can update content
CREATE POLICY "Auth users can update content"
  ON content
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ANY authenticated user can delete content
CREATE POLICY "Auth users can delete content"
  ON content
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Drop all existing policies on content_embeds table
DROP POLICY IF EXISTS "Enable read embeds for published content" ON content_embeds;
DROP POLICY IF EXISTS "Enable authenticated users to view embeds" ON content_embeds;
DROP POLICY IF EXISTS "Enable authenticated users to insert embeds" ON content_embeds;
DROP POLICY IF EXISTS "Enable authenticated users to update embeds" ON content_embeds;
DROP POLICY IF EXISTS "Enable authenticated users to delete embeds" ON content_embeds;
DROP POLICY IF EXISTS "Published embeds are viewable" ON content_embeds;
DROP POLICY IF EXISTS "Admins can manage embeds" ON content_embeds;

-- Simplified Content Embeds Policies
-- Anyone can view embeds for published content
CREATE POLICY "Public can view published embeds"
  ON content_embeds
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM content
      WHERE content.id = content_embeds.content_id
      AND content.published = true
    )
  );

-- Authenticated users can view all embeds
CREATE POLICY "Auth users can view all embeds"
  ON content_embeds
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can insert embeds
CREATE POLICY "Auth users can insert embeds"
  ON content_embeds
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update embeds
CREATE POLICY "Auth users can update embeds"
  ON content_embeds
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Authenticated users can delete embeds
CREATE POLICY "Auth users can delete embeds"
  ON content_embeds
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Drop all existing policies on analytics table
DROP POLICY IF EXISTS "Enable read published analytics" ON analytics;
DROP POLICY IF EXISTS "Enable authenticated users to view analytics" ON analytics;
DROP POLICY IF EXISTS "Enable authenticated users to insert analytics" ON analytics;
DROP POLICY IF EXISTS "Anyone can record analytics" ON analytics;
DROP POLICY IF EXISTS "Only admins can view analytics" ON analytics;

-- Simplified Analytics Policies
-- Anyone can insert analytics (tracking)
CREATE POLICY "Anyone can record analytics"
  ON analytics
  FOR INSERT
  WITH CHECK (true);

-- Authenticated users can view analytics
CREATE POLICY "Auth users can view analytics"
  ON analytics
  FOR SELECT
  USING (auth.role() = 'authenticated');
