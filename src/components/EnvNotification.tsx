import React from 'react';

export function EnvNotification() {
  const isMockMode = import.meta.env.VITE_USE_MOCK === 'true';
  const isDev = import.meta.env.DEV;

  // Only show in development mode
  if (!isDev) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 max-w-sm"
      style={{ 
        backgroundColor: isMockMode ? '#EFF6FF' : '#FEF3C7',
        border: `2px solid ${isMockMode ? '#2563EB' : '#F59E0B'}`,
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      <div className="flex items-start gap-3">
        <div 
          className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5"
          style={{ 
            backgroundColor: isMockMode ? '#2563EB' : '#F59E0B'
          }}
        />
        <div className="flex-1">
          <div 
            className="text-sm font-semibold mb-1"
            style={{ 
              color: isMockMode ? '#1E40AF' : '#92400E'
            }}
          >
            {isMockMode ? '🧪 Mock Mode Active' : '🔌 API Mode Active'}
          </div>
          <p 
            className="text-xs"
            style={{ 
              color: isMockMode ? '#1E40AF' : '#92400E'
            }}
          >
            {isMockMode 
              ? 'Using mock data. API calls will not reach the backend.' 
              : 'Connected to backend API. Real data is being used.'}
          </p>
        </div>
      </div>
    </div>
  );
}
