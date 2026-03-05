export type Step = 1 | 2 | 3 | 4;

export type Policies = {
  originality: boolean;
  plagiarism: boolean;
  ethics: boolean;
  copyright: boolean;
};

/** Wizard-specific manuscript form — topics referenced by display name */
export type WizardManuscriptForm = {
  title: string;
  abstract: string;
  keywords: string[];
  topicArea: string;
};
