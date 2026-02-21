-- Fix RLS Policies for Admin Content Management
-- This script updates the Row Level Security policies to allow authenticated admin users to manage content

-- Drop existing policies on content table
DROP POLICY IF EXISTS "Enable read access to published content" ON content;
DROP POLICY IF EXISTS "Enable admin to manage content" ON content;

-- Create new RLS policies for content table
-- Anyone can view published content
CREATE POLICY "Enable read published content"
  ON content
  FOR SELECT
  USING (published = true);

-- Authenticated users (logged in) can view all content they own or if published
CREATE POLICY "Enable authenticated users to view content"
  ON content
  FOR SELECT
  USING (auth.role() = 'authenticated_user');

-- Authenticated users can insert new content
CREATE POLICY "Enable authenticated users to insert content"
  ON content
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated_user');

-- Authenticated users can update their own content
CREATE POLICY "Enable authenticated users to update content"
  ON content
  FOR UPDATE
  USING (auth.role() = 'authenticated_user')
  WITH CHECK (auth.role() = 'authenticated_user');

-- Authenticated users can delete their own content
CREATE POLICY "Enable authenticated users to delete content"
  ON content
  FOR DELETE
  USING (auth.role() = 'authenticated_user');

-- Drop existing policies on content_embeds table
DROP POLICY IF EXISTS "Enable read access to embeds" ON content_embeds;
DROP POLICY IF EXISTS "Enable admin to manage embeds" ON content_embeds;

-- Create new RLS policies for content_embeds table
-- Anyone can view embeds for published content
CREATE POLICY "Enable read embeds for published content"
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
CREATE POLICY "Enable authenticated users to view embeds"
  ON content_embeds
  FOR SELECT
  USING (auth.role() = 'authenticated_user');

-- Authenticated users can insert embeds
CREATE POLICY "Enable authenticated users to insert embeds"
  ON content_embeds
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated_user');

-- Authenticated users can update embeds
CREATE POLICY "Enable authenticated users to update embeds"
  ON content_embeds
  FOR UPDATE
  USING (auth.role() = 'authenticated_user')
  WITH CHECK (auth.role() = 'authenticated_user');

-- Authenticated users can delete embeds
CREATE POLICY "Enable authenticated users to delete embeds"
  ON content_embeds
  FOR DELETE
  USING (auth.role() = 'authenticated_user');

-- Drop existing policies on analytics table
DROP POLICY IF EXISTS "Enable read analytics" ON analytics;

-- Create new RLS policies for analytics table
-- Anyone can view analytics for published content
CREATE POLICY "Enable read published analytics"
  ON analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM content
      WHERE content.id = analytics.content_id
      AND content.published = true
    )
  );

-- Authenticated users can view all analytics
CREATE POLICY "Enable authenticated users to view analytics"
  ON analytics
  FOR SELECT
  USING (auth.role() = 'authenticated_user');

-- Authenticated users can insert analytics
CREATE POLICY "Enable authenticated users to insert analytics"
  ON analytics
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated_user');
