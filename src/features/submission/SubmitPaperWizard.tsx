import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle, Upload, X, AlertCircle, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
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

      const selectedTopic = topicsList.find((t) => t.name === manuscriptData.topicArea) ?? null;
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
        const message = error.detail || error.message || 'Failed to save manuscript details';
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

  const handleFileUpload = async (file: File, kind: 'manuscript_pdf' | 'supplementary') => {
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
        const message = error.detail || error.message || 'Failed to upload file. Please try again.';
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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-gray-600">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (submission && submission.status === 'submitted') {
    return (
      <SubmittedState submission={submission} onGoToDashboard={() => navigate('/dashboard')} />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader />
      <Progress currentStep={currentStep} />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 flex items-start border border-red-300 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle size={20} className="mt-0.5 mr-3 shrink-0" />
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

const Progress: React.FC<ProgressProps> = ({ currentStep }) => (
  <div className="border-b border-gray-300 bg-white">
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((step, index) => (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center border-2 text-sm font-medium ${
                  currentStep >= step
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}
              >
                {step}
              </div>
              <span
                className={`ml-3 text-sm font-medium ${
                  currentStep >= step ? 'text-gray-900' : 'text-gray-400'
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
                className={`mx-4 h-0.5 flex-1 ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
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

const PoliciesStep: React.FC<PoliciesStepProps> = ({ policies, saving, onChange, onNext }) => {
  const update = (key: keyof Policies, value: boolean) => onChange({ ...policies, [key]: value });

  const disabled = saving || !allPoliciesAccepted(policies);

  return (
    <div className="border border-gray-300 bg-white p-8">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Step 1: Author Declarations & Policies
      </h2>

      <div className="mb-8 space-y-6">
        <p className="text-sm text-gray-700">
          Before starting your submission, please confirm that you agree to the following policies:
        </p>

        <PolicyCheckbox
          checked={policies.originality}
          onChange={(v) => update('originality', v)}
          title="Originality Confirmation"
        >
          I confirm that this manuscript is original work and has not been published elsewhere, nor
          is it currently under consideration by another journal.
        </PolicyCheckbox>

        <PolicyCheckbox
          checked={policies.plagiarism}
          onChange={(v) => update('plagiarism', v)}
          title="Plagiarism Agreement"
        >
          I confirm that this work is free from plagiarism and all sources have been properly cited
          according to academic standards.
        </PolicyCheckbox>

        <PolicyCheckbox
          checked={policies.ethics}
          onChange={(v) => update('ethics', v)}
          title="Ethics Compliance"
        >
          I confirm that this research complies with ethical standards and, if applicable, has
          received appropriate ethics approval and informed consent.
        </PolicyCheckbox>

        <PolicyCheckbox
          checked={policies.copyright}
          onChange={(v) => update('copyright', v)}
          title="Copyright Agreement"
        >
          I agree to transfer copyright to Ditech Asia Journal upon acceptance, and understand that
          the manuscript will be published under an appropriate license.
        </PolicyCheckbox>
      </div>

      <button
        onClick={onNext}
        disabled={disabled}
        className="flex w-full items-center bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
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

const PolicyCheckbox: React.FC<PolicyCheckboxProps> = ({ checked, onChange, title, children }) => (
  <label className="flex cursor-pointer items-start">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
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
  <div className="border border-gray-300 bg-white p-8">
    <h2 className="mb-6 text-xl font-semibold text-gray-900">Step 4: Review & Submit</h2>

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

type SubmittedStateProps = {
  submission: Submission;
  onGoToDashboard: () => void;
};

const SubmittedState: React.FC<SubmittedStateProps> = ({ submission, onGoToDashboard }) => (
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
