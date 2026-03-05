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
      navigator.clipboard
        .writeText(migrationScript)
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
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
          <div className="mb-6 flex items-start">
            <CheckCircle className="mt-1 mr-4 flex-shrink-0 text-blue-600" size={32} />
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Phase 2 Migration</h1>
              <p className="text-lg text-gray-600">Add Editorial & Review System tables</p>
            </div>
          </div>

          <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h3 className="mb-2 font-semibold text-blue-900">What's New in Phase 2:</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-blue-800">
              <li>Review assignments table for tracking reviewer invitations</li>
              <li>Editor permissions to view and manage all submissions</li>
              <li>Reviewer permissions to view assigned submissions</li>
              <li>Support for revision_required status</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Run Migration Script</h2>

            <ol className="mb-6 list-inside list-decimal space-y-3 text-gray-700">
              <li>
                Go to{' '}
                <a
                  href={`https://supabase.com/dashboard/project/${projectId}/sql/new`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 hover:underline"
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
              <pre className="max-h-96 overflow-x-auto overflow-y-auto rounded-lg bg-gray-900 p-6 text-sm text-gray-100">
                <code>{migrationScript}</code>
              </pre>
              <button
                onClick={copyToClipboard}
                className="absolute top-4 right-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Script'}
              </button>
            </div>

            {!executed ? (
              <div className="flex justify-end">
                <button
                  onClick={() => setExecuted(true)}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  I've Executed the Migration →
                </button>
              </div>
            ) : (
              <div className="rounded-lg border border-green-200 bg-green-50 p-6">
                <div className="mb-4 flex items-center">
                  <CheckCircle className="mr-3 text-green-600" size={24} />
                  <h3 className="font-semibold text-green-900">Migration Complete!</h3>
                </div>
                <p className="mb-4 text-sm text-green-800">
                  Phase 2 tables and permissions are now set up. You can now use the editor and
                  reviewer dashboards.
                </p>
                <div className="flex gap-3">
                  <a
                    href="/dashboard"
                    className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Go to Dashboard
                  </a>
                  <a
                    href="/editor"
                    className="rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300"
                  >
                    Editor Dashboard
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <h3 className="mb-2 flex items-center font-semibold text-yellow-900">
            <AlertCircle className="mr-2" size={20} />
            Important Notes
          </h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-yellow-800">
            <li>This migration is safe to run multiple times (uses IF NOT EXISTS)</li>
            <li>
              Make sure you've run the base database setup first at{' '}
              <a href="/setup-database" className="underline">
                /setup-database
              </a>
            </li>
            <li>Editors and reviewers need appropriate roles in user_roles table</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
