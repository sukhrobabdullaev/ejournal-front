import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info.tsx';

export function DatabaseSetup() {
  const [step, setStep] = useState(1);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- NEXA-JCT Database Setup Script
-- Run this script in Supabase SQL Editor

-- Create article_status enum type
DO $$ BEGIN
  CREATE TYPE article_status AS ENUM (
    'draft', 'under_review', 'accepted', 'published', 'rejected', 'archived'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create journals table
CREATE TABLE IF NOT EXISTS journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  scope TEXT NOT NULL,
  issn_print TEXT,
  issn_online TEXT,
  doi_prefix TEXT,
  publisher TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journals_slug ON journals(slug);
CREATE INDEX IF NOT EXISTS idx_journals_is_active ON journals(is_active);

-- Create authors table
CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  affiliation TEXT NOT NULL,
  orcid TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_authors_orcid ON authors(orcid);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  journal_id UUID REFERENCES journals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  topic_tags TEXT[] DEFAULT '{}',
  status article_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  doi TEXT,
  pdf_public_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_journal_id ON articles(journal_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);

-- Create article_authors junction table
CREATE TABLE IF NOT EXISTS article_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
  author_order INTEGER NOT NULL,
  is_corresponding BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_article_authors_article_id ON article_authors(article_id);
CREATE INDEX IF NOT EXISTS idx_article_authors_author_id ON article_authors(author_id);
CREATE INDEX IF NOT EXISTS idx_article_authors_composite ON article_authors(article_id, author_order);

-- Create profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  affiliation TEXT,
  orcid TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('author', 'reviewer', 'editor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  journal_id UUID REFERENCES journals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  abstract TEXT,
  keywords TEXT[] DEFAULT '{}',
  topic TEXT,
  topic_area TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'published')) DEFAULT 'draft',
  step INTEGER DEFAULT 1,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_author_user_id ON submissions(author_user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_journal_id ON submissions(journal_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_updated_at ON submissions(updated_at DESC);

-- Create submission_files table
CREATE TABLE IF NOT EXISTS submission_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL CHECK (file_type IN ('manuscript_pdf', 'supplementary')),
  storage_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size BIGINT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submission_files_submission_id ON submission_files(submission_id);

-- Enable Row Level Security
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Public read access for journals" ON journals FOR SELECT USING (true);
CREATE POLICY "Public read access for articles" ON articles FOR SELECT USING (true);
CREATE POLICY "Public read access for authors" ON authors FOR SELECT USING (true);
CREATE POLICY "Public read access for article_authors" ON article_authors FOR SELECT USING (true);

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for user_roles
CREATE POLICY "Users can view own roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert roles" ON user_roles FOR INSERT WITH CHECK (true);

-- Create RLS policies for submissions
CREATE POLICY "Users can view own submissions" ON submissions FOR SELECT USING (auth.uid() = author_user_id);
CREATE POLICY "Users can insert own submissions" ON submissions FOR INSERT WITH CHECK (auth.uid() = author_user_id);
CREATE POLICY "Users can update own submissions" ON submissions FOR UPDATE USING (auth.uid() = author_user_id);

-- Create RLS policies for submission_files
CREATE POLICY "Users can view files for own submissions" ON submission_files FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM submissions WHERE submissions.id = submission_files.submission_id AND submissions.author_user_id = auth.uid()
  ));
CREATE POLICY "Users can insert files for own submissions" ON submission_files FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM submissions WHERE submissions.id = submission_files.submission_id AND submissions.author_user_id = auth.uid()
  ));

-- Enable Row Level Security
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Public read access for journals" ON journals FOR SELECT USING (true);
CREATE POLICY "Public read access for articles" ON articles FOR SELECT USING (true);
CREATE POLICY "Public read access for authors" ON authors FOR SELECT USING (true);
CREATE POLICY "Public read access for article_authors" ON article_authors FOR SELECT USING (true);

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for user_roles
CREATE POLICY "Users can view own roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert roles" ON user_roles FOR INSERT WITH CHECK (true);

-- Create RLS policies for submissions
CREATE POLICY "Users can view own submissions" ON submissions FOR SELECT USING (auth.uid() = author_user_id);
CREATE POLICY "Users can insert own submissions" ON submissions FOR INSERT WITH CHECK (auth.uid() = author_user_id);
CREATE POLICY "Users can update own submissions" ON submissions FOR UPDATE USING (auth.uid() = author_user_id);

-- Create RLS policies for submission_files
CREATE POLICY "Users can view files for own submissions" ON submission_files FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM submissions WHERE submissions.id = submission_files.submission_id AND submissions.author_user_id = auth.uid()
  ));
CREATE POLICY "Users can insert files for own submissions" ON submission_files FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM submissions WHERE submissions.id = submission_files.submission_id AND submissions.author_user_id = auth.uid()
  ));

