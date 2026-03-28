import React from 'react';

interface EditorTabProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

export const EditorTab: React.FC<EditorTabProps> = ({ active, onClick, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center border-b-2 px-5 py-3 text-sm font-semibold"
    style={{
      borderColor: active ? '#1D4ED8' : 'transparent',
      color: active ? '#0B1C4D' : '#475569',
      backgroundColor: active ? '#F1F7FF' : 'transparent',
      transition: 'all 0.3s ease-in-out',
    }}
  >
    <span className="mr-2 inline-flex">{icon}</span>
    <span>{label}</span>
  </button>
);
