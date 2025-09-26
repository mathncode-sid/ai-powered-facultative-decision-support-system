import type { SubmissionFilterMetadata } from '@/lib/submissions/types';

export async function getSubmissionFilterMetadata(): Promise<SubmissionFilterMetadata> {
  return {
    cedants: [],
    brokers: [],
    insureds: [],
    classesOfBusiness: [],
    perils: [],
    priorities: ['low', 'medium', 'high', 'urgent'],
    statuses: [
      'pending_review',
      'under_analysis',
      'pricing_review',
      'portfolio_check',
      'awaiting_approval',
      'approved',
      'declined',
      'bound',
      'expired',
    ],
  };
}


