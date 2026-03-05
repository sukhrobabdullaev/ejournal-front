import type { Policies } from './types';

export const allPoliciesAccepted = (p: Policies): boolean =>
  p.originality && p.plagiarism && p.ethics && p.copyright;

export const DEFAULT_TOPICS: string[] = [
  'Artificial Intelligence',
  'Data Science',
  'Software Engineering',
  'Human-Computer Interaction',
  'Cybersecurity',
  'Blockchain Technology',
  'Cloud Computing',
  'Computer Vision',
  'Natural Language Processing',
  'Internet of Things',
  'Education Technology',
  'Other',
];
