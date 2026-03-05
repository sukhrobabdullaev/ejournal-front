import React from 'react';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';
import type { Submission } from '../../../lib/api';
import type { WizardManuscriptForm } from '../types';

type ReviewStepProps = {
    saving: boolean;
    manuscriptData: WizardManuscriptForm;
    submission: Submission | null;
    onBack: () => void;
    onSubmit: () => void;
};

export const ReviewStep: React.FC<ReviewStepProps> = ({
    saving,
    manuscriptData,
    submission,
    onBack,
    onSubmit,
}) => (
    <div className="border border-gray-300 bg-white p-8">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">Step 4: Review &amp; Submit</h2>

        <div className="mb-8 space-y-6">
            <div className="border border-gray-300 p-5">
                <h3 className="mb-3 font-semibold text-gray-900">Manuscript Details</h3>
                <div className="space-y-2 text-sm">
                    <div>
                        <span className="text-gray-600">Title:</span>
                        <p className="mt-1 font-medium text-gray-900">{manuscriptData.title}</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Abstract:</span>
                        <p className="mt-1 text-gray-900">{manuscriptData.abstract.substring(0, 200)}...</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Keywords:</span>
                        <div className="mt-1 flex flex-wrap gap-2">
                            {manuscriptData.keywords.map((keyword, index) => (
                                <span
                                    key={index}
                                    className="border border-gray-300 bg-gray-100 px-2 py-1 text-xs text-gray-700"
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <span className="text-gray-600">Topic Area:</span>
                        <span className="ml-2 text-gray-900">{manuscriptData.topicArea}</span>
                    </div>
                </div>
            </div>

            <div className="border border-gray-300 p-5">
                <h3 className="mb-3 font-semibold text-gray-900">Uploaded Files</h3>
                <div className="space-y-2">
                    {submission?.manuscript_pdf && (
                        <div className="flex items-center text-sm">
                            <FileText size={16} className="mr-2 text-gray-600" />
                            <span className="text-gray-900">Manuscript PDF</span>
                            <span className="ml-2 text-xs text-gray-500">(Manuscript)</span>
                        </div>
                    )}
                    {submission?.supplementary_files?.map((file) => (
                        <div key={file.id} className="flex items-center text-sm">
                            <FileText size={16} className="mr-2 text-gray-600" />
                            <span className="text-gray-900">{file.name}</span>
                            <span className="ml-2 text-xs text-gray-500">(Supplementary)</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border border-yellow-300 bg-yellow-50 p-4">
                <div className="flex items-start">
                    <AlertCircle className="mt-0.5 mr-3 shrink-0 text-yellow-600" size={20} />
                    <div>
                        <p className="mb-1 text-sm font-medium text-yellow-900">Important:</p>
                        <p className="text-sm text-yellow-800">
                            Once you submit, your manuscript will enter the editorial review process. You will
                            receive a confirmation email and can track the status in your dashboard.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex justify-between">
            <button
                onClick={onBack}
                className="flex items-center border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back
            </button>
            <button
                onClick={onSubmit}
                disabled={saving}
                className="text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                    padding: '12px 24px',
                    backgroundColor: saving ? '#94A3B8' : '#0B1C4D',
                    color: '#FFFFFF',
                    borderRadius: '10px',
                }}
            >
                {saving ? 'Submitting...' : 'Submit Manuscript'}
            </button>
        </div>
    </div>
);
