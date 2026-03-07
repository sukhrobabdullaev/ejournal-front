import React from 'react';

interface EditorTabProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

export const EditorTab: React.FC<EditorTabProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
      active
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-600 hover:text-gray-900'
    }`}
  >
    {icon}
    {label}
  </button>
);
