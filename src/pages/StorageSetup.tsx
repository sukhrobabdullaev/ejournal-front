import React, { useState } from 'react';
import { CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { projectId } from '../utils/supabase/info.tsx';

export function StorageSetup() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (step: number) => {
    if (completedSteps.includes(step)) {
      setCompletedSteps(completedSteps.filter((s) => s !== step));
    } else {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  const allStepsComplete = completedSteps.length === 6;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Storage Setup</h1>
          <p className="mb-8 text-lg text-gray-600">Configure Supabase Storage for file uploads</p>

          {/* Info Box */}
          <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h3 className="mb-2 font-semibold text-blue-900">Why do I need this?</h3>
            <p className="text-sm text-blue-800">
              Storage policies control who can upload and access files. We need to create these
              policies through the Supabase Dashboard UI because SQL-based policy creation requires
              elevated permissions.
            </p>
          </div>

          {/* Step-by-step instructions */}
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="rounded-lg border border-gray-300 p-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={completedSteps.includes(1)}
                  onChange={() => toggleStep(1)}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-4 flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Step 1: Go to Storage Settings
                  </h3>
                  <p className="mb-3 text-sm text-gray-700">
                    Open your Supabase project's Storage page and select the{' '}
                    <code className="bg-gray-100 px-2 py-1">submission-files</code> bucket.
                  </p>
                  <a
                    href={`https://supabase.com/dashboard/project/${projectId}/storage/buckets`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:underline"
                  >
                    Open Storage Buckets
                    <ExternalLink size={14} className="ml-1" />
                  </a>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-lg border border-gray-300 p-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={completedSteps.includes(2)}
                  onChange={() => toggleStep(2)}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-4 flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Step 2: Click on "Policies" tab
                  </h3>
                  <p className="mb-3 text-sm text-gray-700">
                    In the <code className="bg-gray-100 px-2 py-1">submission-files</code> bucket
                    view, click on the "Policies" tab, then click "New Policy".
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-lg border border-gray-300 p-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={completedSteps.includes(3)}
                  onChange={() => toggleStep(3)}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-4 flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Step 3: Create INSERT Policy (Upload)
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <strong>Policy name:</strong>{' '}
                      <code className="bg-gray-100 px-2 py-1">
                        Users can upload to own submissions
                      </code>
                    </p>
                    <p>
                      <strong>Allowed operation:</strong> INSERT
                    </p>
                    <p>
                      <strong>Target roles:</strong> authenticated
                    </p>
                    <p>
                      <strong>WITH CHECK expression:</strong>
                    </p>
                    <pre className="mt-2 overflow-x-auto rounded bg-gray-900 p-4 text-xs text-gray-100">
                      {`(bucket_id = 'submission-files'::text) 
AND ((storage.foldername(name))[1] = 'submissions'::text) 
AND (EXISTS ( SELECT 1
   FROM submissions
  WHERE ((submissions.id)::text = (storage.foldername(storage.objects.name))[2]) 
  AND (submissions.author_user_id = auth.uid())))`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="rounded-lg border border-gray-300 p-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={completedSteps.includes(4)}
                  onChange={() => toggleStep(4)}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-4 flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Step 4: Create SELECT Policy (Download)
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <strong>Policy name:</strong>{' '}
                      <code className="bg-gray-100 px-2 py-1">Users can view own files</code>
                    </p>
                    <p>
                      <strong>Allowed operation:</strong> SELECT
                    </p>
                    <p>
                      <strong>Target roles:</strong> authenticated
                    </p>
                    <p>
                      <strong>USING expression:</strong>
                    </p>
                    <pre className="mt-2 overflow-x-auto rounded bg-gray-900 p-4 text-xs text-gray-100">
                      {`(bucket_id = 'submission-files'::text) 
AND ((storage.foldername(name))[1] = 'submissions'::text) 
AND (EXISTS ( SELECT 1
   FROM submissions
  WHERE ((submissions.id)::text = (storage.foldername(storage.objects.name))[2]) 
  AND (submissions.author_user_id = auth.uid())))`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="rounded-lg border border-gray-300 p-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={completedSteps.includes(5)}
                  onChange={() => toggleStep(5)}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-4 flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Step 5: Create DELETE Policy (Remove files)
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <strong>Policy name:</strong>{' '}
                      <code className="bg-gray-100 px-2 py-1">Users can delete own files</code>
                    </p>
                    <p>
                      <strong>Allowed operation:</strong> DELETE
                    </p>
                    <p>
                      <strong>Target roles:</strong> authenticated
                    </p>
                    <p>
                      <strong>USING expression:</strong>
                    </p>
                    <pre className="mt-2 overflow-x-auto rounded bg-gray-900 p-4 text-xs text-gray-100">
                      {`(bucket_id = 'submission-files'::text) 
AND ((storage.foldername(name))[1] = 'submissions'::text) 
AND (EXISTS ( SELECT 1
   FROM submissions
  WHERE ((submissions.id)::text = (storage.foldername(storage.objects.name))[2]) 
  AND (submissions.author_user_id = auth.uid())))`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="rounded-lg border border-gray-300 p-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={completedSteps.includes(6)}
                  onChange={() => toggleStep(6)}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-4 flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Step 6: Test File Upload
                  </h3>
                  <p className="mb-3 text-sm text-gray-700">
                    Try uploading a file through the submission page to verify the policies work
                    correctly.
                  </p>
                  <a
                    href="/submit"
                    className="inline-flex items-center text-sm text-blue-600 hover:underline"
                  >
                    Go to Submit Paper
                    <ExternalLink size={14} className="ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Completion status */}
          {allStepsComplete ? (
            <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-6">
              <div className="flex items-center">
                <CheckCircle className="mr-3 text-green-600" size={24} />
                <div>
                  <h3 className="font-semibold text-green-900">Setup Complete!</h3>
                  <p className="mt-1 text-sm text-green-800">
                    Your storage is now configured. File uploads should work properly.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <a
                  href="/dashboard"
                  className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Go to Dashboard
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-lg border border-gray-300 bg-gray-50 p-4">
              <p className="text-sm text-gray-700">
                <strong>Progress:</strong> {completedSteps.length} of 6 steps completed
              </p>
            </div>
          )}
        </div>

        {/* Help section */}
        <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <h3 className="mb-2 flex items-center font-semibold text-yellow-900">
            <AlertCircle className="mr-2" size={20} />
            Need Help?
          </h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-yellow-800">
            <li>
              Make sure you've run the database setup script first at{' '}
              <a href="/setup-database" className="underline">
                /setup-database
              </a>
            </li>
            <li>
              If you get "permission denied" errors, verify the policy expressions exactly match the
              examples above
            </li>
            <li>
              The <code className="bg-yellow-100 px-1">submissions</code> table must exist for these
              policies to work
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
