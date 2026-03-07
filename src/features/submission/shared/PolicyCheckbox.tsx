import React from 'react';

export type PolicyCheckboxProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  children: React.ReactNode;
};

export const PolicyCheckbox: React.FC<PolicyCheckboxProps> = ({
  checked,
  onChange,
  title,
  children,
}) => (
  <label className="flex cursor-pointer items-start gap-3">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
    />
    <span className="text-sm text-gray-700">
      <strong>{title}:</strong> {children}
    </span>
  </label>
);
