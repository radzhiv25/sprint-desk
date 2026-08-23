import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const DUMMYJSON_BASE_URL =
  import.meta.env.VITE_DUMMYJSON_BASE_URL ?? 'https://dummyjson.com';

export const apiClient = axios.create({
  baseURL: DUMMYJSON_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

type RequestConfigWithRetry = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type QueueEntry = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let getAccessToken: (() => string | null) | null = null;
let refreshAccessToken: (() => Promise<string | null>) | null = null;
let isRefreshing = false;
let failedQueue: QueueEntry[] = [];

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach((entry) => {
    if (error) {
      entry.reject(error);
    } else if (token) {
      entry.resolve(token);
    }
  });
  failedQueue = [];
}

/** Phase 1A wires real token getters from authStore. */
export function configureApiAuth(
  tokenGetter: () => string | null,
  tokenRefresher: () => Promise<string | null>,
): void {
  getAccessToken = tokenGetter;
  refreshAccessToken = tokenRefresher;
}

/** Test helper — reset module-level refresh queue state between tests. */
export function resetApiAuthState(): void {
  getAccessToken = null;
  refreshAccessToken = null;
  isRefreshing = false;
  failedQueue = [];
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken?.() ?? null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RequestConfigWithRetry | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      !refreshAccessToken
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            originalRequest._retry = true;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();

      if (!newToken) {
        processQueue(error);
        return Promise.reject(error);
      }

      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
