import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';
import { projectId } from '../utils/supabase/info.tsx';

export function Phase2Migration() {
  const [copied, setCopied] = useState(false);
  const [executed, setExecuted] = useState(false);

  const migrationScript = `-- Phase 2 Migration: Editorial & Review System
-- Run this script in Supabase SQL Editor

-- Create review_assignments table
CREATE TABLE IF NOT EXISTS review_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('invited', 'accepted', 'declined', 'completed')) DEFAULT 'invited',
  invite_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  decision TEXT CHECK (decision IN ('accept', 'minor_revision', 'major_revision', 'reject')),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_assignments_submission_id ON review_assignments(submission_id);
CREATE INDEX IF NOT EXISTS idx_review_assignments_reviewer_id ON review_assignments(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_review_assignments_invite_token ON review_assignments(invite_token);
CREATE INDEX IF NOT EXISTS idx_review_assignments_status ON review_assignments(status);

-- Add revision_required status to submissions if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'submissions_status_check'
  ) THEN
    ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_status_check;
    ALTER TABLE submissions ADD CONSTRAINT submissions_status_check 
      CHECK (status IN ('draft', 'submitted', 'under_review', 'revision_required', 'accepted', 'rejected', 'published'));
  END IF;
END $$;

-- Enable RLS for review_assignments
ALTER TABLE review_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for review_assignments

-- Reviewers can view their own assignments
CREATE POLICY "Reviewers can view own assignments" ON review_assignments FOR SELECT 
  USING (reviewer_id = auth.uid());

-- Editors can view all assignments
CREATE POLICY "Editors can view all assignments" ON review_assignments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('editor', 'admin')
    )
  );

-- Editors can insert assignments
CREATE POLICY "Editors can insert assignments" ON review_assignments FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('editor', 'admin')
    )
  );

-- Reviewers can update their own assignments
CREATE POLICY "Reviewers can update own assignments" ON review_assignments FOR UPDATE 
  USING (reviewer_id = auth.uid());

-- Editors can update all assignments
CREATE POLICY "Editors can update all assignments" ON review_assignments FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('editor', 'admin')
    )
  );

-- Update submissions RLS to allow editors to view all
CREATE POLICY "Editors can view all submissions" ON submissions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('editor', 'admin')
    )
  );

-- Editors can update all submissions
CREATE POLICY "Editors can update all submissions" ON submissions FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('editor', 'admin')
    )
  );

-- Allow editors to view all submission files
CREATE POLICY "Editors can view all submission files" ON submission_files FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('editor', 'admin')
    )
  );

-- Allow reviewers to view files for assigned submissions
CREATE POLICY "Reviewers can view assigned submission files" ON submission_files FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM review_assignments 
      WHERE review_assignments.submission_id = submission_files.submission_id
      AND review_assignments.reviewer_id = auth.uid()
      AND review_assignments.status IN ('accepted', 'completed')
    )
  );`;

  const copyToClipboard = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(migrationScript)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          fallbackCopyToClipboard();
        });
    } else {
      fallbackCopyToClipboard();
    }
  };

  const fallbackCopyToClipboard = () => {
    const textArea = document.createElement('textarea');
    textArea.value = migrationScript;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Failed to copy. Please select and copy the text manually.');
    }
    
    document.body.removeChild(textArea);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-start mb-6">
            <CheckCircle className="text-blue-600 mr-4 flex-shrink-0 mt-1" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Phase 2 Migration</h1>
              <p className="text-lg text-gray-600">
                Add Editorial & Review System tables
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">What's New in Phase 2:</h3>
            <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
              <li>Review assignments table for tracking reviewer invitations</li>
              <li>Editor permissions to view and manage all submissions</li>
              <li>Reviewer permissions to view assigned submissions</li>
              <li>Support for revision_required status</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Run Migration Script</h2>
            
            <ol className="list-decimal list-inside space-y-3 mb-6 text-gray-700">
              <li>
                Go to{' '}
                <a 
                  href={`https://supabase.com/dashboard/project/${projectId}/sql/new`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Supabase SQL Editor
                </a>
              </li>
              <li>Click "New Query"</li>
              <li>Copy the migration script below</li>
              <li>Paste it into the SQL Editor</li>
              <li>Click "Run" to execute</li>
            </ol>

            <div className="relative mb-6">
              <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm max-h-96 overflow-y-auto">
                <code>{migrationScript}</code>
              </pre>
              <button
                onClick={copyToClipboard}
                className="absolute top-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Script'}
              </button>
            </div>

            {!executed ? (
              <div className="flex justify-end">
                <button
                  onClick={() => setExecuted(true)}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  I've Executed the Migration →
                </button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="text-green-600 mr-3" size={24} />
                  <h3 className="font-semibold text-green-900">Migration Complete!</h3>
                </div>
                <p className="text-sm text-green-800 mb-4">
                  Phase 2 tables and permissions are now set up. You can now use the editor and reviewer dashboards.
                </p>
                <div className="flex gap-3">
                  <a
                    href="/dashboard"
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Go to Dashboard
                  </a>
                  <a
                    href="/editor"
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Editor Dashboard
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            Important Notes
          </h3>
          <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
            <li>This migration is safe to run multiple times (uses IF NOT EXISTS)</li>
            <li>Make sure you've run the base database setup first at <a href="/setup-database" className="underline">/setup-database</a></li>
            <li>Editors and reviewers need appropriate roles in user_roles table</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
