export interface SubmissionStats {
  total: number;
  totalDelta: number;
  pendingReview: number;
  inProgress: number;
  awaitingApproval: number;
}

export function aggregateSubmissionStats(submissions: { status: string; createdAt: Date }[]): SubmissionStats {
  const total = submissions.length;
  const today = new Date();
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);

  const totalLastWeek = submissions.filter((submission) => submission.createdAt >= oneWeekAgo).length;

  return {
    total,
    totalDelta: totalLastWeek,
    pendingReview: submissions.filter((submission) => submission.status === 'pending_review').length,
    inProgress: submissions.filter((submission) =>
      ['under_analysis', 'pricing_review', 'portfolio_check'].includes(submission.status))
      .length,
    awaitingApproval: submissions.filter((submission) => submission.status === 'awaiting_approval').length,
  };
}


