import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, Mail, Lock, User, Building2, Globe2 } from 'lucide-react';
import { signup, resendVerificationEmail } from '../lib/queries-api';
import { useJournal, useJournalPath } from '../contexts/JournalContext';

export function Register() {
  const navigate = useNavigate();
  const { journal, journalSlug } = useJournal();
  const toJournal = useJournalPath();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    affiliation: '',
    country: '',
    roles: ['author'] as string[],
    why_to_be: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  const roleOptions = [
    {
      key: 'author',
      title: 'Author',
      description: 'Submit manuscripts for review',
      icon: User,
    },
    {
      key: 'reviewer',
      title: 'Reviewer',
      description: 'Review manuscripts (requires approval)',
      icon: Eye,
    },
    {
      key: 'editor',
      title: 'Editor',
      description: 'Manage submissions (requires approval)',
      icon: Building2,
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role: string) => {
    setFormData((prev) => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.roles.length === 0) {
      setError('Please select at least one role');
      setLoading(false);
      return;
    }

    // Check if why_to_be is required
    const requiresMotivation =
      formData.roles.includes('reviewer') || formData.roles.includes('editor');
    if (requiresMotivation && !formData.why_to_be.trim()) {
      setError('Please provide motivation for reviewer/editor role');
      setLoading(false);
      return;
    }

    if (!journalSlug) {
      setError('No journal selected. Please go back and choose a journal.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signupError } = await signup({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        affiliation: formData.affiliation,
        country: formData.country,
        journal_slug: journalSlug,
        roles: formData.roles,
        why_to_be: formData.why_to_be,
      });

      if (signupError) {
        if (typeof signupError.detail === 'string') {
          setError(signupError.detail);
        } else {
          // Handle field errors
          const fieldErrors = Object.entries(signupError)
            .map(
              ([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`
            )
            .join('; ');
          setError(fieldErrors);
        }
        return;
      }

      setSuccess(true);
      setUserEmail(formData.email);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResendingEmail(true);
    try {
      const { error: resendError } = await resendVerificationEmail(userEmail);
      if (resendError) {
        setError(resendError.detail || 'Failed to resend verification email');
      } else {
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while resending email');
    } finally {
      setResendingEmail(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          backgroundColor: '#F8FAFC',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
        }}
      >
        <div style={{ maxWidth: '480px', width: '100%' }}>
          <div
            className="bg-white text-center transition-all"
            style={{
              borderRadius: '16px',
              padding: '40px',
              boxShadow: '0 10px 30px rgba(11, 28, 77, 0.15)',
              borderTop: '4px solid #2563EB',
            }}
          >
            <div
              className="mx-auto mb-6 flex items-center justify-center rounded-full"
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#DBEAFE',
              }}
            >
              <svg
                className="h-10 w-10"
                style={{ color: '#2563EB' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="mb-3 text-3xl font-bold" style={{ color: '#0B1C4D' }}>
              Check Your Email
            </h1>
            <p className="mb-4 text-sm" style={{ color: '#64748B' }}>
              We've sent a verification link to:
            </p>
            <p className="mb-6 text-base font-semibold" style={{ color: '#2563EB' }}>
              {userEmail}
            </p>
            <p className="mb-6 text-sm" style={{ color: '#64748B' }}>
              Please click the verification link in your email to activate your account.
            </p>

            {error && (
              <div
                className="mb-4"
                style={{
                  padding: '12px',
                  backgroundColor: '#FEF2F2',
                  border: '2px solid #FCA5A5',
                  borderRadius: '8px',
                  color: '#991B1B',
                }}
              >
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={resendingEmail}
                className="w-full text-base font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  padding: '14px 20px',
                  background: resendingEmail
                    ? '#94A3B8'
                    : 'linear-gradient(135deg, #0B1C4D 0%, #2563EB 100%)',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(11, 28, 77, 0.2)',
                }}
              >
                {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
              </button>

              <Link
                to={toJournal('/login')}
                className="block text-sm font-semibold hover:underline"
                style={{ color: '#2563EB' }}
              >
                Already verified? Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div
          className="bg-white transition-all"
          style={{
            borderRadius: '20px',
            padding: '46px 40px',
            boxShadow: '0 22px 55px rgba(15, 23, 42, 0.14), 0 8px 24px rgba(37, 99, 235, 0.12)',
            border: '1px solid #DBEAFE',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FBFF 100%)',
          }}
        >
          <div className="mb-14 text-center">
            <h1 className="mb-2 text-5xl font-black" style={{ color: '#0B1C4D', letterSpacing: '-0.03em' }}>
              Create Account
            </h1>
            <p className="text-[16px] font-medium" style={{ color: '#7A8CA8' }}>
              Join {journal?.name ? `${journal.name} Journal` : 'the journal'}
            </p>
          </div>

          {error && (
            <div
              className="mb-6"
              style={{
                padding: '16px',
                backgroundColor: '#FEF2F2',
                border: '2px solid #FCA5A5',
                borderRadius: '12px',
                color: '#991B1B',
              }}
            >
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mx-auto max-w-[620px] space-y-8">
            {/* Email + Full Name */}
            <div className="grid md:grid-cols-2" style={{ columnGap: '22px', rowGap: '28px' }}>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2.5 block text-[15px] font-medium"
                  style={{ color: '#1E2A52' }}
                >
                  Email Address
                </label>
                <div className="relative">
                  <span
                    className="pointer-events-none absolute top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border"
                    style={{ left: '14px', borderColor: '#D7E5FF', background: '#EEF4FF' }}
                  >
                    <Mail size={15} className="text-[#2563EB]" />
                  </span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border bg-[#F9FAFB] text-[15px] font-medium text-slate-800 placeholder:text-slate-400 transition-all hover:border-[#3B82F6] focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-blue-500"
                    style={{
                      borderColor: '#E5E7EB',
                      borderRadius: '12px',
                      height: '52px',
                      paddingLeft: '70px',
                      paddingRight: '20px',
                      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255,255,255,0.7)',
                    }}
                    placeholder="Email Address *"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="full_name"
                  className="mb-2.5 block text-[15px] font-medium"
                  style={{ color: '#1E2A52' }}
                >
                  Full Name
                </label>
                <div className="relative">
                  <span
                    className="pointer-events-none absolute top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border"
                    style={{ left: '14px', borderColor: '#D7E5FF', background: '#EEF4FF' }}
                  >
                    <User size={15} className="text-[#2563EB]" />
                  </span>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full border bg-[#F9FAFB] text-[15px] font-medium text-slate-800 placeholder:text-slate-400 transition-all hover:border-[#3B82F6] focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-blue-500"
                    style={{
                      borderColor: '#E5E7EB',
                      borderRadius: '12px',
                      height: '52px',
                      paddingLeft: '70px',
                      paddingRight: '20px',
                      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255,255,255,0.7)',
                    }}
                    placeholder="Full Name *"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="grid md:grid-cols-2" style={{ columnGap: '22px', rowGap: '28px' }}>
              <div>
                <label
                  htmlFor="password"
                  className="mb-2.5 block text-[15px] font-medium"
                  style={{ color: '#1E2A52' }}
                >
                  Password
                </label>
                <div className="relative">
                  <span
                    className="pointer-events-none absolute top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border"
                    style={{ left: '14px', borderColor: '#D7E5FF', background: '#EEF4FF' }}
                  >
                    <Lock size={15} className="text-[#2563EB]" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border bg-[#F9FAFB] text-[15px] font-medium text-slate-800 placeholder:text-slate-400 transition-all hover:border-[#3B82F6] focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-blue-500"
                    style={{
                      borderColor: '#E5E7EB',
                      borderRadius: '12px',
                      height: '52px',
                      paddingLeft: '70px',
                      paddingRight: '64px',
                      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255,255,255,0.7)',
                    }}
                    placeholder="Password *"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border text-gray-500 transition-colors hover:bg-slate-100 hover:text-gray-700 focus:outline-none"
                    style={{ right: '14px', borderColor: '#E2E8F0', background: '#FFFFFF' }}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2.5 block text-[15px] font-medium"
                  style={{ color: '#1E2A52' }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <span
                    className="pointer-events-none absolute top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border"
                    style={{ left: '14px', borderColor: '#D7E5FF', background: '#EEF4FF' }}
                  >
                    <Lock size={15} className="text-[#2563EB]" />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full border bg-[#F9FAFB] text-[15px] font-medium text-slate-800 placeholder:text-slate-400 transition-all hover:border-[#3B82F6] focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-blue-500"
                    style={{
                      borderColor: '#E5E7EB',
                      borderRadius: '12px',
                      height: '52px',
                      paddingLeft: '70px',
                      paddingRight: '64px',
                      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255,255,255,0.7)',
                    }}
                    placeholder="Confirm Password *"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={
                      showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                    }
                    className="absolute top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border text-gray-500 transition-colors hover:bg-slate-100 hover:text-gray-700 focus:outline-none"
                    style={{ right: '14px', borderColor: '#E2E8F0', background: '#FFFFFF' }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Affiliation + Country */}
            <div className="grid md:grid-cols-2" style={{ columnGap: '22px', rowGap: '28px' }}>
              <div>
                <label
                  htmlFor="affiliation"
                  className="mb-2.5 block text-[15px] font-medium"
                  style={{ color: '#1E2A52' }}
                >
                  Affiliation
                </label>
                <div className="relative">
                  <span
                    className="pointer-events-none absolute top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border"
                    style={{ left: '14px', borderColor: '#D7E5FF', background: '#EEF4FF' }}
                  >
                    <Building2 size={15} className="text-[#2563EB]" />
                  </span>
                  <input
                    type="text"
                    id="affiliation"
                    name="affiliation"
                    required
                    value={formData.affiliation}
                    onChange={handleChange}
                    className="w-full border bg-[#F9FAFB] text-[15px] font-medium text-slate-800 placeholder:text-slate-400 transition-all hover:border-[#3B82F6] focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-blue-500"
                    style={{
                      borderColor: '#E5E7EB',
                      borderRadius: '12px',
                      height: '52px',
                      paddingLeft: '70px',
                      paddingRight: '20px',
                      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255,255,255,0.7)',
                    }}
                    placeholder="Affiliation *"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="mb-2.5 block text-[15px] font-medium"
                  style={{ color: '#1E2A52' }}
                >
                  Country
                </label>
                <div className="relative">
                  <span
                    className="pointer-events-none absolute top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border"
                    style={{ left: '14px', borderColor: '#D7E5FF', background: '#EEF4FF' }}
                  >
                    <Globe2 size={15} className="text-[#2563EB]" />
                  </span>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full border bg-[#F9FAFB] text-[15px] font-medium text-slate-800 placeholder:text-slate-400 transition-all hover:border-[#3B82F6] focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-blue-500"
                    style={{
                      borderColor: '#E5E7EB',
                      borderRadius: '12px',
                      height: '52px',
                      paddingLeft: '70px',
                      paddingRight: '20px',
                      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255,255,255,0.7)',
                    }}
                    placeholder="Country *"
                  />
                </div>
              </div>
            </div>

            {/* Roles */}
            <div>
              <label className="mb-3 block text-sm font-semibold" style={{ color: '#0B1C4D' }}>
                Select Roles *
              </label>
              <div className="grid gap-3 md:grid-cols-3">
                {roleOptions.map((role) => {
                  const selected = formData.roles.includes(role.key);
                  const RoleIcon = role.icon;
                  return (
                    <button
                      key={role.key}
                      type="button"
                      onClick={() => handleRoleChange(role.key)}
                      className="flex min-h-[148px] flex-col items-start rounded-2xl border p-4 text-left transition-all"
                      style={{
                        borderColor: selected ? '#3B82F6' : '#E5E7EB',
                        backgroundColor: selected ? '#EFF6FF' : '#FFFFFF',
                        boxShadow: selected ? '0 8px 18px rgba(37, 99, 235, 0.14)' : '0 1px 2px rgba(15, 23, 42, 0.04)',
                      }}
                    >
                      <span
                        className="mb-3 inline-flex items-center justify-center rounded-full border"
                        style={{
                          alignSelf: 'flex-start',
                          width: '36px',
                          height: '36px',
                          borderColor: selected ? '#93C5FD' : '#CBD5E1',
                          backgroundColor: selected ? '#DBEAFE' : '#F8FAFC',
                        }}
                      >
                        <RoleIcon size={16} className={selected ? 'text-blue-600' : 'text-slate-500'} />
                      </span>
                      <span className="block text-[17px] font-bold" style={{ color: '#0B1C4D' }}>
                        {role.title}
                      </span>
                      <span className="mt-1 block text-[12px] leading-5" style={{ color: '#7A879D' }}>
                        {role.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Why to be (required for reviewer/editor) */}
            {(formData.roles.includes('reviewer') || formData.roles.includes('editor')) && (
              <div className="mt-8">
                <label
                  htmlFor="why_to_be"
                  className="mb-2 block text-sm font-semibold"
                  style={{ color: '#0B1C4D' }}
                >
                  Why do you want to be a{' '}
                  {formData.roles.includes('reviewer') ? 'Reviewer' : 'Editor'}? *
                </label>
                <textarea
                  id="why_to_be"
                  name="why_to_be"
                  required
                  value={formData.why_to_be}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border bg-[#F9FAFB] px-4 py-3 text-sm transition-all hover:border-[#3B82F6] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: '#E5E7EB', borderRadius: '12px' }}
                  placeholder="Please explain your expertise and motivation..."
                />
              </div>
            )}

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center text-base font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  padding: '14px 24px',
                  background: loading ? '#94A3B8' : 'linear-gradient(to right, #4F46E5, #3730A3)',
                  color: '#FFFFFF',
                  borderRadius: '16px',
                  boxShadow: loading
                    ? 'none'
                    : '0 10px 24px rgba(79, 70, 229, 0.28), 0 3px 8px rgba(55, 48, 163, 0.24)',
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <span style={{ color: '#64748B' }}>Already have an account? </span>
            <Link
              to={toJournal('/login')}
              className="font-semibold"
              style={{
                color: '#3B82F6',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
