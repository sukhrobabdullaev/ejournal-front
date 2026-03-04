import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function APIStatusIndicator() {
  const isMockMode = import.meta.env.VITE_USE_MOCK === 'true';
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.uzfintex.uz/api';

  if (import.meta.env.PROD) {
    // Don't show in production
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-sm font-medium ${
          isMockMode
            ? 'bg-yellow-100 border border-yellow-300 text-yellow-900'
            : 'bg-green-100 border border-green-300 text-green-900'
        }`}
      >
        {isMockMode ? (
          <>
            <AlertCircle size={16} />
            <span>Mock Mode</span>
          </>
        ) : (
          <>
            <CheckCircle size={16} />
            <span>Live API</span>
          </>
        )}
      </div>
      <div className="mt-1 text-xs text-gray-600 text-right">
        {isMockMode ? 'Using mock data' : apiBaseUrl}
      </div>
    </div>
  );
}
