import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router';
import { verifyEmail } from '../lib/queries-api';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    const verify = async () => {
      try {
        const { data, error } = await verifyEmail(token);

        if (error) {
          setStatus('error');
          setMessage(error.detail || 'Failed to verify email. The link may be expired or invalid.');
        } else {
          setStatus('success');
          setMessage('Your email has been successfully verified!');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'An unexpected error occurred during verification.');
      }
    };

    verify();
  }, [searchParams, navigate]);

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
            borderTop: `4px solid ${status === 'success' ? '#10B981' : status === 'error' ? '#EF4444' : '#2563EB'}`,
          }}
        >
          {status === 'loading' && (
            <>
              <div
                className="mx-auto mb-6 flex items-center justify-center"
                style={{
                  width: '80px',
                  height: '80px',
                }}
              >
                <div
                  className="h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"
                  style={{ borderColor: '#2563EB' }}
                />
              </div>
              <h1 className="mb-3 text-3xl font-bold" style={{ color: '#0B1C4D' }}>
                Verifying Email...
              </h1>
              <p className="text-sm" style={{ color: '#64748B' }}>
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
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
                Email Verified!
              </h1>
              <p className="mb-6 text-sm" style={{ color: '#64748B' }}>
                {message}
              </p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>
                Redirecting to login page...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div
                className="mx-auto mb-6 flex items-center justify-center rounded-full"
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#FEE2E2',
                }}
              >
                <svg
                  className="h-10 w-10"
                  style={{ color: '#EF4444' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="mb-3 text-3xl font-bold" style={{ color: '#0B1C4D' }}>
                Verification Failed
              </h1>
              <p className="mb-6 text-sm" style={{ color: '#64748B' }}>
                {message}
              </p>
              <Link
                to="/login"
                className="inline-block text-base font-semibold transition-all"
                style={{
                  padding: '14px 20px',
                  background: 'linear-gradient(135deg, #0B1C4D 0%, #2563EB 100%)',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(11, 28, 77, 0.2)',
                  textDecoration: 'none',
                }}
              >
                Go to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
