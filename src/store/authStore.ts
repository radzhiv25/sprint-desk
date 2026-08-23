import { create } from 'zustand';

import { configureApiAuth } from '@/lib/api/client';
import * as authService from '@/services/auth.service';
import type { AuthTokens, AuthUser, LoginCredentials, LoginResponse } from '@/types/auth';

const REFRESH_TOKEN_KEY = 'sprint-desk-refresh-token';
/** Simulates short-lived access tokens to exercise the refresh interceptor. */
const ACCESS_TOKEN_TTL_MS = 30_000;

let accessTokenExpiryTimer: ReturnType<typeof setTimeout> | null = null;

function readPersistedRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function persistRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

function clearPersistedRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function clearAccessTokenExpiryTimer(): void {
  if (accessTokenExpiryTimer) {
    clearTimeout(accessTokenExpiryTimer);
    accessTokenExpiryTimer = null;
  }
}

function toAuthUser(response: LoginResponse): AuthUser {
  const { accessToken: _accessToken, refreshToken: _refreshToken, ...user } = response;
  return user;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
}

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setSession: (user: AuthUser, tokens: AuthTokens) => void;
  setAccessToken: (accessToken: string) => void;
  setBootstrapping: (isBootstrapping: boolean) => void;
  bootstrapSession: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()((set, get) => {
  const scheduleAccessTokenExpiry = (): void => {
    clearAccessTokenExpiryTimer();
    accessTokenExpiryTimer = setTimeout(() => {
      set({ accessToken: null });
      accessTokenExpiryTimer = null;
    }, ACCESS_TOKEN_TTL_MS);
  };

  return {
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    isBootstrapping: true,

    login: async (credentials: LoginCredentials) => {
      const response = await authService.login(credentials);
      const user = toAuthUser(response);
      get().setSession(user, {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    },

    logout: () => {
      clearAccessTokenExpiryTimer();
      clearPersistedRefreshToken();
      set({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        isBootstrapping: false,
      });
    },

    setSession: (user: AuthUser, tokens: AuthTokens) => {
      persistRefreshToken(tokens.refreshToken);
      set({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        isAuthenticated: true,
      });
      scheduleAccessTokenExpiry();
    },

    setAccessToken: (accessToken: string) => {
      set({ accessToken });
      scheduleAccessTokenExpiry();
    },

    setBootstrapping: (isBootstrapping: boolean) => {
      set({ isBootstrapping });
    },

    refreshAccessToken: async (): Promise<string | null> => {
      const storedRefresh = get().refreshToken ?? readPersistedRefreshToken();
      if (!storedRefresh) {
        get().logout();
        return null;
      }

      try {
        const response = await authService.refreshToken(storedRefresh);
        let user = get().user;

        if (!user) {
          user = await authService.getCurrentUser(response.accessToken);
        }

        get().setSession(user, {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
        return response.accessToken;
      } catch {
        get().logout();
        return null;
      }
    },

    bootstrapSession: async () => {
      set({ isBootstrapping: true });

      const storedRefresh = readPersistedRefreshToken();
      if (!storedRefresh) {
        set({ isBootstrapping: false });
        return;
      }

      set({ refreshToken: storedRefresh });

      try {
        const response = await authService.refreshToken(storedRefresh);
        const user = await authService.getCurrentUser(response.accessToken);
        get().setSession(user, {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
      } catch {
        clearPersistedRefreshToken();
        set({
          refreshToken: null,
          accessToken: null,
          user: null,
          isAuthenticated: false,
        });
      } finally {
        set({ isBootstrapping: false });
      }
    },
  };
});

configureApiAuth(
  () => useAuthStore.getState().accessToken,
  () => useAuthStore.getState().refreshAccessToken(),
);
