import React from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import type { TopicArea } from '../../../lib/api';
import type { WizardManuscriptForm } from '../types';
import { DEFAULT_TOPICS } from '../helpers';

type DetailsStepProps = {
    saving: boolean;
    manuscriptData: WizardManuscriptForm;
    currentKeyword: string;
    topicsList: TopicArea[];
    onChangeManuscript: (next: WizardManuscriptForm) => void;
    onChangeKeyword: (value: string) => void;
    onAddKeyword: () => void;
    onRemoveKeyword: (index: number) => void;
    onCancel: () => void;
    onSave: () => void;
};

export const DetailsStep: React.FC<DetailsStepProps> = ({
    saving,
    manuscriptData,
    currentKeyword,
    topicsList,
    onChangeManuscript,
    onChangeKeyword,
    onAddKeyword,
    onRemoveKeyword,
    onCancel,
    onSave,
}) => {
    const topicNames = topicsList.length > 0 ? topicsList.map((t) => t.name) : DEFAULT_TOPICS;

    return (
        <div className="border border-gray-300 bg-white p-8">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">Step 2: Manuscript Details</h2>

            <div className="space-y-6">
                <div>
                    <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
                        Paper Title *
                    </label>
                    <input
                        type="text"
                        id="title"
                        required
                        value={manuscriptData.title}
                        onChange={(e) => onChangeManuscript({ ...manuscriptData, title: e.target.value })}
                        className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter your paper title"
                    />
                </div>

                <div>
                    <label htmlFor="abstract" className="mb-2 block text-sm font-medium text-gray-700">
                        Abstract *
                    </label>
                    <textarea
                        id="abstract"
                        required
                        rows={8}
                        value={manuscriptData.abstract}
                        onChange={(e) => onChangeManuscript({ ...manuscriptData, abstract: e.target.value })}
                        className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Provide a concise summary of your research (250-300 words)"
                    />
                    <p className="mt-1 text-xs text-gray-500">{manuscriptData.abstract.length} characters</p>
                </div>

                <div>
                    <label htmlFor="keywords" className="mb-2 block text-sm font-medium text-gray-700">
                        Keywords * (3-10 keywords)
                    </label>
                    <div className="mb-3 flex gap-2">
                        <input
                            type="text"
                            id="keywords"
                            value={currentKeyword}
                            onChange={(e) => onChangeKeyword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddKeyword())}
                            className="flex-1 border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Type keyword and press Add"
                        />
                        <button
                            type="button"
                            onClick={onAddKeyword}
                            className="bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {manuscriptData.keywords.map((keyword, index) => (
                            <span
                                key={index}
                                className="flex items-center border border-gray-300 bg-gray-100 px-3 py-1 text-sm text-gray-700"
                            >
                                {keyword}
                                <button
                                    type="button"
                                    onClick={() => onRemoveKeyword(index)}
                                    className="ml-2 text-gray-600 hover:text-gray-800"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="topicArea" className="mb-2 block text-sm font-medium text-gray-700">
                        Topic Area *
                    </label>
                    <select
                        id="topicArea"
                        required
                        value={manuscriptData.topicArea}
                        onChange={(e) => onChangeManuscript({ ...manuscriptData, topicArea: e.target.value })}
                        className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">Select a topic area</option>
                        {topicNames.map((topic) => (
                            <option key={topic} value={topic}>
                                {topic}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mt-8 flex justify-between">
                <button
                    onClick={onCancel}
                    className="flex items-center border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Cancel
                </button>
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="inline-flex items-center text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                        padding: '12px 18px',
                        backgroundColor: saving ? '#94A3B8' : '#0B1C4D',
                        color: '#FFFFFF',
                        borderRadius: '10px',
                    }}
                >
                    {saving ? 'Saving...' : 'Save & Continue'}
                    <ArrowRight size={20} className="ml-2" style={{ color: '#FFFFFF' }} />
                </button>
            </div>
        </div>
    );
};
