import type { Notification, NotificationType } from '@/types';

const JSONPLACEHOLDER_BASE_URL =
  import.meta.env.VITE_JSONPLACEHOLDER_BASE_URL ?? 'https://jsonplaceholder.typicode.com';

export interface PlaceholderPost {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export async function fetchLatestPosts(): Promise<PlaceholderPost[]> {
  const response = await fetch(`${JSONPLACEHOLDER_BASE_URL}/posts?_limit=5`);
  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.status}`);
  }
  return response.json() as Promise<PlaceholderPost[]>;
}

export function mapPostToNotification(post: PlaceholderPost): Notification {
  const type: NotificationType = post.id % 2 === 0 ? 'review' : 'task';

  return {
    id: post.id,
    title: post.title,
    message: post.body,
    type,
    read: false,
    createdAt: new Date().toISOString(),
  };
}
