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
  emailVerified?: boolean;
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

// Auth: fetch current user (used by OAuthCallback before authStore is populated)
export async function getMe(token: string): Promise<UserDetails> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse<UserDetails>(response);
}

// Auth: update profile (first/last name)
export async function updateProfile(data: { firstName: string; lastName: string }): Promise<UserDetails> {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: await getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<UserDetails>(response);
}

// Auth: forgot password — always 204, never reveals if email exists
export async function forgotPassword(email: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: await getHeaders(false),
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    throw new ApiError(response.status, 'Request failed');
  }
}

// Auth: reset password with token from email link
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: await getHeaders(false),
    body: JSON.stringify({ token, newPassword }),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => 'Reset failed');
    try {
      const j = JSON.parse(text);
      throw new ApiError(response.status, j.message || j.error || text);
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(response.status, text);
    }
  }
}

// Auth: change password (local accounts only)
export async function changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/password`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Password change failed');
    try {
      const errorJson = JSON.parse(errorText);
      throw new ApiError(response.status, errorJson.message || errorJson.error || 'Password change failed');
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(response.status, errorText);
    }
  }
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


// Email verification
export async function verifyEmail(token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
    method: 'POST',
    headers: await getHeaders(false),
    body: JSON.stringify({ token }),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => 'Verification failed');
    try {
      const j = JSON.parse(text);
      throw new ApiError(response.status, j.message || j.error || text);
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(response.status, text);
    }
  }
}

export async function resendVerification(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
    method: 'POST',
    headers: await getHeaders(),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => 'Could not resend');
    throw new ApiError(response.status, text);
  }
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
