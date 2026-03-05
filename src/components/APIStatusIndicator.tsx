import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function APIStatusIndicator() {
  const isMockMode = import.meta.env.VITE_USE_MOCK === 'true';
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (import.meta.env.PROD) {
    // Don't show in production
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <div
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-lg ${
          isMockMode
            ? 'border border-yellow-300 bg-yellow-100 text-yellow-900'
            : 'border border-green-300 bg-green-100 text-green-900'
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
      <div className="mt-1 text-right text-xs text-gray-600">
        {isMockMode ? 'Using mock data' : apiBaseUrl}
      </div>
    </div>
  );
}
