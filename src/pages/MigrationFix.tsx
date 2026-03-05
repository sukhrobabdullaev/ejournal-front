import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';
import { projectId } from '../utils/supabase/info.tsx';

export function MigrationFix() {
  const [copied, setCopied] = useState(false);
  const [executed, setExecuted] = useState(false);

  const migrationScript = `-- Migration: Add missing file_size column
-- This fixes the "Could not find the 'file_size' column" error

-- Add file_size column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'submission_files' 
    AND column_name = 'file_size'
  ) THEN
    ALTER TABLE submission_files ADD COLUMN file_size BIGINT;
  END IF;
END $$;`;

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
            <AlertCircle className="mt-1 mr-4 flex-shrink-0 text-red-600" size={32} />
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Database Migration Required</h1>
              <p className="text-lg text-gray-600">Fix the "file_size column not found" error</p>
            </div>
          </div>

          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-6">
            <h3 className="mb-2 font-semibold text-red-900">Error Details:</h3>
            <p className="mb-2 text-sm text-red-800">
              <code className="rounded bg-red-100 px-2 py-1">
                Could not find the 'file_size' column of 'submission_files' in the schema cache
              </code>
            </p>
            <p className="text-sm text-red-800">
              This error occurs because your database table is missing a required column. Run the
              migration script below to fix it.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Quick Fix: Run Migration Script
            </h2>

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
              <pre className="overflow-x-auto rounded-lg bg-gray-900 p-6 text-sm text-gray-100">
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
                  The file_size column has been added. You can now upload files without errors.
                </p>
                <div className="flex gap-3">
                  <a
                    href="/submit"
                    className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Try Upload Again
                  </a>
                  <a
                    href="/dashboard"
                    className="rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300"
                  >
                    Go to Dashboard
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h3 className="mb-2 font-semibold text-blue-900">What does this migration do?</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-blue-800">
              <li>
                Checks if the <code className="bg-blue-100 px-1">file_size</code> column exists
              </li>
              <li>Adds the column if it's missing (safe to run multiple times)</li>
              <li>Allows the app to store file size information with uploads</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <h3 className="mb-2 flex items-center font-semibold text-yellow-900">
            <AlertCircle className="mr-2" size={20} />
            Still Getting Errors?
          </h3>
          <p className="mb-2 text-sm text-yellow-800">
            If you continue to see errors after running this migration:
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-yellow-800">
            <li>Refresh your browser to clear the schema cache</li>
            <li>Verify the migration ran successfully in Supabase</li>
            <li>
              Check that storage policies are configured at{' '}
              <a href="/setup-storage" className="underline">
                /setup-storage
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
