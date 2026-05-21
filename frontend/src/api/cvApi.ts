import { useAuthStore } from '../store/authStore';
import type {
  Cv,
  CreateCvRequest,
  UpdateCvRequest,
} from '../types/cv';

const API_BASE_URL = '/api';

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
      // Try to parse as JSON for cleaner error messages
      const errorJson = JSON.parse(errorText);
      throw new ApiError(response.status, errorJson.error || errorJson.message || 'Unknown error');
    } catch {
      throw new ApiError(response.status, errorText);
    }
  }
  return response.json();
}

// Auth API
export async function login(credentials: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: await getHeaders(false),
    body: JSON.stringify(credentials),
  });
  return handleResponse(response);
}

export async function register(userData: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: await getHeaders(false),
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
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
