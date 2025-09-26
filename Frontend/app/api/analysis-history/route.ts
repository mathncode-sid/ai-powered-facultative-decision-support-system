import { NextResponse } from 'next/server';

import type { AnalysisHistoryRecord } from '@/lib/analysis-history-types';
import { readHistory, writeHistory } from './utils';

export async function GET() {
  try {
    const history = await readHistory();
    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error('Failed to load analysis history:', error);
    return NextResponse.json({ success: false, error: 'Unable to load analysis history.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as AnalysisHistoryRecord;

    if (!payload?.taskId) {
      return NextResponse.json({ success: false, error: 'taskId is required.' }, { status: 400 });
    }

    const history = await readHistory();
    const withoutCurrent = history.filter((record) => record.taskId !== payload.taskId);
    const updatedHistory = [
      {
        ...payload,
        persistedBy: 'server',
      },
      ...withoutCurrent,
    ];
    await writeHistory(updatedHistory);

    return NextResponse.json({ success: true, record: payload });
  } catch (error) {
    console.error('Failed to persist analysis history:', error);
    return NextResponse.json({ success: false, error: 'Unable to persist analysis history.' }, { status: 500 });
  }
}

