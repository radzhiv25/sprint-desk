import axios from 'axios';

import type { AuthUser, LoginCredentials, LoginResponse, RefreshResponse } from '@/types/auth';

const DUMMYJSON_BASE_URL =
  import.meta.env.VITE_DUMMYJSON_BASE_URL ?? 'https://dummyjson.com';

const authHttp = axios.create({
  baseURL: DUMMYJSON_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await authHttp.post<LoginResponse>('/auth/login', credentials);
  return data;
}

export async function refreshToken(token: string): Promise<RefreshResponse> {
  const { data } = await authHttp.post<RefreshResponse>('/auth/refresh', {
    refreshToken: token,
  });
  return data;
}

export async function getCurrentUser(accessToken: string): Promise<AuthUser> {
  const { data } = await authHttp.get<AuthUser>('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}
