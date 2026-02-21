-- Seed initial categories for Radsting Dev

INSERT INTO categories (name, slug, description, icon, color_accent, display_order) VALUES
('Software Development', 'software-development', 'Full-stack web applications and coding projects', '💻', 'oklch(0.65 0.22 35)', 1),
('Video Editing', 'video-editing', 'Motion graphics and video content creation', '🎬', 'oklch(0.55 0.15 80)', 2),
('Graphic Design', 'graphic-design', 'Branding and visual design work', '🎨', 'oklch(0.4 0.1 140)', 3),
('Social Media & Meta Ads', 'social-media-ads', 'Social media strategy and paid advertising campaigns', '📱', 'oklch(0.6 0.18 40)', 4)
ON CONFLICT (name) DO NOTHING;
