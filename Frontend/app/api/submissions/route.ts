import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { getSubmissionFilterMetadata } from '@/lib/submissions/metadata';
import { aggregateSubmissionStats } from '@/lib/submissions/stats';

interface SubmissionDTO {
  id: string;
  reference: string;
  status: string;
  priority: string;
  submissionDate: string;
  dueDate: string | null;
  cedant: {
    id: string;
    name: string;
    country: string;
  };
  broker?: {
    id: string;
    name: string;
  } | null;
  insured: {
    id: string;
    name: string;
    country: string;
  };
  assignedTo?: {
    id: string;
    name: string;
  } | null;
  riskDetails?: {
    classOfBusiness: string;
    perils: string[];
    sumInsured: number;
    currency: string;
  } | null;
  financialDetails?: {
    grossPremium: number;
    commission: number;
    brokerage: number;
    requestedShare: number;
    currency: string;
  } | null;
}

function decimalToNumber(value?: Prisma.Decimal | null): number {
  if (!value) {
    return 0;
  }
  return typeof value === 'number' ? value : value.toNumber();
}

function transformSubmission(submission: any): SubmissionDTO {
  return {
    id: submission.id,
    reference: submission.reference,
    status: submission.status,
    priority: submission.priority,
    submissionDate: submission.submissionDate.toISOString(),
    dueDate: submission.dueDate ? submission.dueDate.toISOString() : null,
    cedant: {
      id: submission.cedant.id,
      name: submission.cedant.name,
      country: submission.cedant.country ?? '',
    },
    broker: submission.broker
      ? {
          id: submission.broker.id,
          name: submission.broker.name,
        }
      : null,
    insured: {
      id: submission.insured.id,
      name: submission.insured.name,
      country: submission.insured.country ?? '',
    },
    assignedTo: submission.assignedTo
      ? {
          id: submission.assignedTo.id,
          name: submission.assignedTo.name,
        }
      : null,
    riskDetails: submission.riskDetails
      ? {
          classOfBusiness: submission.riskDetails.classOfBusiness,
          perils: submission.riskDetails.perils ?? [],
          sumInsured: decimalToNumber(submission.riskDetails.sumInsured),
          currency: submission.riskDetails.currency ?? 'USD',
        }
      : null,
    financialDetails: submission.financialDetails
      ? {
          grossPremium: decimalToNumber(submission.financialDetails.grossPremium),
          commission: decimalToNumber(submission.financialDetails.commission),
          brokerage: decimalToNumber(submission.financialDetails.brokerage),
          requestedShare: decimalToNumber(submission.financialDetails.requestedShare),
          currency: submission.financialDetails.currency ?? 'USD',
        }
      : null,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') ?? '50');
    const id = searchParams.get('id');

    if (id) {
      const submission = await prisma.submission.findUnique({
        where: { id },
        include: {
          cedant: true,
          broker: true,
          insured: true,
          assignedTo: true,
          riskDetails: true,
          financialDetails: true,
        },
      });

      if (!submission) {
        return NextResponse.json({ message: 'Submission not found' }, { status: 404 });
      }

      return NextResponse.json({ submission: transformSubmission(submission) });
    }

    const submissions = await prisma.submission.findMany({
      include: {
        cedant: true,
        broker: true,
        insured: true,
        assignedTo: true,
        riskDetails: true,
        financialDetails: true,
      },
      orderBy: {
        submissionDate: 'desc',
      },
      take: !Number.isNaN(limit) ? limit : undefined,
    });

    const metadata = await getSubmissionFilterMetadata();
    const stats = aggregateSubmissionStats(submissions);

    return NextResponse.json({
      submissions: submissions.map(transformSubmission),
      metadata,
      stats,
    });
  } catch (error) {
    console.error('Failed to load submissions', error);
    return NextResponse.json(
      { message: 'Failed to load submissions' },
      { status: 500 },
    );
  }
}

