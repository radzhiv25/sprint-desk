import type { Comment, MockData, Priority, Task, TaskStatus, User } from '@/types';

const MOCK_DATA_URL = '/mock-data.json';
const DEFAULT_TASK_LIMIT = 30;

async function fetchMockData(): Promise<MockData> {
  const response = await fetch(MOCK_DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch mock data: ${response.status}`);
  }
  return response.json() as Promise<MockData>;
}

export async function fetchTasks(limit = DEFAULT_TASK_LIMIT): Promise<Task[]> {
  const data = await fetchMockData();
  return data.tasks.slice(0, limit);
}

export async function fetchUsers(): Promise<User[]> {
  const data = await fetchMockData();
  return data.users;
}

export async function fetchComments(): Promise<Comment[]> {
  const data = await fetchMockData();
  return data.comments;
}

export interface CreateTaskInput {
  title: string;
  priority: Priority;
  assigneeId: number;
  dueDate: string;
  status?: TaskStatus;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: number;
  dueDate?: string;
}

export interface AddCommentInput {
  taskId: number;
  authorId: number;
  message: string;
}

function nextId<T extends { id: number }>(items: T[]): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

export async function createTask(input: CreateTaskInput, existingTasks: Task[]): Promise<Task> {
  const now = new Date().toISOString();
  return {
    id: nextId(existingTasks),
    title: input.title.trim(),
    description: '',
    status: input.status ?? 'backlog',
    priority: input.priority,
    assigneeId: input.assigneeId,
    dueDate: input.dueDate,
    sprintId: existingTasks[0]?.sprintId ?? 1,
    order: existingTasks.length + 1,
    createdAt: now,
    completedAt: null,
    updatedAt: now,
  };
}

export async function updateTask(
  taskId: number,
  input: UpdateTaskInput,
  existingTasks: Task[],
): Promise<Task> {
  const task = existingTasks.find((item) => item.id === taskId);
  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  const now = new Date().toISOString();
  const status = input.status ?? task.status;

  return {
    ...task,
    ...input,
    status,
    completedAt: status === 'done' ? task.completedAt ?? now : null,
    updatedAt: now,
  };
}

export async function deleteTask(taskId: number, existingTasks: Task[]): Promise<number> {
  const exists = existingTasks.some((item) => item.id === taskId);
  if (!exists) {
    throw new Error(`Task ${taskId} not found`);
  }
  return taskId;
}

export async function addComment(
  input: AddCommentInput,
  existingComments: Comment[],
): Promise<Comment> {
  return {
    id: nextId(existingComments),
    taskId: input.taskId,
    authorId: input.authorId,
    message: input.message.trim(),
    createdAt: new Date().toISOString(),
  };
}
