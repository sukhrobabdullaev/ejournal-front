import React from 'react';
import { Upload, FileText, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Submission } from '../../../lib/api';

type FilesStepProps = {
  uploadingFile: boolean;
  submission: Submission | null;
  onBack: () => void;
  onProceed: () => void;
  onUpload: (file: File, kind: 'manuscript_pdf' | 'supplementary') => void;
};

export const FilesStep: React.FC<FilesStepProps> = ({
  uploadingFile,
  submission,
  onBack,
  onProceed,
  onUpload,
}) => {
  const handleUploadManuscript = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') return;
    if (file.size > 20 * 1024 * 1024) return;
    onUpload(file, 'manuscript_pdf');
  };

  const handleUploadSupplementary = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) return;
    onUpload(file, 'supplementary');
  };

  const canProceed = Boolean(submission?.manuscript_pdf) && !uploadingFile;

  return (
    <div className="border border-gray-300 bg-white p-8">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">Step 3: Upload Files</h2>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Manuscript PDF *</label>
          <div className="border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-blue-500">
            <Upload className="mx-auto mb-4 text-gray-400" size={40} />
            <label
              htmlFor="manuscript-upload"
              className="cursor-pointer text-sm font-medium text-blue-600 hover:underline"
            >
              Click to upload
            </label>
            <span className="text-sm text-gray-600"> or drag and drop</span>
            <p className="mt-2 text-xs text-gray-500">PDF format, maximum 20 MB</p>
            <input
              type="file"
              id="manuscript-upload"
              accept=".pdf"
              onChange={handleUploadManuscript}
              className="hidden"
              disabled={uploadingFile}
            />
          </div>

          {submission?.manuscript_pdf && (
            <div className="mt-4 flex items-center border border-green-300 bg-green-50 p-3">
              <CheckCircle className="mr-3 text-green-600" size={20} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Manuscript PDF uploaded</p>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Supplementary Files (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-blue-500">
            <FileText className="mx-auto mb-4 text-gray-400" size={40} />
            <label
              htmlFor="supplementary-upload"
              className="cursor-pointer text-sm font-medium text-blue-600 hover:underline"
            >
              Click to upload
            </label>
            <span className="text-sm text-gray-600"> supplementary materials</span>
            <p className="mt-2 text-xs text-gray-500">Any format, maximum 20 MB</p>
            <input
              type="file"
              id="supplementary-upload"
              onChange={handleUploadSupplementary}
              className="hidden"
              disabled={uploadingFile}
            />
          </div>

          {submission?.supplementary_files?.map((file) => (
            <div
              key={file.id}
              className="mt-4 flex items-center border border-blue-300 bg-blue-50 p-3"
            >
              <FileText className="mr-3 text-blue-600" size={20} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  Uploaded {new Date(file.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {uploadingFile && (
          <div className="flex items-center justify-center border border-blue-300 bg-blue-50 p-4">
            <div className="mr-3 h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <span className="text-sm text-blue-900">Uploading file...</span>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>
        <button
          onClick={onProceed}
          disabled={!canProceed}
          className="flex items-center bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          Continue to Review
          <ArrowRight size={20} className="ml-2" />
        </button>
      </div>
    </div>
  );
};
