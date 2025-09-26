import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export type SubmissionWithRelations = Prisma.SubmissionGetPayload<{
  include: {
    cedant: true;
    broker: true;
    insured: true;
    assignedTo: true;
    riskDetails: true;
    financialDetails: true;
    documents: true;
    tags: true;
  };
}>;

export async function fetchSubmissions(limit = 50): Promise<SubmissionWithRelations[]> {
  return prisma.submission.findMany({
    include: {
      cedant: true,
      broker: true,
      insured: true,
      assignedTo: true,
      riskDetails: true,
      financialDetails: true,
      documents: true,
      tags: true,
    },
    orderBy: { submissionDate: 'desc' },
    take: limit,
  });
}

export async function fetchSubmissionById(id: string) {
  return prisma.submission.findUnique({
    where: { id },
    include: {
      cedant: true,
      broker: true,
      insured: true,
      assignedTo: true,
      riskDetails: true,
      financialDetails: true,
      documents: true,
      tags: true,
      workingSheet: true,
      aiAnalysis: true,
    },
  });
}


