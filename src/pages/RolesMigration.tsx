import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';
import { projectId } from '../utils/supabase/info.tsx';

export function RolesMigration() {
  const [copied, setCopied] = useState(false);
  const [executed, setExecuted] = useState(false);

  const migrationScript = `-- Roles Migration: Add active_role support
-- Run this script in Supabase SQL Editor

-- Add active_role column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'active_role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN active_role TEXT;
  END IF;
END $$;

-- Add check constraint for active_role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_active_role_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_active_role_check 
      CHECK (active_role IN ('author', 'reviewer', 'editor', 'admin', 'super_admin'));
  END IF;
END $$;

-- Normalize user_roles table to use 'role' column name
-- This checks if 'user_role' column exists and renames it to 'role'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_roles' 
    AND column_name = 'user_role'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_roles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE user_roles RENAME COLUMN user_role TO role;
  END IF;
END $$;

-- Set default active_role for users who don't have one
-- This will set it to their first role alphabetically
UPDATE profiles
SET active_role = (
  SELECT role 
  FROM user_roles 
  WHERE user_roles.user_id = profiles.id 
  ORDER BY role ASC 
  LIMIT 1
)
WHERE active_role IS NULL
AND EXISTS (
  SELECT 1 FROM user_roles WHERE user_roles.user_id = profiles.id
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
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Roles System Migration</h1>
              <p className="text-lg text-gray-600">
                Add multi-role support with active role switching
              </p>
            </div>
          </div>

          <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h3 className="mb-2 font-semibold text-blue-900">What's New:</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-blue-800">
              <li>
                Add <code className="bg-blue-100 px-1">active_role</code> column to profiles table
              </li>
              <li>Support for users with multiple roles (author + reviewer, etc.)</li>
              <li>
                Normalize column name from <code className="bg-blue-100 px-1">user_role</code> to{' '}
                <code className="bg-blue-100 px-1">role</code>
              </li>
              <li>Auto-set default active role for existing users</li>
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
                  Active role support is now enabled. Users with multiple roles can switch between
                  them.
                </p>
                <div className="flex gap-3">
                  <a
                    href="/dashboard"
                    className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Go to Dashboard
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
            <h3 className="mb-2 font-semibold text-yellow-900">Testing Multi-Role Users</h3>
            <p className="mb-3 text-sm text-yellow-800">
              To test the role switcher, add multiple roles to a user:
            </p>
            <pre className="overflow-x-auto rounded bg-yellow-900 p-4 text-xs text-yellow-100">
              {`-- Add multiple roles to a user
INSERT INTO user_roles (user_id, role)
VALUES 
  ('USER_UUID_HERE', 'author'),
  ('USER_UUID_HERE', 'reviewer')
ON CONFLICT (user_id, role) DO NOTHING;`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
