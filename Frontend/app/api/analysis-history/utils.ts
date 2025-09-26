import path from 'path';
import { promises as fs } from 'fs';

import type { AnalysisHistoryRecord } from '@/lib/analysis-history-types';

const MAX_HISTORY_ITEMS = 100;
const DATA_DIRECTORY = path.join(process.cwd(), 'storage');
const HISTORY_FILE_PATH = path.join(DATA_DIRECTORY, 'analysis-history.json');

async function ensureHistoryFile(): Promise<void> {
  try {
    await fs.access(HISTORY_FILE_PATH);
  } catch {
    await fs.mkdir(DATA_DIRECTORY, { recursive: true });
    await fs.writeFile(HISTORY_FILE_PATH, '[]', 'utf-8');
  }
}

export async function readHistory(): Promise<AnalysisHistoryRecord[]> {
  await ensureHistoryFile();

  try {
    const content = await fs.readFile(HISTORY_FILE_PATH, 'utf-8');
    const data = JSON.parse(content) as AnalysisHistoryRecord[];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to read analysis history file:', error);
    return [];
  }
}

export async function writeHistory(records: AnalysisHistoryRecord[]): Promise<void> {
  const sanitized = [...records]
    .filter((record) => !!record.taskId)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, MAX_HISTORY_ITEMS);

  await ensureHistoryFile();
  await fs.writeFile(HISTORY_FILE_PATH, JSON.stringify(sanitized, null, 2), 'utf-8');
}

export { HISTORY_FILE_PATH as analysisHistoryFilePath, DATA_DIRECTORY as analysisHistoryDirectory };

