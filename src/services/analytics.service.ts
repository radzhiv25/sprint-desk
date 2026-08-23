import type { MockData, Sprint, Task } from '@/types';

const MOCK_DATA_URL = '/mock-data.json';

async function fetchMockData(): Promise<MockData> {
  const response = await fetch(MOCK_DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch mock data: ${response.status}`);
  }
  return response.json() as Promise<MockData>;
}

export async function fetchTasks(limit = 30): Promise<Task[]> {
  const data = await fetchMockData();
  return data.tasks.slice(0, limit);
}

export async function fetchSprints(): Promise<Sprint[]> {
  const data = await fetchMockData();
  return data.sprints;
}