-- =============================================================================
-- IMPORTANT: Storage Bucket Setup Required
-- =============================================================================
-- Storage bucket policies CANNOT be created via SQL due to permission restrictions.
-- After running this script, you MUST configure storage policies via the Dashboard UI.
-- 
-- Visit: /setup-storage for step-by-step instructions
-- =============================================================================`;

  const copyToClipboard = () => {
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(sqlScript)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          // Fallback to older method
          fallbackCopyToClipboard();
        });
    } else {
      // Use fallback method
      fallbackCopyToClipboard();
    }
  };

  const fallbackCopyToClipboard = () => {
    // Create a temporary textarea element
    const textArea = document.createElement('textarea');
    textArea.value = sqlScript;
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
      console.error('Failed to copy text: ', err);
      alert('Failed to copy. Please select and copy the text manually.');
    }
    
    document.body.removeChild(textArea);
  };

  const seedDatabase = async () => {
    setSeeding(true);
    setSeedResult(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e44d10eb/setup-database`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();
      setSeedResult(result);
      
      if (result.success) {
        setStep(3);
      }
    } catch (error: any) {
      setSeedResult({
        success: false,
        error: error.message
      });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Setup</h1>
          <p className="text-lg text-gray-600 mb-8">
            Set up your Supabase database tables for NEXA-JCT
          </p>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > 1 ? <CheckCircle size={20} /> : '1'}
              </div>
              <span className="ml-3 text-sm font-medium text-gray-900">Create Tables</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200">
              <div className={`h-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            </div>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > 2 ? <CheckCircle size={20} /> : '2'}
              </div>
              <span className="ml-3 text-sm font-medium text-gray-900">Seed Data</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200">
              <div className={`h-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            </div>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > 3 ? <CheckCircle size={20} /> : '3'}
              </div>
              <span className="ml-3 text-sm font-medium text-gray-900">Complete</span>
            </div>
          </div>

          {/* Step 1: Create Tables */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Step 1: Create Database Tables</h2>
              <p className="text-gray-600 mb-4">
                Copy the SQL script below and run it in your Supabase SQL Editor:
              </p>
              
              <ol className="list-decimal list-inside space-y-2 mb-6 text-gray-700">
                <li>Go to <a href={`https://supabase.com/dashboard/project/${projectId}/sql/new`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase SQL Editor</a></li>
                <li>Click "New Query"</li>
                <li>Paste the SQL script below</li>
                <li>Click "Run" to execute the script</li>
              </ol>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-900">
                  <strong>⚠️ Important:</strong> After running this script, you must also configure storage policies. 
                  Visit <a href="/setup-storage" className="underline font-semibold">/setup-storage</a> after completing this step.
                </p>
              </div>

              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm max-h-96 overflow-y-auto">
                  <code>{sqlScript}</code>
                </pre>
                <button
                  onClick={copyToClipboard}
                  className="absolute top-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy SQL'}
                </button>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  I've Created the Tables →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Seed Data */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Step 2: Seed Sample Data</h2>
              <p className="text-gray-600 mb-6">
                Click the button below to populate your database with sample journal data and articles for testing.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  <strong>What will be added:</strong>
                </p>
                <ul className="list-disc list-inside text-sm text-blue-800 mt-2 space-y-1">
                  <li>1 Journal (NEXA-JCT)</li>
                  <li>3 Sample Articles with full metadata</li>
                  <li>Multiple Authors with affiliations</li>
                </ul>
              </div>

              {seedResult && (
                <div className={`p-4 rounded-lg mb-6 ${
                  seedResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-start">
                    {seedResult.success ? (
                      <CheckCircle className="text-green-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
                    ) : (
                      <AlertCircle className="text-red-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
                    )}
                    <div>
                      <p className={`font-medium ${seedResult.success ? 'text-green-900' : 'text-red-900'}`}>
                        {seedResult.message || seedResult.error}
                      </p>
                      {seedResult.details && (
                        <pre className="text-xs mt-2 text-gray-700 overflow-x-auto">
                          {JSON.stringify(seedResult.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={seedDatabase}
                  disabled={seeding}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {seeding ? 'Seeding Database...' : 'Seed Database'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Complete */}
          {step === 3 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-green-600" size={40} />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Database Setup Complete!</h2>
              <p className="text-gray-600 mb-6">
                Your database tables are now ready.
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-yellow-900 mb-2">⚠️ One More Step Required</h3>
                <p className="text-sm text-yellow-800 mb-4">
                  Before you can upload files, you need to configure storage policies through the Supabase Dashboard UI.
                </p>
                <a
                  href="/setup-storage"
                  className="inline-block px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Configure Storage Now →
                </a>
              </div>

              <a
                href="/"
                className="inline-block px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Home Page
              </a>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            Need Help?
          </h3>
          <p className="text-sm text-yellow-800">
            If you encounter any errors, make sure:
          </p>
          <ul className="list-disc list-inside text-sm text-yellow-800 mt-2 space-y-1">
            <li>You have access to the Supabase project dashboard</li>
            <li>The SQL script ran successfully without errors</li>
            <li>You've also configured storage policies at <a href="/setup-storage" className="underline">/setup-storage</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}