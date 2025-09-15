/*
  # Add advisor_summary column to assessment_results table

  1. Changes
    - Add advisor_summary column to store AI-generated insights for advisors
    - Column is nullable to support existing records
    - Text type to store markdown-formatted content

  2. Purpose
    - Store AI-generated advisor summaries for each completed assessment
    - Allow advisors to see personalized insights about their clients
*/

ALTER TABLE assessment_results 
ADD COLUMN IF NOT EXISTS advisor_summary text;

-- Add comment to document the column purpose
COMMENT ON COLUMN assessment_results.advisor_summary IS 'AI-generated advisor summary with insights about the client based on their assessment results';