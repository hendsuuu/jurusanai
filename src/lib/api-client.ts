export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiError = {
  success: false;
  message: string;
  errors?: unknown;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export class ApiClientError extends Error {
  status: number;
  errors?: unknown;
  constructor(message: string, status: number, errors?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;
  }
}

export async function apiClient<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init?.headers ?? {}),
  };

  const res = await fetch(input, {
    ...init,
    headers,
    cache: "no-store",
  });

  let json: ApiResponse<T> | null = null;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError(
      `Network error (${res.status})`,
      res.status,
      null
    );
  }

  if (!res.ok || !json.success) {
    const message =
      (json && "message" in json && json.message) || `Request failed (${res.status})`;
    const errors =
      json && "errors" in json && (json as ApiError).errors !== undefined
        ? (json as ApiError).errors
        : undefined;
    throw new ApiClientError(message, res.status, errors);
  }

  return json.data;
}
