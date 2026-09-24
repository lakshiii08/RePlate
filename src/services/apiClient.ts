/**
 * Centralized API Client for RePlate.
 * Communicates with backend endpoints (port 8000 or Next.js route handlers)
 * with robust auto-fallback and error resilience.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

export interface ApiResponse<T> {
  data: T | null;
  status: number;
  message?: string;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  if (USE_MOCK) {
    return { data: null, status: 200, message: 'Mock mode active' };
  }

  // Ensure clean endpoint path
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // 1. Try primary backend URL
  try {
    const primaryUrl = `${API_BASE_URL}${normalizedEndpoint}`;
    const response = await fetch(primaryUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    if (response.ok) {
      const data = await response.json();
      return { data, status: response.status };
    }
  } catch {
    // If primary backend fails (e.g., port 8000 unreachable), try local Next.js /api path
    try {
      const fallbackUrl = `/api${normalizedEndpoint}`;
      const response = await fetch(fallbackUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        ...options,
      });

      if (response.ok) {
        const data = await response.json();
        return { data, status: response.status };
      }
    } catch {
      // Both network routes failed, safely report status for local service fallback
    }
  }

  return { data: null, status: 503, message: 'Backend unreachable; utilizing client mock state' };
}

export const isMockMode = () => USE_MOCK;

export const apiClient = {
  get: <T>(endpoint: string, headers?: HeadersInit) =>
    fetchApi<T>(endpoint, { method: 'GET', headers }),

  post: <T>(endpoint: string, body: unknown, headers?: HeadersInit) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body: unknown, headers?: HeadersInit) =>
    fetchApi<T>(endpoint, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, headers?: HeadersInit) =>
    fetchApi<T>(endpoint, { method: 'DELETE', headers }),
};
