import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { AlertCircle, ArrowLeft, FileText, Save, Send, Upload, X } from 'lucide-react';
import type { Submission, TopicArea } from '../../lib/api';
import {
  createSubmission,
  getSubmissionById,
  getTopicAreas,
  isAuthenticated,
  submitSubmission,
  updateSubmission,
  uploadSubmissionFile,
} from '../../lib/queries-api';
import { getStatusChipClasses, getStatusLabel } from './status-ui';

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
  topic_area_id: number | null;
};

type SubmitPaperFormProps = {
  submissionIdFromRoute?: string;
  submissionIdFromQuery?: string | null;
};

const parseNumericId = (value: string | null | undefined): string | undefined => {
  if (!value) return undefined;
  if (!/^\d+$/.test(value)) return undefined;
  return value;
};

const allPoliciesAccepted = (p: Policies) =>
  p.originality && p.plagiarism && p.ethics && p.copyright;

const validateManuscript = (f: ManuscriptForm): string | null => {
  if (!f.title.trim()) return 'Title is required';
  if (!f.abstract.trim()) return 'Abstract is required';
  if (!Array.isArray(f.keywords) || f.keywords.length < 3)
    return 'Please provide at least 3 keywords';
  if (!f.topic_area_id) return 'Topic area is required';
  return null;
};

