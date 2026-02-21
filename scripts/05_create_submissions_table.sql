-- Create submissions table for contact forms and other submissions
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_type VARCHAR(50) NOT NULL DEFAULT 'contact', -- 'contact', 'inquiry', etc
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  message TEXT,
  subject VARCHAR(255),
  status VARCHAR(50) DEFAULT 'new', -- 'new', 'read', 'replied', 'archived'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_type ON submissions(submission_type);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_email ON submissions(email);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);

-- Enable RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert submissions (for public contact form)
CREATE POLICY "Anyone can submit forms"
  ON submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users (admin) to read all submissions
CREATE POLICY "Admin can read submissions"
  ON submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users (admin) to update submissions
CREATE POLICY "Admin can update submissions"
  ON submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users (admin) to delete submissions
CREATE POLICY "Admin can delete submissions"
  ON submissions
  FOR DELETE
  TO authenticated
  USING (true);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_submissions_updated_at ON submissions;
CREATE TRIGGER trigger_submissions_updated_at
BEFORE UPDATE ON submissions
FOR EACH ROW
EXECUTE FUNCTION update_submissions_updated_at();
