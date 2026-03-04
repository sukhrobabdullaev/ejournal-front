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
            <AlertCircle className="text-red-600 mr-4 flex-shrink-0 mt-1" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Migration Required</h1>
              <p className="text-lg text-gray-600">
                Fix the "file_size column not found" error
              </p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-red-900 mb-2">Error Details:</h3>
            <p className="text-sm text-red-800 mb-2">
              <code className="bg-red-100 px-2 py-1 rounded">
                Could not find the 'file_size' column of 'submission_files' in the schema cache
              </code>
            </p>
            <p className="text-sm text-red-800">
              This error occurs because your database table is missing a required column. 
              Run the migration script below to fix it.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Fix: Run Migration Script</h2>
            
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
              <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm">
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
                  The file_size column has been added. You can now upload files without errors.
                </p>
                <div className="flex gap-3">
                  <a
                    href="/submit"
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Upload Again
                  </a>
                  <a
                    href="/dashboard"
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Go to Dashboard
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">What does this migration do?</h3>
            <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
              <li>Checks if the <code className="bg-blue-100 px-1">file_size</code> column exists</li>
              <li>Adds the column if it's missing (safe to run multiple times)</li>
              <li>Allows the app to store file size information with uploads</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            Still Getting Errors?
          </h3>
          <p className="text-sm text-yellow-800 mb-2">
            If you continue to see errors after running this migration:
          </p>
          <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
            <li>Refresh your browser to clear the schema cache</li>
            <li>Verify the migration ran successfully in Supabase</li>
            <li>Check that storage policies are configured at <a href="/setup-storage" className="underline">/setup-storage</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
