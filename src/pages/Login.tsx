import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { login, resendVerificationEmail } from '../lib/queries-api';
import { TokenManager } from '../lib/api';
import { useQueryClient } from '@tanstack/react-query';

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailVerificationWarning, setShowEmailVerificationWarning] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  useEffect(() => {
    // Check if user is already logged in by token presence only (no API call)
    if (TokenManager.getAccessToken()) {
      const nextUrl = searchParams.get('next') || sessionStorage.getItem('returnUrl');
      if (nextUrl) {
        sessionStorage.removeItem('returnUrl');
        navigate(nextUrl);
      } else {
        navigate('/dashboard');
      }
    }
  }, [navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowEmailVerificationWarning(false);

    try {
      const { data, error: loginError } = await login(email, password);

      if (loginError) {
        const errorMessage = loginError.detail || 'Invalid email or password';
        setError(errorMessage);

        if (
          errorMessage.toLowerCase().includes('email') &&
          (errorMessage.toLowerCase().includes('verify') ||
            errorMessage.toLowerCase().includes('verification') ||
            errorMessage.toLowerCase().includes('not verified'))
        ) {
          setShowEmailVerificationWarning(true);
        }

        console.error('[Login Error]:', loginError);
        return;
      }

      if (data) {
        queryClient.removeQueries({ queryKey: ['me'] });
        const nextUrl = searchParams.get('next') || sessionStorage.getItem('returnUrl');
        if (nextUrl) {
          sessionStorage.removeItem('returnUrl');
          navigate(nextUrl);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('[Login Exception]:', err);
      setError((err as Error).message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setResendingEmail(true);
    try {
      const { error: resendError } = await resendVerificationEmail(email);
      if (resendError) {
        setError(resendError.detail || 'Failed to resend verification email');
      } else {
        setError('Verification email sent! Please check your inbox.');
      }
    } catch (err) {
      setError((err as Error).message || 'An error occurred while resending email');
    } finally {
      setResendingEmail(false);
    }
  };

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
              Sign In
            </h1>
            <p className="text-sm" style={{ color: '#64748B' }}>
              Sign in to access your author dashboard
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
              }}
            >
              <p className="mb-2 text-sm font-medium" style={{ color: '#991B1B' }}>
                {error}
              </p>

              {showEmailVerificationWarning && (
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid #FCA5A5' }}>
                  <p className="mb-3 text-sm" style={{ color: '#7F1D1D' }}>
                    Please verify your email address to log in.
                  </p>
                  <button
                    onClick={handleResendVerification}
                    disabled={resendingEmail}
                    className="w-full text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      padding: '10px 16px',
                      background: resendingEmail ? '#94A3B8' : '#EF4444',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                    }}
                  >
                    {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                </div>
              )}

              {error.includes('Network error') && (
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid #FCA5A5' }}>
                  <p className="mb-2 text-sm font-medium" style={{ color: '#991B1B' }}>
                    💡 Troubleshooting:
                  </p>
                  <ol className="ml-4 list-decimal space-y-1 text-xs" style={{ color: '#7F1D1D' }}>
                    <li>Check if the backend API is running</li>
                    <li>
                      Verify API URL in .env file:{' '}
                      <code className="px-1 py-0.5" style={{ backgroundColor: '#FEE2E2' }}>
                        VITE_API_BASE_URL
                      </code>
                    </li>
                    <li>
                      Enable mock mode for testing: Set{' '}
                      <code className="px-1 py-0.5" style={{ backgroundColor: '#FEE2E2' }}>
                        VITE_USE_MOCK=true
                      </code>{' '}
                      in .env
                    </li>
                    <li>Check browser console for detailed errors</li>
                  </ol>
                  <div
                    className="mt-3 rounded p-2"
                    style={{
                      backgroundColor: '#FEF3C7',
                      border: '1px solid #FDE047',
                    }}
                  >
                    <p className="text-xs" style={{ color: '#78350F' }}>
                      <strong>Quick Fix:</strong> Set{' '}
                      <code className="px-1" style={{ backgroundColor: '#FEF9C3' }}>
                        VITE_USE_MOCK=true
                      </code>{' '}
                      in your .env file to use mock data for testing.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold"
                style={{ color: '#0B1C4D' }}
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: '#CBD5E1' }}
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold"
                style={{ color: '#0B1C4D' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span style={{ color: '#64748B' }}>Don't have an account? </span>
            <Link
              to="/register"
              className="font-semibold hover:underline"
              style={{ color: '#2563EB' }}
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
