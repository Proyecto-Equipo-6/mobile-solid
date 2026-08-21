import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'nexbit_auth_token';
const REQUEST_TIMEOUT_MS = 15000;

function resolveApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl;
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:3000/api/v1`;
  }
  return 'http://localhost:3000/api/v1';
}

const API_BASE_URL = resolveApiBaseUrl();

async function getStoredToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function setStoredToken(token: string | null): Promise<void> {
  try {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch {
    // Silenciar errores de almacenamiento en entornos sin SecureStore (ej. web)
  }
}

export async function initializeAuthToken(): Promise<void> {
  const stored = await getStoredToken();
  if (stored) {
    setAuthToken(stored);
  }
}

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
  setStoredToken(token);
}

export function getAuthToken(): string | null {
  return authToken;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type QueryParams = Record<string, string | number | boolean | undefined>;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  json?: unknown;
  query?: QueryParams;
};

function toQueryString(query: QueryParams): string {
  const params = Object.entries(query)
    .filter(([, value]) => value !== undefined)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    );
  return params.length > 0 ? `?${params.join('&')}` : '';
}

function buildFetchOptions(options: RequestOptions, timeoutMs: number): {
  controller: AbortController;
  timeoutId: ReturnType<typeof setTimeout>;
  init: RequestInit;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const body = options.json !== undefined ? JSON.stringify(options.json) : undefined;

  const init: RequestInit = {
    method: options.method ?? 'GET',
    headers,
    body,
    credentials: 'include',
    signal: controller.signal,
  };

  return { controller, timeoutId, init };
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}${toQueryString(options.query ?? {})}`;

  const { controller, timeoutId, init } = buildFetchOptions(options, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, init);
    clearTimeout(timeoutId);
    return handleResponse<T>(response);
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Tiempo de espera agotado. Verifica tu conexión.', 0, 'TIMEOUT');
    }
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      throw new ApiError('No se pudo conectar al servidor. Verifica que el backend esté corriendo.', 0, 'NETWORK_ERROR');
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Error de red. Verifica la IP/dirección del servidor.', 0, 'FETCH_ERROR');
    }
    throw error;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `La petición falló con estado ${response.status}`;
    try {
      const data = (await response.json()) as { error?: string; message?: string };
      if (data?.error) {
        message = data.error;
      } else if (data?.message) {
        message = data.message;
      }
    } catch {
      // Cuerpo de error no JSON: se mantiene el mensaje genérico.
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function requestForm<T>(
  path: string,
  formData: FormData,
  options: { query?: QueryParams } = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}${toQueryString(options.query ?? {})}`;

  const { controller, timeoutId, init } = buildFetchOptions({ method: 'POST' }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...init,
      method: 'POST',
      body: formData,
      // No Content-Type para FormData (el navegador lo establece con boundary)
    });
    clearTimeout(timeoutId);
    return handleResponse<T>(response);
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Tiempo de espera agotado al subir archivo.', 0, 'TIMEOUT');
    }
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      throw new ApiError('No se pudo conectar al servidor.', 0, 'NETWORK_ERROR');
    }
    throw error;
  }
}

export const api = {
  get<T>(path: string, query?: QueryParams, options?: Omit<RequestOptions, 'method' | 'json' | 'query'>): Promise<T> {
    return request<T>(path, { ...options, method: 'GET', query });
  },
  post<T>(path: string, json?: unknown, options?: Omit<RequestOptions, 'method' | 'json'>): Promise<T> {
    return request<T>(path, { ...options, method: 'POST', json });
  },
  put<T>(path: string, json?: unknown, options?: Omit<RequestOptions, 'method' | 'json'>): Promise<T> {
    return request<T>(path, { ...options, method: 'PUT', json });
  },
  patch<T>(path: string, json?: unknown, options?: Omit<RequestOptions, 'method' | 'json'>): Promise<T> {
    return request<T>(path, { ...options, method: 'PATCH', json });
  },
  delete<T>(path: string, options?: Omit<RequestOptions, 'method' | 'json'>): Promise<T> {
    return request<T>(path, { ...options, method: 'DELETE' });
  },
  upload<T>(path: string, formData: FormData, options?: { query?: QueryParams }): Promise<T> {
    return requestForm<T>(path, formData, options);
  },
};