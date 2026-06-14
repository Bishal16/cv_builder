import { useAuthStore } from '../store/authStore';
import { ApiError } from './cvApi';

const API_BASE = '/api/v1/grammar';

async function authHeaders(): Promise<HeadersInit> {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface GrammarIssue {
  original: string;
  suggestion: string;
  explanation: string;
}

export interface GrammarResponse {
  correctedText: string;
  issues: GrammarIssue[];
}

export async function checkGrammar(text: string): Promise<GrammarResponse> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => 'Unknown error');
    throw new ApiError(res.status, msg || `Grammar check failed (${res.status})`);
  }

  return res.json() as Promise<GrammarResponse>;
}
