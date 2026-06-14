import { useAuthStore } from '../store/authStore';
import { ApiError } from './cvApi';

const API_BASE = '/api/v1/ai';

async function authHeaders(): Promise<HeadersInit> {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface AiSuggestRequest {
  type: 'summary' | 'experience' | 'project';
  content: string;
  context?: string;
}

export interface JdTailorRequest {
  jobDescription: string;
  cvSummary?: string;
  skills?: string[];
  experiences?: { role: string; company: string; description: string }[];
}

export interface JdTailorResponse {
  matchScore: number;
  missingKeywords: string[];
  presentKeywords: string[];
  suggestions: string[];
}

export async function tailorToJd(req: JdTailorRequest): Promise<JdTailorResponse> {
  const res = await fetch(`${API_BASE}/tailor`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new ApiError(res.status, text || `Tailor request failed (${res.status})`);
  }
  return res.json() as Promise<JdTailorResponse>;
}

export interface CoverLetterRequest {
  candidateName?: string;
  cvSummary?: string;
  skills?: string[];
  experiences?: { role: string; company: string; description: string }[];
  companyName?: string;
  roleTitle?: string;
  jobDescription?: string;
  tone?: 'professional' | 'enthusiastic' | 'concise';
}

export async function generateCoverLetter(req: CoverLetterRequest): Promise<string> {
  const res = await fetch(`${API_BASE}/cover-letter`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new ApiError(res.status, text || `Cover letter request failed (${res.status})`);
  }
  const data = await res.json() as { coverLetter: string };
  return data.coverLetter;
}

export async function importResume(file: File): Promise<unknown> {
  const token = useAuthStore.getState().token;
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/v1/import', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Import failed');
    throw new ApiError(res.status, text);
  }
  return res.json();
}

export async function getSuggestions(req: AiSuggestRequest): Promise<string[]> {
  const res = await fetch(`${API_BASE}/suggest`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new ApiError(res.status, text || `AI request failed (${res.status})`);
  }

  const data = await res.json() as { suggestions: string[] };
  return data.suggestions;
}
