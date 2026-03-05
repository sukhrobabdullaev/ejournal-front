import React from 'react';
import type { Step } from '../types';

export const PageHeader: React.FC = () => (
    <div className="border-b border-gray-300 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Submit Your Manuscript</h1>
            <p className="text-base text-gray-600">
                Complete the steps below to submit your research to Ditech Asia Journal
            </p>
        </div>
    </div>
);

type ProgressProps = {
    currentStep: Step;
};

export const Progress: React.FC<ProgressProps> = ({ currentStep }) => (
    <div className="border-b border-gray-300 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((step, index) => (
                    <div key={step} className="flex flex-1 items-center last:flex-none">
                        <div className="flex items-center">
                            <div
                                className={`flex h-10 w-10 items-center justify-center border-2 text-sm font-medium ${currentStep >= step
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : 'border-gray-300 bg-white text-gray-400'
                                    }`}
                            >
                                {step}
                            </div>
                            <span
                                className={`ml-3 text-sm font-medium ${currentStep >= step ? 'text-gray-900' : 'text-gray-400'
                                    }`}
                            >
                                {step === 1 && 'Policies'}
                                {step === 2 && 'Details'}
                                {step === 3 && 'Files'}
                                {step === 4 && 'Review'}
                            </span>
                        </div>
                        {index < 3 && (
                            <div
                                className={`mx-4 h-0.5 flex-1 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    </div>
);
