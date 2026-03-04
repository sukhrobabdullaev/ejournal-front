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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Roles System Migration</h1>
              <p className="text-lg text-gray-600">
                Add multi-role support with active role switching
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">What's New:</h3>
            <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
              <li>Add <code className="bg-blue-100 px-1">active_role</code> column to profiles table</li>
              <li>Support for users with multiple roles (author + reviewer, etc.)</li>
              <li>Normalize column name from <code className="bg-blue-100 px-1">user_role</code> to <code className="bg-blue-100 px-1">role</code></li>
              <li>Auto-set default active role for existing users</li>
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
                  Active role support is now enabled. Users with multiple roles can switch between them.
                </p>
                <div className="flex gap-3">
                  <a
                    href="/dashboard"
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Go to Dashboard
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-semibold text-yellow-900 mb-2">Testing Multi-Role Users</h3>
            <p className="text-sm text-yellow-800 mb-3">
              To test the role switcher, add multiple roles to a user:
            </p>
            <pre className="bg-yellow-900 text-yellow-100 p-4 rounded text-xs overflow-x-auto">
{`-- Add multiple roles to a user
INSERT INTO user_roles (user_id, role)
VALUES 
  ('USER_UUID_HERE', 'author'),
  ('USER_UUID_HERE', 'reviewer')
ON CONFLICT (user_id, role) DO NOTHING;`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}