import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  CheckCircle,
  Upload,
  X,
  AlertCircle,
  FileText,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import type { Submission, TopicArea } from '../../lib/api';
import {
  createSubmission,
  getSubmissionById,
  updateSubmission,
  uploadSubmissionFile,
  submitSubmission,
  getTopicAreas,
  isAuthenticated,
} from '../../lib/queries-api';

type Step = 1 | 2 | 3 | 4;

type Policies = {
  originality: boolean;
  plagiarism: boolean;
  ethics: boolean;
  copyright: boolean;
};

type ManuscriptForm = {
  title: string;
  abstract: string;
  keywords: string[];
  topicArea: string;
};

type SubmitPaperWizardProps = {
  submissionIdFromRoute?: string;
  submissionIdFromQuery?: string | null;
};

export function SubmitPaperWizard({
  submissionIdFromRoute,
  submissionIdFromQuery,
}: SubmitPaperWizardProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [topicsList, setTopicsList] = useState<TopicArea[]>([]);

  const [policies, setPolicies] = useState<Policies>({
    originality: false,
    plagiarism: false,
    ethics: false,
    copyright: false,
  });

  const [manuscriptData, setManuscriptData] = useState<ManuscriptForm>({
    title: '',
    abstract: '',
    keywords: [],
    topicArea: '',
  });
  const [currentKeyword, setCurrentKeyword] = useState('');

  const targetId = submissionIdFromRoute || submissionIdFromQuery || undefined;

  useEffect(() => {
    void initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId]);

  const initialize = async () => {
    try {
      setLoading(true);
      setError(null);

      const authenticated = await isAuthenticated();
      if (!authenticated) {
        navigate('/login');
        return;
      }

      const topics = await getTopicAreas();
      setTopicsList(topics);

      if (targetId) {
        await loadExistingSubmission(targetId);
        return;
      }

      setCurrentStep(1);
    } catch (err: any) {
      console.error('Error loading submission:', err);
      setError(err.message || 'Failed to load submission');
    } finally {
      setLoading(false);
    }
  };

  const loadExistingSubmission = async (id: string) => {
    const data = await getSubmissionById(id);
    if (!data) {
      setError('Submission not found or access denied');
      return;
    }

    setSubmission(data);

    setPolicies({
      originality: Boolean(data.originality_confirmation),
      plagiarism: Boolean(data.plagiarism_agreement),
      ethics: Boolean(data.ethics_compliance),
      copyright: Boolean(data.copyright_agreement),
    });

    setManuscriptData({
      title: data.title || '',
      abstract: data.abstract || '',
      keywords: data.keywords || [],
      topicArea: data.topic_area?.name || '',
    });

    setCurrentStep(deriveStepFromSubmission(data));
  };

  const deriveStepFromSubmission = (s: Submission): Step => {
    const hasPolicies =
      s.originality_confirmation &&
      s.plagiarism_agreement &&
      s.ethics_compliance &&
      s.copyright_agreement;
    if (!hasPolicies) return 1;

    const hasDetails =
      Boolean(s.title?.trim()) &&
      Boolean(s.abstract?.trim()) &&
      Array.isArray(s.keywords) &&
      s.keywords.length >= 3 &&
      Boolean(s.topic_area_id);
    if (!hasDetails) return 2;

    const hasManuscript = Boolean(s.manuscript_pdf);
    if (!hasManuscript) return 3;

    return 4;
  };

  const handlePoliciesNext = () => {
    if (!allPoliciesAccepted(policies)) {
      setError('Please accept all policy agreements to continue');
      return;
    }
    setError(null);
    setCurrentStep(2);
  };

  const handleSaveManuscriptDetails = async () => {
    const validationError = validateManuscript(manuscriptData);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const selectedTopic =
        topicsList.find((t) => t.name === manuscriptData.topicArea) ?? null;
      const basePayload = {
        title: manuscriptData.title,
        abstract: manuscriptData.abstract,
        keywords: manuscriptData.keywords,
        topic_area_id: selectedTopic?.id ?? submission?.topic_area_id,
        originality_confirmation: policies.originality,
        plagiarism_agreement: policies.plagiarism,
        ethics_compliance: policies.ethics,
        copyright_agreement: policies.copyright,
      };

      // If we don't yet have a submission, create the draft in one POST
      if (!submission && !targetId) {
        const { data, error } = await createSubmission(basePayload);

        if (error || !data) {
          console.error('Error creating submission draft:', error);
          const message =
            (error && (error.detail || error.message)) ||
            'Failed to create submission draft. Please try again.';
          setError(message);
          return;
        }

        setSubmission(data);
        navigate(`/submit/${data.id}`);
        return;
      }

      // Otherwise update existing draft
      const id = submission?.id?.toString() || targetId;
      if (!id) {
        setError('Submission ID not found');
        return;
      }

      const { data, error } = await updateSubmission(id, basePayload);

      if (error) {
        console.error('Error updating submission:', error);
        const message =
          (error.detail || error.message) || 'Failed to save manuscript details';
        setError(message);
        return;
      }

      if (data) {
        setSubmission(data);
      } else {
        await loadExistingSubmission(id);
      }

      setCurrentStep(3);
    } catch (err: any) {
      console.error('Error saving manuscript details:', err);
      setError(err.message || 'Failed to save details');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (
    file: File,
    kind: 'manuscript_pdf' | 'supplementary',
  ) => {
    try {
      setUploadingFile(true);
      setError(null);

      const id = submission?.id?.toString() || targetId;
      if (!id) {
        setError('Submission ID not found');
        return;
      }

      const apiFileType = kind === 'manuscript_pdf' ? 'manuscript' : 'supplementary';
      const { error } = await uploadSubmissionFile(id, file, apiFileType);

      if (error) {
        console.error('Error uploading file:', error);
        const message =
          (error.detail || error.message) ||
          'Failed to upload file. Please try again.';
        setError(message);
        return;
      }

      const updated = await getSubmissionById(id);
      if (updated) {
        setSubmission(updated);
      }
    } catch (err: any) {
      console.error('Error in file upload:', err);
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleGoToDetail = () => {
    const id = submission?.id?.toString() || targetId;
    if (!id) {
      setError('Submission ID not found');
      return;
    }
    navigate(`/submission/${id}`);
  };

  const handleAddKeyword = () => {
    if (!currentKeyword.trim() || manuscriptData.keywords.length >= 10) return;
    setManuscriptData((prev) => ({
      ...prev,
      keywords: [...prev.keywords, currentKeyword.trim()],
    }));
    setCurrentKeyword('');
  };

  const handleRemoveKeyword = (index: number) => {
    setManuscriptData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index),
    }));
  };

  const handleProceedToReview = () => {
    const manuscriptUploaded = Boolean(submission?.manuscript_pdf);
    if (!manuscriptUploaded) {
      setError('Please upload the manuscript PDF before proceeding');
      return;
    }
    setCurrentStep(4);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (submission && submission.status === 'submitted') {
    return (
      <SubmittedState
        submission={submission}
        onGoToDashboard={() => navigate('/dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader />
      <Progress currentStep={currentStep} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 text-red-800 text-sm flex items-start">
            <AlertCircle size={20} className="mr-3 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {currentStep === 1 && (
          <PoliciesStep
            policies={policies}
            saving={saving}
            onChange={setPolicies}
            onNext={handlePoliciesNext}
          />
        )}

        {currentStep === 2 && (
          <DetailsStep
            saving={saving}
            manuscriptData={manuscriptData}
            currentKeyword={currentKeyword}
            topicsList={topicsList}
            onChangeManuscript={setManuscriptData}
            onChangeKeyword={setCurrentKeyword}
            onAddKeyword={handleAddKeyword}
            onRemoveKeyword={handleRemoveKeyword}
            onCancel={() => navigate('/dashboard')}
            onSave={handleSaveManuscriptDetails}
          />
        )}

        {currentStep === 3 && (
          <FilesStep
            uploadingFile={uploadingFile}
            submission={submission}
            onBack={() => setCurrentStep(2)}
            onProceed={handleProceedToReview}
            onUpload={(file, kind) => void handleFileUpload(file, kind)}
          />
        )}

        {currentStep === 4 && (
          <ReviewStep
            saving={saving}
            manuscriptData={manuscriptData}
            submission={submission}
            onBack={() => setCurrentStep(3)}
            onSubmit={handleGoToDetail}
          />
        )}
      </div>
    </div>
  );
}

// UI subcomponents

const PageHeader: React.FC = () => (
  <div className="bg-white border-b border-gray-300">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Your Manuscript</h1>
      <p className="text-base text-gray-600">
        Complete the steps below to submit your research to Ditech Asia Journal
      </p>
    </div>
  </div>
);

type ProgressProps = {
  currentStep: Step;
};

const Progress: React.FC<ProgressProps> = ({ currentStep }) => (
  <div className="bg-white border-b border-gray-300">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((step, index) => (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 flex items-center justify-center border-2 font-medium text-sm ${currentStep >= step
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
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
                className={`flex-1 h-0.5 mx-4 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

type PoliciesStepProps = {
  policies: Policies;
  saving: boolean;
  onChange: (next: Policies) => void;
  onNext: () => void;
};

const PoliciesStep: React.FC<PoliciesStepProps> = ({
  policies,
  saving,
  onChange,
  onNext,
}) => {
  const update = (key: keyof Policies, value: boolean) =>
    onChange({ ...policies, [key]: value });

  const disabled = saving || !allPoliciesAccepted(policies);

  return (
    <div className="bg-white border border-gray-300 p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Step 1: Author Declarations & Policies
      </h2>

      <div className="space-y-6 mb-8">
        <p className="text-sm text-gray-700">
          Before starting your submission, please confirm that you agree to the following
          policies:
        </p>

        <PolicyCheckbox
          checked={policies.originality}
          onChange={(v) => update('originality', v)}
          title="Originality Confirmation"
        >
          I confirm that this manuscript is original work and has not been published
          elsewhere, nor is it currently under consideration by another journal.
        </PolicyCheckbox>

        <PolicyCheckbox
          checked={policies.plagiarism}
          onChange={(v) => update('plagiarism', v)}
          title="Plagiarism Agreement"
        >
          I confirm that this work is free from plagiarism and all sources have been
          properly cited according to academic standards.
        </PolicyCheckbox>

        <PolicyCheckbox
          checked={policies.ethics}
          onChange={(v) => update('ethics', v)}
          title="Ethics Compliance"
        >
          I confirm that this research complies with ethical standards and, if applicable,
          has received appropriate ethics approval and informed consent.
        </PolicyCheckbox>

        <PolicyCheckbox
          checked={policies.copyright}
          onChange={(v) => update('copyright', v)}
          title="Copyright Agreement"
        >
          I agree to transfer copyright to Ditech Asia Journal upon acceptance, and
          understand that the manuscript will be published under an appropriate license.
        </PolicyCheckbox>
      </div>

      <button
        onClick={onNext}
        disabled={disabled}
        className="w-full px-6 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
      >
        {saving ? 'Continuing...' : 'Continue to Manuscript Details'}
        <ArrowRight size={20} className="ml-2" />
      </button>
    </div>
  );
};

type PolicyCheckboxProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  children: React.ReactNode;
};

const PolicyCheckbox: React.FC<PolicyCheckboxProps> = ({
  checked,
  onChange,
  title,
  children,
}) => (
  <label className="flex items-start cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
    />
    <span className="ml-3 text-sm text-gray-700">
      <strong>{title}:</strong> {children}
    </span>
  </label>
);

type DetailsStepProps = {
  saving: boolean;
  manuscriptData: ManuscriptForm;
  currentKeyword: string;
  topicsList: TopicArea[];
  onChangeManuscript: (next: ManuscriptForm) => void;
  onChangeKeyword: (value: string) => void;
  onAddKeyword: () => void;
  onRemoveKeyword: (index: number) => void;
  onCancel: () => void;
  onSave: () => void;
};

const DetailsStep: React.FC<DetailsStepProps> = ({
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
  const topicNames =
    topicsList.length > 0 ? topicsList.map((t) => t.name) : DEFAULT_TOPICS;

  return (
    <div className="bg-white border border-gray-300 p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Step 2: Manuscript Details
      </h2>

      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Paper Title *
          </label>
          <input
            type="text"
            id="title"
            required
            value={manuscriptData.title}
            onChange={(e) =>
              onChangeManuscript({ ...manuscriptData, title: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Enter your paper title"
          />
        </div>

        <div>
          <label
            htmlFor="abstract"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Abstract *
          </label>
          <textarea
            id="abstract"
            required
            rows={8}
            value={manuscriptData.abstract}
            onChange={(e) =>
              onChangeManuscript({ ...manuscriptData, abstract: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Provide a concise summary of your research (250-300 words)"
          />
          <p className="text-xs text-gray-500 mt-1">
            {manuscriptData.abstract.length} characters
          </p>
        </div>

        <div>
          <label
            htmlFor="keywords"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Keywords * (3-10 keywords)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              id="keywords"
              value={currentKeyword}
              onChange={(e) => onChangeKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddKeyword())}
              className="flex-1 px-4 py-2.5 border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Type keyword and press Add"
            />
            <button
              type="button"
              onClick={onAddKeyword}
              className="px-5 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {manuscriptData.keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm border border-gray-300 flex items-center"
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
          <label
            htmlFor="topicArea"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Topic Area *
          </label>
          <select
            id="topicArea"
            required
            value={manuscriptData.topicArea}
            onChange={(e) =>
              onChangeManuscript({ ...manuscriptData, topicArea: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
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

      <div className="flex justify-between mt-8">
        <button
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center"
        >
          <ArrowLeft size={20} className="mr-2" />
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

type FilesStepProps = {
  uploadingFile: boolean;
  submission: Submission | null;
  onBack: () => void;
  onProceed: () => void;
  onUpload: (file: File, kind: 'manuscript_pdf' | 'supplementary') => void;
};

const FilesStep: React.FC<FilesStepProps> = ({
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
    <div className="bg-white border border-gray-300 p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Step 3: Upload Files
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Manuscript PDF *
          </label>
          <div className="border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-500 transition-colors">
            <Upload className="mx-auto text-gray-400 mb-4" size={40} />
            <label
              htmlFor="manuscript-upload"
              className="cursor-pointer text-blue-600 hover:underline font-medium text-sm"
            >
              Click to upload
            </label>
            <span className="text-gray-600 text-sm"> or drag and drop</span>
            <p className="text-xs text-gray-500 mt-2">PDF format, maximum 20 MB</p>
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
            <div className="mt-4 flex items-center p-3 bg-green-50 border border-green-300">
              <CheckCircle className="text-green-600 mr-3" size={20} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Manuscript PDF uploaded</p>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Supplementary Files (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-500 transition-colors">
            <FileText className="mx-auto text-gray-400 mb-4" size={40} />
            <label
              htmlFor="supplementary-upload"
              className="cursor-pointer text-blue-600 hover:underline font-medium text-sm"
            >
              Click to upload
            </label>
            <span className="text-gray-600 text-sm"> supplementary materials</span>
            <p className="text-xs text-gray-500 mt-2">Any format, maximum 20 MB</p>
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
              className="mt-4 flex items-center p-3 bg-blue-50 border border-blue-300"
            >
              <FileText className="text-blue-600 mr-3" size={20} />
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
          <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-300">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
            <span className="text-sm text-blue-900">Uploading file...</span>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>
        <button
          onClick={onProceed}
          disabled={!canProceed}
          className="px-6 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
        >
          Continue to Review
          <ArrowRight size={20} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

type ReviewStepProps = {
  saving: boolean;
  manuscriptData: ManuscriptForm;
  submission: Submission | null;
  onBack: () => void;
  onSubmit: () => void;
};

const ReviewStep: React.FC<ReviewStepProps> = ({
  saving,
  manuscriptData,
  submission,
  onBack,
  onSubmit,
}) => (
  <div className="bg-white border border-gray-300 p-8">
    <h2 className="text-xl font-semibold text-gray-900 mb-6">
      Step 4: Review & Submit
    </h2>

    <div className="space-y-6 mb-8">
      <div className="border border-gray-300 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Manuscript Details</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-600">Title:</span>
            <p className="text-gray-900 font-medium mt-1">{manuscriptData.title}</p>
          </div>
          <div>
            <span className="text-gray-600">Abstract:</span>
            <p className="text-gray-900 mt-1">
              {manuscriptData.abstract.substring(0, 200)}...
            </p>
          </div>
          <div>
            <span className="text-gray-600">Keywords:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {manuscriptData.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs border border-gray-300"
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
        <h3 className="font-semibold text-gray-900 mb-3">Uploaded Files</h3>
        <div className="space-y-2">
          {submission?.manuscript_pdf && (
            <div className="flex items-center text-sm">
              <FileText size={16} className="text-gray-600 mr-2" />
              <span className="text-gray-900">Manuscript PDF</span>
              <span className="ml-2 text-xs text-gray-500">(Manuscript)</span>
            </div>
          )}
          {submission?.supplementary_files?.map((file) => (
            <div key={file.id} className="flex items-center text-sm">
              <FileText size={16} className="text-gray-600 mr-2" />
              <span className="text-gray-900">{file.name}</span>
              <span className="ml-2 text-xs text-gray-500">(Supplementary)</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-300 p-4">
        <div className="flex items-start">
          <AlertCircle className="text-yellow-600 mr-3 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-yellow-900 mb-1">Important:</p>
            <p className="text-sm text-yellow-800">
              Once you submit, your manuscript will enter the editorial review process. You
              will receive a confirmation email and can track the status in your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div className="flex justify-between">
      <button
        onClick={onBack}
        className="px-6 py-3 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back
      </button>
      <button
        onClick={onSubmit}
        disabled={saving}
        className="text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

type SubmittedStateProps = {
  submission: Submission;
  onGoToDashboard: () => void;
};

const SubmittedState: React.FC<SubmittedStateProps> = ({
  submission,
  onGoToDashboard,
}) => (
  <div className="min-h-screen bg-white">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white border border-gray-300 p-12 text-center">
        <div className="w-20 h-20 bg-green-50 border border-green-300 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600" size={40} />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Submission Received Successfully!
        </h1>

        <p className="text-base text-gray-600 mb-6">
          Your manuscript is now in editorial screening.
        </p>

        <div className="bg-blue-50 border border-blue-300 p-6 mb-8">
          <p className="text-sm font-medium text-blue-900 mb-2">Your Submission ID</p>
          <p className="text-2xl font-bold text-blue-600">
            {submission.id.toString().substring(0, 8).toUpperCase()}
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-300 p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-3 text-base">Next Steps:</h3>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="font-medium mr-2">1.</span>
              <span>
                You will receive a confirmation email within 24 hours with your submission
                details.
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">2.</span>
              <span>Our editorial team will conduct an initial screening within 7-14 days.</span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">3.</span>
              <span>
                If accepted for review, your manuscript will be sent to expert reviewers.
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">4.</span>
              <span>You can track your submission status through your author dashboard.</span>
            </li>
          </ol>
        </div>

        <button
          onClick={onGoToDashboard}
          className="px-6 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  </div>
);

// helpers

const DEFAULT_TOPICS: string[] = [
  'Artificial Intelligence',
  'Data Science',
  'Software Engineering',
  'Human-Computer Interaction',
  'Cybersecurity',
  'Blockchain Technology',
  'Cloud Computing',
  'Computer Vision',
  'Natural Language Processing',
  'Internet of Things',
  'Education Technology',
  'Other',
];

const allPoliciesAccepted = (p: Policies): boolean =>
  p.originality && p.plagiarism && p.ethics && p.copyright;

const validateManuscript = (data: ManuscriptForm): string | null => {
  if (!data.title.trim()) return 'Title is required';
  if (!data.abstract.trim()) return 'Abstract is required';
  if (data.abstract.trim().length < 80) return 'Abstract must be at least 80 characters';
  if (data.keywords.length < 3) return 'Please add at least 3 keywords';
  if (data.keywords.length > 8) return 'Maximum 8 keywords allowed';
  if (!data.topicArea) return 'Please select a topic area';
  return null;
};

