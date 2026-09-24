/**
 * Centralized API Client abstraction for RePlate.
 * Handles environment-based switching between real HTTP/WebSocket endpoints and mock fallback.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  if (USE_MOCK) {
    // In mock mode, log call and return handled response by caller service
    console.log(`[API MOCK CALL]: ${options.method || 'GET'} ${endpoint}`);
    // Simulate slight network latency (100-300ms)
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    if (USE_MOCK) {
      // Return unhandled marker if mock mode fallback is enabled
      return { data: null as unknown as T, status: 200, message: 'Mock Fallback Active' };
    }
    throw error;
  }
}

export const isMockMode = () => USE_MOCK;
