import type { Comment } from './comment';
import type { Notification } from './notification';
import type { Sprint } from './sprint';
import type { Task } from './task';
import type { User } from './user';

export interface MockData {
  users: User[];
  sprints: Sprint[];
  tasks: Task[];
  comments: Comment[];
  notifications: Notification[];
}

export type { Comment } from './comment';
export type { Notification, NotificationType } from './notification';
export type { Sprint } from './sprint';
export type {
  CompletionTrendPoint,
  PriorityBreakdown,
  SprintAnalyticsPoint,
  TaskStatusDistribution,
} from './analytics';
export type { Priority, Task, TaskStatus } from './task';
export type { User } from './user';
export type {
  AuthTokens,
  AuthUser,
  LoginCredentials,
  LoginResponse,
  RefreshResponse,
} from './auth';
export { TASK_STATUSES, TASK_STATUS_LABELS } from './task';
