import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { login, resendVerificationEmail } from '../lib/queries-api';
import { TokenManager } from '../lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useJournalPath } from '../contexts/JournalContext';

export function Login() {
  const navigate = useNavigate();
  const toJournal = useJournalPath();
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
    // Only auto-redirect when both tokens exist; prevents stale-token redirect loops.
    if (TokenManager.getAccessToken() && TokenManager.getRefreshToken()) {
      const nextUrl = searchParams.get('next') || sessionStorage.getItem('returnUrl');
      if (nextUrl) {
        sessionStorage.removeItem('returnUrl');
        navigate(nextUrl);
      } else {
        navigate(toJournal('/dashboard'));
      }
    }
  }, [navigate, searchParams, toJournal]);

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
          navigate(toJournal('/dashboard'));
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
        background:
          'radial-gradient(1000px 500px at 10% -10%, rgba(191, 219, 254, 0.65) 0%, rgba(248, 250, 252, 0) 55%), radial-gradient(900px 420px at 100% 10%, rgba(199, 210, 254, 0.45) 0%, rgba(248, 250, 252, 0) 58%), #F8FAFC',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        fontFamily: 'Montserrat, Inter, Segoe UI, sans-serif',
      }}
    >
      <div style={{ maxWidth: '560px', width: '100%' }}>
        <div
          className="bg-white transition-all"
          style={{
            borderRadius: '24px',
            padding: '40px 34px',
            boxShadow: '0 24px 56px rgba(15, 23, 42, 0.12), 0 8px 22px rgba(37, 99, 235, 0.12)',
            border: '1px solid rgba(191, 219, 254, 0.95)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,251,255,0.96) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="mb-9 text-center">
            <h1 className="mb-1.5 text-4xl font-black" style={{ color: '#0B1C4D', letterSpacing: '-0.035em' }}>
              Sign In
            </h1>
            <p className="text-[17px] font-medium" style={{ color: '#475569' }}>
              Sign in to access your author dashboard
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: '#2563EB' }}>
              <ShieldCheck size={14} />
              Secure Author Access
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
                      background: resendingEmail ? '#94A3B8' : 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                      color: '#FFFFFF',
                      borderRadius: '10px',
                      boxShadow: '0 8px 18px rgba(220, 38, 38, 0.22)',
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2.5 block text-[14px] font-semibold tracking-[0.02em]"
                style={{ color: '#0B1C4D' }}
              >
                Email Address
              </label>
              <div className="relative">
                {/* 1-o'zgarish: Ikonka klassidan "border" olib tashlandi, "left-4.5" o'rniga "left-3" qilindi */}
<span
  className="pointer-events-none absolute left-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full"
  style={{ background: '#EEF4FF' }}
>
  <Mail size={15} className="text-[#1D4ED8]" />
</span>

{/* 2-o'zgarish: input ichida "text-base" "text-sm" ga o'zgardi va paddingLeft 50px qilindi */}
<input
  type="email"
  id="email"
  required
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="w-full rounded-[16px] border bg-[#F8FBFF] py-4 text-sm font-medium text-slate-800 transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
  style={{
    borderColor: '#CBD5E1',
    paddingLeft: '50px', // Shu joyi o'zgardi
    paddingRight: '18px',
    borderRadius: '18px',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
  }}
  placeholder="your.email@example.com"
/>
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2.5 block text-[14px] font-semibold tracking-[0.02em]"
                style={{ color: '#0B1C4D' }}
              >
                Password
              </label>
              <div className="relative">
                {/* 3-o'zgarish: Qulf ikonkasidan ham border olindi va "left-3" qilindi */}
<span
  className="pointer-events-none absolute left-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full"
  style={{ background: '#EEF4FF' }}
>
  <Lock size={15} className="text-[#1D4ED8]" />
</span>

{/* 4-o'zgarish: input ichida "text-base" "text-sm" ga o'zgardi, paddingLeft va paddingRight 50px qilindi */}
<input
  type={showPassword ? 'text' : 'password'}
  id="password"
  required
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="w-full rounded-[16px] border bg-[#F8FBFF] py-4 text-sm font-medium text-slate-800 transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500"
  style={{
    borderColor: '#CBD5E1',
    paddingLeft: '50px', // Shu joyi o'zgardi
    paddingRight: '50px', // Shu joyi o'zgardi
    borderRadius: '18px',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
  }}
  placeholder="••••••••"
/>

{/* 5-o'zgarish: Ko'zcha tugmasi joylashuvi "right-2.5" dan "right-4" ga o'zgartirildi */}
<button
  type="button"
  onClick={() => setShowPassword((v) => !v)}
  aria-label={showPassword ? 'Hide password' : 'Show password'}
  className="absolute right-4 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none"
>
  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
</button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                padding: '14px 18px',
                background: loading ? '#94A3B8' : '#1D4ED8',
                color: '#FFFFFF',
                borderRadius: '18px',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span style={{ color: '#64748B' }}>Don't have an account? </span>
            <Link
              to={toJournal('/register')}
              className="font-semibold"
              style={{
                color: '#2563EB',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
