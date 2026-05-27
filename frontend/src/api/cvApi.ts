import { useAuthStore } from '../store/authStore';
import type {
  Cv,
  CreateCvRequest,
  UpdateCvRequest,
} from '../types/cv';

const API_BASE_URL = '/api/v1';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function getHeaders(requireAuth = true): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = useAuthStore.getState().token;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    useAuthStore.getState().logout();
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    try {
      const errorJson = JSON.parse(errorText);
      throw new ApiError(response.status, errorJson.message || errorJson.error || 'Unknown error');
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(response.status, errorText);
    }
  }
  return response.json();
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}

export interface UserDetails {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  user: UserDetails;
}

// Auth API
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: await getHeaders(false),
    body: JSON.stringify(credentials),
  });
  return handleResponse<AuthResponse>(response);
}

export async function register(userData: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: await getHeaders(false),
    body: JSON.stringify(userData),
  });
  return handleResponse<AuthResponse>(response);
}

// CV API
export async function getAllCvs(): Promise<Cv[]> {
  const response = await fetch(`${API_BASE_URL}/cv`, {
    headers: await getHeaders(),
  });
  return handleResponse<Cv[]>(response);
}

export async function getCv(id: string): Promise<Cv> {
  const response = await fetch(`${API_BASE_URL}/cv/${id}`, {
    headers: await getHeaders(),
  });
  return handleResponse<Cv>(response);
}

export async function createCv(data: CreateCvRequest): Promise<Cv> {
  const response = await fetch(`${API_BASE_URL}/cv`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Cv>(response);
}

export async function updateCv(id: string, data: UpdateCvRequest): Promise<Cv> {
  const response = await fetch(`${API_BASE_URL}/cv/${id}`, {
    method: 'PUT',
    headers: await getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Cv>(response);
}

export async function exportPdf(id: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/cv/${id}/export/pdf`, {
    headers: await getHeaders(),
  });
  if (response.status === 401) {
    useAuthStore.getState().logout();
  }
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Export failed');
    throw new ApiError(response.status, errorText);
  }
  return response.blob();
}

export async function deleteCv(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/cv/${id}`, {
    method: 'DELETE',
    headers: await getHeaders(),
  });
  if (response.status === 401) {
    useAuthStore.getState().logout();
  }
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new ApiError(response.status, errorText);
  }
}
