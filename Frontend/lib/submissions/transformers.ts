import { Submission as PrismaSubmission, SubmissionStatus, Priority } from '@prisma/client';
import { Submission } from '@/types';

export function serializeSubmission(submission: PrismaSubmission & {
  cedant: { id: string; name: string; country: string };
  insured: { id: string; name: string; country: string };
  broker?: { id: string; name: string } | null;
  assignedTo?: { id: string; name: string } | null;
  riskDetails?: {
    classOfBusiness: string;
    perils: string[];
    sumInsured: any;
    currency: string;
  } | null;
  financialDetails?: {
    grossPremium: any;
    currency: string;
  } | null;
  documents: any[];
  tags: { value: string }[];
}): Submission {
  return {
    id: submission.id,
    reference: submission.reference,
    cedant: {
      id: submission.cedant.id,
      name: submission.cedant.name,
      country: submission.cedant.country,
      relationship: 'treaty_partner',
      contactPerson: '',
      email: '',
    },
    insured: {
      name: submission.insured.name,
      business: '',
      country: submission.insured.country,
      industry: '',
    },
    broker: submission.broker
      ? {
          id: submission.broker.id,
          name: submission.broker.name,
          contactPerson: '',
          email: '',
          market: '',
        }
      : undefined,
    riskDetails: {
      classOfBusiness: submission.riskDetails?.classOfBusiness ?? 'Unknown',
      peril: submission.riskDetails?.perils ?? [],
      geography: '',
      sumInsured: Number(submission.riskDetails?.sumInsured ?? 0),
      currency: submission.riskDetails?.currency ?? 'USD',
      policyPeriod: {
        from: submission.submissionDate,
        to: submission.dueDate ?? submission.submissionDate,
      },
    },
    financialDetails: {
      grossPremium: Number(submission.financialDetails?.grossPremium ?? 0),
      commission: 0,
      brokerage: 0,
      requestedShare: 0,
      currency: submission.financialDetails?.currency ?? 'USD',
    },
    status: submission.status as SubmissionStatus,
    priority: submission.priority as Priority,
    submissionDate: submission.submissionDate,
    dueDate: submission.dueDate ?? submission.submissionDate,
    assignedTo: submission.assignedTo?.name,
    documents: submission.documents.map((doc) => ({
      id: doc.id,
      submissionId: submission.id,
      filename: doc.filename,
      originalName: doc.originalName,
      mimeType: doc.mimeType,
      size: doc.size,
      uploadDate: doc.uploadDate,
      uploadedBy: doc.uploadedById ?? '',
      category: doc.category,
      status: doc.status,
      annotations: doc.annotations ?? [],
      version: doc.version,
      checksum: doc.checksum ?? '',
    })),
    workingSheet: {
      id: '',
      submissionId: submission.id,
      version: 1,
      lastModified: submission.updatedAt,
      modifiedBy: submission.assignedTo?.id ?? '',
      basicInfo: {
        insuredName: submission.insured.name,
        cedantName: submission.cedant.name,
        classOfBusiness: submission.riskDetails?.classOfBusiness ?? 'Unknown',
        country: submission.cedant.country,
        currency: submission.riskDetails?.currency ?? 'USD',
      },
      riskInfo: {
        peril: submission.riskDetails?.perils ?? [],
        sumInsured: Number(submission.riskDetails?.sumInsured ?? 0),
        policyPeriod: '',
        deductible: 0,
        occupancy: '',
        construction: '',
        numberOfLocations: 1,
      },
      lossHistory: [],
      exposureAnalysis: {
        pml: 0,
        aal: 0,
        returnPeriods: [],
        catastropheExposure: [],
        concentration: {
          byGeography: {},
          byClass: {},
          byCedant: {},
        },
      },
      pricing: {
        technicalRate: 0,
        loadings: [],
        finalRate: 0,
        grossPremium: Number(submission.financialDetails?.grossPremium ?? 0),
        commission: 0,
        netPremium: 0,
      },
      recommendations: {
        recommendedShare: 0,
        rationale: '',
        conditions: [],
        exclusions: [],
        riskFactors: [],
      },
    },
    aiAnalysis: undefined,
    decisionHistory: [],
    tags: submission.tags.map((tag) => tag.value),
    version: 1,
  };
}



