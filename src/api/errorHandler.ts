import axios, { type AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types';
import { createApiError } from './apiError';

/**
 * Extracts a typed ApiError from an Axios error.
 * Throws the constructed ApiError; never returns normally.
 */
export function handleAxiosError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const status = axiosError.response?.status ?? 0;
    const data = axiosError.response?.data;

    if (data && typeof data === 'object' && 'message' in data) {
      throw createApiError(data, status);
    }

    // No structured body — synthesize a readable message
    const message = getStatusMessage(status);
    throw createApiError({ status, message }, status);
  }

  // Network error or non-Axios error
  throw createApiError(
    { status: 0, message: 'Network error — please check your connection and try again.' },
    0,
  );
}

function getStatusMessage(status: number): string {
  switch (status) {
    case 400: return 'Invalid request.';
    case 401: return 'You are not authenticated. Please log in.';
    case 403: return 'You do not have permission to perform this action.';
    case 404: return 'The requested resource was not found.';
    case 409: return 'This operation conflicts with existing data.';
    case 500: return 'A server error occurred. Please try again later.';
    default:  return 'An unexpected error occurred.';
  }
}
