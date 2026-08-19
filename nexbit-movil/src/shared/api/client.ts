const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
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
  token?: string;
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

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}${toQueryString(options.query ?? {})}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const body = options.json !== undefined ? JSON.stringify(options.json) : undefined;

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body,
    credentials: 'include',
  });

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
};
