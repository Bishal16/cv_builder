import { useAuthStore } from '../store/authStore';
import { ApiError } from './cvApi';
import type { Cv } from '../types/cv';

const API_BASE = '/api/v1';

async function authHeaders(): Promise<HeadersInit> {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function enableShare(cvId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/cv/${cvId}/share`, {
    method: 'POST',
    headers: await authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new ApiError(res.status, text || `Share request failed (${res.status})`);
  }
  const data = await res.json() as { token: string };
  return data.token;
}

export async function disableShare(cvId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/cv/${cvId}/share`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new ApiError(res.status, text || `Disable share failed (${res.status})`);
  }
}

export async function getShareToken(cvId: string): Promise<string | null> {
  const res = await fetch(`${API_BASE}/cv/${cvId}/share`, {
    headers: await authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new ApiError(res.status, text || `Share lookup failed (${res.status})`);
  }
  const data = await res.json() as { token?: string };
  return data.token ?? null;
}

export async function getShareConfig(): Promise<string> {
  const res = await fetch(`${API_BASE}/public/config`);
  if (!res.ok) return window.location.origin;
  const data = await res.json() as { shareBaseUrl: string };
  return data.shareBaseUrl;
}

export async function getPublicCv(token: string): Promise<Cv> {
  const res = await fetch(`${API_BASE}/public/cv/${token}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new ApiError(res.status, text || `Public CV request failed (${res.status})`);
  }
  return res.json() as Promise<Cv>;
}