export function SubmitPaperForm({ submissionIdFromRoute, submissionIdFromQuery }: SubmitPaperFormProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const targetId = useMemo(
    () => parseNumericId(submissionIdFromRoute) || parseNumericId(submissionIdFromQuery),
    [submissionIdFromRoute, submissionIdFromQuery],
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [topics, setTopics] = useState<TopicArea[]>([]);
  const [submission, setSubmission] = useState<Submission | null>(null);

  const [policies, setPolicies] = useState<Policies>({
    originality: false,
    plagiarism: false,
    ethics: false,
    copyright: false,
  });

  const [form, setForm] = useState<ManuscriptForm>({
    title: '',
    abstract: '',
    keywords: [],
    topic_area_id: null,
  });
  const [keywordDraft, setKeywordDraft] = useState('');

  const [manuscriptFile, setManuscriptFile] = useState<File | null>(null);
  const [supplementaryFiles, setSupplementaryFiles] = useState<File[]>([]);

  // Scroll to files section when requested via hash
  useEffect(() => {
    if (location.hash === '#files') {
      const el = document.getElementById('files-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location.hash]);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        const ok = await isAuthenticated();
        if (!ok) {
          navigate('/login');
          return;
        }

        const list = await getTopicAreas();
        setTopics(list);

        if (!targetId) return;

        const data = await getSubmissionById(targetId);
        if (!data) {
          setError('Submission not found or access denied');
          return;
        }

        hydrateFromSubmission(data);
      } catch (err: any) {
        console.error('Error initializing submission form:', err);
        setError(err.message || 'Failed to load submission form');
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, [navigate, targetId]);

  const hydrateFromSubmission = (s: Submission) => {
    setSubmission(s);
    setPolicies({
      originality: Boolean(s.originality_confirmation),
      plagiarism: Boolean(s.plagiarism_agreement),
      ethics: Boolean(s.ethics_compliance),
      copyright: Boolean(s.copyright_agreement),
    });
    setForm({
      title: s.title || '',
      abstract: s.abstract || '',
      keywords: s.keywords || [],
      topic_area_id: s.topic_area_id || s.topic_area?.id || null,
    });
  };

  const addKeyword = () => {
    const value = keywordDraft.trim();
    if (!value) return;
    if (form.keywords.length >= 10) return;
    if (form.keywords.includes(value)) return;
    setForm((prev) => ({ ...prev, keywords: [...prev.keywords, value] }));
    setKeywordDraft('');
  };

  const removeKeyword = (keyword: string) => {
    setForm((prev) => ({ ...prev, keywords: prev.keywords.filter((k) => k !== keyword) }));
  };

  const queuedSupplementaryLabel = (file: File) => `${file.name} (${Math.round(file.size / 1024)} KB)`;

  const saveDraft = async (): Promise<Submission | null> => {
    if (!allPoliciesAccepted(policies)) {
      setError('Please accept all policy agreements');
      return null;
    }

    const validationError = validateManuscript(form);
    if (validationError) {
      setError(validationError);
      return null;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload = {
        title: form.title.trim(),
        abstract: form.abstract.trim(),
        keywords: form.keywords,
        topic_area_id: form.topic_area_id!,
        originality_confirmation: policies.originality,
        plagiarism_agreement: policies.plagiarism,
        ethics_compliance: policies.ethics,
        copyright_agreement: policies.copyright,
      };

      // Create or update draft metadata
      if (!submission) {
        const { data, error } = await createSubmission(payload);
        if (error || !data) {
          setError((error && (error.detail || error.message)) || 'Failed to create draft');
          return null;
        }
        setSubmission(data);
        navigate(`/submit/${data.id}#files`);
        setSuccess('Draft created.');
        return data;
      }

      const { data, error } = await updateSubmission(submission.id.toString(), payload);
      if (error) {
        setError((error.detail || error.message) || 'Failed to update draft');
        return null;
      }

      const updated = data ?? (await getSubmissionById(submission.id.toString()));
      if (updated) setSubmission(updated);
      setSuccess('Draft saved.');
      return updated ?? submission;
    } catch (err: any) {
      console.error('Error saving draft:', err);
      setError(err.message || 'Failed to save draft');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const uploadQueuedFiles = async (draft: Submission): Promise<boolean> => {
    if (!manuscriptFile && supplementaryFiles.length === 0) return true;

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      const id = draft.id.toString();

      if (manuscriptFile) {
        const { error } = await uploadSubmissionFile(id, manuscriptFile, 'manuscript');
        if (error) {
          setError((error.detail || error.message) || 'Failed to upload manuscript');
          return false;
        }
      }

      for (const file of supplementaryFiles) {
        const { error } = await uploadSubmissionFile(id, file, 'supplementary');
        if (error) {
          setError((error.detail || error.message) || `Failed to upload ${file.name}`);
          return false;
        }
      }

      setManuscriptFile(null);
      setSupplementaryFiles([]);

      const refreshed = await getSubmissionById(id);
      if (refreshed) setSubmission(refreshed);
      setSuccess('Files uploaded.');
      return true;
    } catch (err: any) {
      console.error('Error uploading files:', err);
      setError(err.message || 'Failed to upload files');
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDraftAndUploads = async () => {
    const draft = await saveDraft();
    if (!draft) return;
    await uploadQueuedFiles(draft);
  };

  const canSubmit =
    submission?.status === 'draft' && Boolean(submission?.manuscript_pdf?.trim());

  const handleSubmit = async () => {
    if (!submission) return;

    // Ensure latest draft saved & queued files uploaded before submit
    const draft = await saveDraft();
    if (!draft) return;
    const uploadsOk = await uploadQueuedFiles(draft);
    if (!uploadsOk) return;

    const refreshed = await getSubmissionById(draft.id.toString());
    const effective = refreshed ?? draft;
    if (!effective.manuscript_pdf?.trim()) {
      setError('Please upload the manuscript PDF before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const { data, error } = await submitSubmission(effective.id.toString());
      if (error) {
        setError((error.detail || error.message) || 'Failed to submit manuscript');
        return;
      }

      const next = data ?? (await getSubmissionById(effective.id.toString()));
      if (next) setSubmission(next);
      setSuccess('Submission submitted.');
      navigate(`/submissions/${effective.id}`);
    } catch (err: any) {
      console.error('Error submitting submission:', err);
      setError(err.message || 'Failed to submit manuscript');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading submission form...</p>
        </div>
      </div>
    );
  }

  const statusLabel = submission ? getStatusLabel(submission.status) : 'Draft (not created yet)';
  const statusClass = submission ? getStatusChipClasses(submission.status) : getStatusChipClasses('draft');

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
            type="button"
          >
            <ArrowLeft size={18} className="mr-1" />
            Back to Dashboard
          </button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Submit Your Manuscript</h1>
              <p className="text-sm text-gray-600 mt-1">
                Fill everything on one page. We’ll create a draft, upload files, then submit.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={statusClass}>{statusLabel}</span>
              {submission && (
                <span className="text-xs text-gray-500 font-mono">
                  ID: {submission.id.toString().toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-300 text-red-800 text-sm flex items-start">
            <AlertCircle size={20} className="mr-3 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-300 text-green-800 text-sm">
            {success}
          </div>
        )}

        {/* Policies */}
        <section id="files-section" className="bg-white border border-gray-300 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Author Declarations & Policies</h2>
          <PolicyCheckbox
            checked={policies.originality}
            onChange={(v) => setPolicies((p) => ({ ...p, originality: v }))}
            title="Originality Confirmation"
          >
            I confirm that this manuscript is original work and has not been published elsewhere.
          </PolicyCheckbox>
          <PolicyCheckbox
            checked={policies.plagiarism}
            onChange={(v) => setPolicies((p) => ({ ...p, plagiarism: v }))}
            title="Plagiarism Agreement"
          >
            I confirm that this work is free from plagiarism and all sources are properly cited.
          </PolicyCheckbox>
          <PolicyCheckbox
            checked={policies.ethics}
            onChange={(v) => setPolicies((p) => ({ ...p, ethics: v }))}
            title="Ethics Compliance"
          >
            I confirm that this research complies with ethical standards.
          </PolicyCheckbox>
          <PolicyCheckbox
            checked={policies.copyright}
            onChange={(v) => setPolicies((p) => ({ ...p, copyright: v }))}
            title="Copyright Agreement"
          >
            I agree to the journal’s copyright and publication terms upon acceptance.
          </PolicyCheckbox>
        </section>

        {/* Metadata */}
        <section className="bg-white border border-gray-300 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Manuscript Metadata</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paper Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Abstract *</label>
            <textarea
              rows={6}
              value={form.abstract}
              onChange={(e) => setForm((f) => ({ ...f, abstract: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keywords * (3–10)
            </label>
            <div className="flex gap-2">
              <input
                value={keywordDraft}
                onChange={(e) => setKeywordDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a keyword and press Enter"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            {form.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.keywords.map((k) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 text-xs text-gray-800 border border-gray-200"
                  >
                    {k}
                    <button type="button" onClick={() => removeKeyword(k)} className="text-gray-600 hover:text-gray-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic Area *</label>
            <select
              value={form.topic_area_id ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  topic_area_id: e.target.value ? Number(e.target.value) : null,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select topic area</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Files */}
        <section className="bg-white border border-gray-300 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Files</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manuscript PDF *
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setManuscriptFile(e.target.files?.[0] ?? null)}
              />
              {manuscriptFile && (
                <p className="text-xs text-gray-600 mt-2">
                  Selected: <span className="font-medium">{manuscriptFile.name}</span>
                </p>
              )}
              {submission?.manuscript_pdf && (
                <a
                  href={submission.manuscript_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  View uploaded manuscript
                </a>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplementary files (optional)
              </label>
              <input
                type="file"
                multiple
                onChange={(e) => {
                  const picked = e.target.files ? Array.from(e.target.files) : [];
                  if (!picked.length) return;
                  setSupplementaryFiles((prev) => [...prev, ...picked]);
                }}
              />
              {supplementaryFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {supplementaryFiles.map((f) => (
                    <div
                      key={`${f.name}-${f.size}-${f.lastModified}`}
                      className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200"
                    >
                      <span className="text-xs text-gray-700">{queuedSupplementaryLabel(f)}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSupplementaryFiles((prev) =>
                            prev.filter(
                              (x) => !(x.name === f.name && x.size === f.size && x.lastModified === f.lastModified),
                            ),
                          )
                        }
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {submission?.supplementary_files?.length ? (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Uploaded supplementary</p>
                  <div className="space-y-2">
                    {submission.supplementary_files.map((file) => (
                      <a
                        key={file.id}
                        href={file.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">{file.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-700 uppercase">Open</span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="bg-white border border-gray-300 p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={handleSaveDraftAndUploads}
              disabled={saving || uploading || submitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving || uploading ? 'Saving...' : 'Save Draft'}
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || saving || uploading || submitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
          {!canSubmit && (
            <p className="text-xs text-gray-500 mt-3">
              Submit becomes available after the draft is created and the manuscript PDF is uploaded.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

type PolicyCheckboxProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  children: React.ReactNode;
};

const PolicyCheckbox: React.FC<PolicyCheckboxProps> = ({ checked, onChange, title, children }) => (
  <label className="flex items-start cursor-pointer gap-3">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
    />
    <span className="text-sm text-gray-700">
      <strong>{title}:</strong> {children}
    </span>
  </label>
);

