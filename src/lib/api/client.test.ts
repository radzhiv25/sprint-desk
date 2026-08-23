import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { apiClient, configureApiAuth, resetApiAuthState } from '@/lib/api/client';

type RequestConfigWithRetry = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

function createUnauthorizedError(config: InternalAxiosRequestConfig): {
  response: { status: number };
  config: InternalAxiosRequestConfig;
  isAxiosError: true;
} {
  return {
    response: { status: 401 },
    config,
    isAxiosError: true,
  };
}

describe('apiClient auth interceptor', () => {
  beforeEach(() => {
    resetApiAuthState();
    vi.restoreAllMocks();
  });

  it('refreshes once and retries the original request after a 401', async () => {
    const refreshAccessToken = vi.fn(async () => 'fresh-token');
    configureApiAuth(() => 'expired-token', refreshAccessToken);

    let attempt = 0;
    const adapter: AxiosAdapter = async (config) => {
      attempt += 1;
      const request = config as RequestConfigWithRetry;

      if (!request._retry) {
        return Promise.reject(createUnauthorizedError(config));
      }

      return {
        data: { ok: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    };

    apiClient.defaults.adapter = adapter;

    const response = await apiClient.get('/auth/me');

    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(attempt).toBe(2);
    expect(response.data).toEqual({ ok: true });
  });

  it('queues concurrent 401 requests behind a single refresh', async () => {
    let refreshCount = 0;
    const refreshAccessToken = vi.fn(async () => {
      refreshCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 20));
      return 'fresh-token';
    });

    configureApiAuth(() => 'expired-token', refreshAccessToken);

    const adapter: AxiosAdapter = async (config) => {
      const request = config as RequestConfigWithRetry;

      if (!request._retry) {
        return Promise.reject(createUnauthorizedError(config));
      }

      return {
        data: { path: config.url },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    };

    apiClient.defaults.adapter = adapter;

    const [first, second] = await Promise.all([
      apiClient.get('/auth/me'),
      apiClient.get('/users/1'),
    ]);

    expect(refreshCount).toBe(1);
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(first.data).toEqual({ path: '/auth/me' });
    expect(second.data).toEqual({ path: '/users/1' });
  });

  it('rejects when refresh fails', async () => {
    const refreshAccessToken = vi.fn(async () => null);
    configureApiAuth(() => 'expired-token', refreshAccessToken);

    const adapter: AxiosAdapter = async (config) => {
      return Promise.reject(createUnauthorizedError(config));
    };

    apiClient.defaults.adapter = adapter;

    await expect(apiClient.get('/auth/me')).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
  });
});
