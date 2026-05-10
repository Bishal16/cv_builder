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

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new ApiError(response.status, errorText);
  }
  return response.json();
}

export async function getAllCvs(): Promise<Cv[]> {
  const response = await fetch(`${API_BASE_URL}/cv`);
  return handleResponse<Cv[]>(response);
}

export async function getCv(id: string): Promise<Cv> {
  const response = await fetch(`${API_BASE_URL}/cv/${id}`);
  return handleResponse<Cv>(response);
}

export async function createCv(data: CreateCvRequest): Promise<Cv> {
  const response = await fetch(`${API_BASE_URL}/cv`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Cv>(response);
}

export async function updateCv(id: string, data: UpdateCvRequest): Promise<Cv> {
  const response = await fetch(`${API_BASE_URL}/cv/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Cv>(response);
}

export async function deleteCv(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/cv/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new ApiError(response.status, errorText);
  }
}