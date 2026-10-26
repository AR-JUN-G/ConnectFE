import type { ApiErrorResponse } from '@/types';

/**
 * Typed API error. Thrown by errorHandler and caught in UI layers.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly validationErrors?: Record<string, string>;
  public readonly serverError?: string;
  public readonly path?: string;

  constructor(
    message: string,
    status: number,
    validationErrors?: Record<string, string>,
    serverError?: string,
    path?: string,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.validationErrors = validationErrors;
    this.serverError = serverError;
    this.path = path;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  get isValidationError(): boolean {
    return this.status === 400 && !!this.validationErrors;
  }
}

export function createApiError(data: ApiErrorResponse, httpStatus: number): ApiError {
  return new ApiError(
    data.message ?? 'An unexpected error occurred.',
    data.status ?? httpStatus,
    data.validationErrors,
    data.error,
    data.path,
  );
}
