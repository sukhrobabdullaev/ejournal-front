import React from 'react';
import { CheckCircle } from 'lucide-react';
import type { Submission } from '../../../lib/api';

type SubmittedStateProps = {
    submission: Submission;
    onGoToDashboard: () => void;
};

export const SubmittedState: React.FC<SubmittedStateProps> = ({ submission, onGoToDashboard }) => (
    <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="border border-gray-300 bg-white p-12 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border border-green-300 bg-green-50">
                    <CheckCircle className="text-green-600" size={40} />
                </div>

                <h1 className="mb-4 text-3xl font-bold text-gray-900">Submission Received Successfully!</h1>

                <p className="mb-6 text-base text-gray-600">
                    Your manuscript is now in editorial screening.
                </p>

                <div className="mb-8 border border-blue-300 bg-blue-50 p-6">
                    <p className="mb-2 text-sm font-medium text-blue-900">Your Submission ID</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {submission.id.toString().substring(0, 8).toUpperCase()}
                    </p>
                </div>

                <div className="mb-8 border border-gray-300 bg-gray-50 p-6 text-left">
                    <h3 className="mb-3 text-base font-semibold text-gray-900">Next Steps:</h3>
                    <ol className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                            <span className="mr-2 font-medium">1.</span>
                            <span>
                                You will receive a confirmation email within 24 hours with your submission details.
                            </span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2 font-medium">2.</span>
                            <span>Our editorial team will conduct an initial screening within 7-14 days.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2 font-medium">3.</span>
                            <span>If accepted for review, your manuscript will be sent to expert reviewers.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2 font-medium">4.</span>
                            <span>You can track your submission status through your author dashboard.</span>
                        </li>
                    </ol>
                </div>

                <button
                    onClick={onGoToDashboard}
                    className="bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    </div>
);
