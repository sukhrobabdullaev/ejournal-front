import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { signup } from '../lib/queries-api';

export function Register() {
  const navigate = useNavigate();
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    // Check if why_to_be is required
    const requiresMotivation =
      formData.roles.includes('reviewer') || formData.roles.includes('editor');
    if (requiresMotivation && !formData.why_to_be.trim()) {
      setError('Please provide motivation for reviewer/editor role');
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
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
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
              borderTop: '4px solid #10B981',
            }}
          >
            <div
              className="mx-auto mb-6 flex items-center justify-center rounded-full"
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#DCFCE7',
              }}
            >
              <svg
                className="h-10 w-10"
                style={{ color: '#10B981' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="mb-3 text-3xl font-bold" style={{ color: '#0B1C4D' }}>
              Registration Successful!
            </h1>
            <p className="mb-6 text-sm" style={{ color: '#64748B' }}>
              Your account has been created. You can now sign in.
            </p>
            <p className="text-xs" style={{ color: '#94A3B8' }}>
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div
          className="bg-white transition-all"
          style={{
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 10px 30px rgba(11, 28, 77, 0.15)',
            borderTop: '4px solid #2563EB',
          }}
        >
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-3xl font-bold" style={{ color: '#0B1C4D' }}>
              Create Account
            </h1>
            <p className="text-sm" style={{ color: '#64748B' }}>
              Join Ditech Asia Journal
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold"
                style={{ color: '#0B1C4D' }}
              >
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: '#CBD5E1' }}
                placeholder="your.email@example.com"
              />
            </div>

            {/* Full Name */}
            <div>
              <label
                htmlFor="full_name"
                className="mb-2 block text-sm font-semibold"
                style={{ color: '#0B1C4D' }}
              >
                Full Name *
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: '#CBD5E1' }}
                placeholder="Dr. John Doe"
              />
            </div>

            {/* Password */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold"
                  style={{ color: '#0B1C4D' }}
                >
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-4 py-3 pr-12 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: '#CBD5E1' }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold"
                  style={{ color: '#0B1C4D' }}
                >
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-4 py-3 pr-12 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: '#CBD5E1' }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={
                      showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                    }
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
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

            {/* Affiliation */}
            <div>
              <label
                htmlFor="affiliation"
                className="mb-2 block text-sm font-semibold"
                style={{ color: '#0B1C4D' }}
              >
                Affiliation *
              </label>
              <input
                type="text"
                id="affiliation"
                name="affiliation"
                required
                value={formData.affiliation}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: '#CBD5E1' }}
                placeholder="University or Institution"
              />
            </div>

            {/* Country */}
            <div>
              <label
                htmlFor="country"
                className="mb-2 block text-sm font-semibold"
                style={{ color: '#0B1C4D' }}
              >
                Country *
              </label>
              <input
                type="text"
                id="country"
                name="country"
                required
                value={formData.country}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: '#CBD5E1' }}
                placeholder="United States"
              />
            </div>

            {/* Roles */}
            <div>
              <label className="mb-3 block text-sm font-semibold" style={{ color: '#0B1C4D' }}>
                Select Roles *
              </label>
              <div className="space-y-3">
                <label
                  className="flex cursor-pointer items-start rounded-lg border p-3 transition-all hover:bg-gray-50"
                  style={{
                    borderColor: formData.roles.includes('author') ? '#2563EB' : '#E2E8F0',
                    backgroundColor: formData.roles.includes('author') ? '#EFF6FF' : 'transparent',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.roles.includes('author')}
                    onChange={() => handleRoleChange('author')}
                    className="mt-0.5 mr-3"
                    style={{ accentColor: '#2563EB' }}
                  />
                  <div>
                    <span className="block text-sm font-medium" style={{ color: '#0B1C4D' }}>
                      Author
                    </span>
                    <span className="text-xs" style={{ color: '#64748B' }}>
                      Submit manuscripts for review
                    </span>
                  </div>
                </label>
                <label
                  className="flex cursor-pointer items-start rounded-lg border p-3 transition-all hover:bg-gray-50"
                  style={{
                    borderColor: formData.roles.includes('reviewer') ? '#2563EB' : '#E2E8F0',
                    backgroundColor: formData.roles.includes('reviewer')
                      ? '#EFF6FF'
                      : 'transparent',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.roles.includes('reviewer')}
                    onChange={() => handleRoleChange('reviewer')}
                    className="mt-0.5 mr-3"
                    style={{ accentColor: '#2563EB' }}
                  />
                  <div>
                    <span className="block text-sm font-medium" style={{ color: '#0B1C4D' }}>
                      Reviewer
                    </span>
                    <span className="text-xs" style={{ color: '#64748B' }}>
                      Review manuscripts (requires approval)
                    </span>
                  </div>
                </label>
                <label
                  className="flex cursor-pointer items-start rounded-lg border p-3 transition-all hover:bg-gray-50"
                  style={{
                    borderColor: formData.roles.includes('editor') ? '#2563EB' : '#E2E8F0',
                    backgroundColor: formData.roles.includes('editor') ? '#EFF6FF' : 'transparent',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.roles.includes('editor')}
                    onChange={() => handleRoleChange('editor')}
                    className="mt-0.5 mr-3"
                    style={{ accentColor: '#2563EB' }}
                  />
                  <div>
                    <span className="block text-sm font-medium" style={{ color: '#0B1C4D' }}>
                      Editor
                    </span>
                    <span className="text-xs" style={{ color: '#64748B' }}>
                      Manage submissions (requires approval)
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Why to be (required for reviewer/editor) */}
            {(formData.roles.includes('reviewer') || formData.roles.includes('editor')) && (
              <div>
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
                  className="w-full rounded-lg border px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: '#CBD5E1' }}
                  placeholder="Please explain your expertise and motivation..."
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-base font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                padding: '14px 20px',
                background: loading
                  ? '#94A3B8'
                  : 'linear-gradient(135deg, #0B1C4D 0%, #2563EB 100%)',
                color: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(11, 28, 77, 0.2)',
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span style={{ color: '#64748B' }}>Already have an account? </span>
            <Link
              to="/login"
              className="font-semibold hover:underline"
              style={{ color: '#2563EB' }}
            >
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
