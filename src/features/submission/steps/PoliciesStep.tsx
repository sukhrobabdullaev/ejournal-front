import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { Policies } from '../types';
import { PolicyCheckbox } from '../shared/PolicyCheckbox';
import { allPoliciesAccepted } from '../helpers';

type PoliciesStepProps = {
  policies: Policies;
  saving: boolean;
  onChange: (next: Policies) => void;
  onNext: () => void;
};

export const PoliciesStep: React.FC<PoliciesStepProps> = ({
  policies,
  saving,
  onChange,
  onNext,
}) => {
  const update = (key: keyof Policies, value: boolean) => onChange({ ...policies, [key]: value });
  const disabled = saving || !allPoliciesAccepted(policies);

  return (
    <div className="border border-gray-300 bg-white p-8">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Step 1: Author Declarations &amp; Policies
      </h2>

      <div className="mb-8 space-y-6">
        <p className="text-sm text-gray-700">
          Before starting your submission, please confirm that you agree to the following policies:
        </p>

        <PolicyCheckbox
          checked={policies.originality}
          onChange={(v) => update('originality', v)}
          title="Originality Confirmation"
        >
          I confirm that this manuscript is original work and has not been published elsewhere, nor
          is it currently under consideration by another journal.
        </PolicyCheckbox>

        <PolicyCheckbox
          checked={policies.plagiarism}
          onChange={(v) => update('plagiarism', v)}
          title="Plagiarism Agreement"
        >
          I confirm that this work is free from plagiarism and all sources have been properly cited
          according to academic standards.
        </PolicyCheckbox>

        <PolicyCheckbox
          checked={policies.ethics}
          onChange={(v) => update('ethics', v)}
          title="Ethics Compliance"
        >
          I confirm that this research complies with ethical standards and, if applicable, has
          received appropriate ethics approval and informed consent.
        </PolicyCheckbox>

        <PolicyCheckbox
          checked={policies.copyright}
          onChange={(v) => update('copyright', v)}
          title="Copyright Agreement"
        >
          I agree to transfer copyright to Ditech Asia Journal upon acceptance, and understand that
          the manuscript will be published under an appropriate license.
        </PolicyCheckbox>
      </div>

      <button
        onClick={onNext}
        disabled={disabled}
        className="flex w-full items-center bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {saving ? 'Continuing...' : 'Continue to Manuscript Details'}
        <ArrowRight size={20} className="ml-2" />
      </button>
    </div>
  );
};
