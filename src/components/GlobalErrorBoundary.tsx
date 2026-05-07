import React from 'react';

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class GlobalErrorBoundary extends React.Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  state: GlobalErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('UI crash:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#F8FAFC',
            color: '#0B1C4D',
            padding: '48px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              maxWidth: 720,
              background: '#FFFFFF',
              borderRadius: 16,
              padding: 32,
              boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
              border: '1px solid #E2E8F0',
            }}
          >
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
              Page failed to render
            </h1>
            <p style={{ color: '#475569', marginBottom: 12 }}>
              The UI hit a runtime error. Please copy the error below and send it to support.
            </p>
            <pre
              style={{
                background: '#0F172A',
                color: '#F8FAFC',
                padding: 16,
                borderRadius: 12,
                fontSize: 13,
                lineHeight: 1.5,
                overflowX: 'auto',
              }}
            >
              {this.state.error?.message || 'Unknown error'}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
