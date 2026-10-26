import apiClient from '@/api/axiosInstance';
import { handleAxiosError } from '@/api/errorHandler';
import { API_PATHS } from '@/constants/api';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types';

/**
 * Register a new user account.
 * On success, the server sets the HttpOnly JWT cookie and returns AuthResponse.
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>(
      API_PATHS.AUTH.REGISTER,
      data,
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

/**
 * Authenticate an existing user.
 * On success, the server sets the HttpOnly JWT cookie and returns AuthResponse.
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>(
      API_PATHS.AUTH.AUTHENTICATE,
      data,
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

/**
 * Initiate GitHub OAuth2 login by navigating the browser to the backend endpoint.
 * The backend redirects to GitHub, then back, then sets the JWT cookie and
 * redirects to the configured frontend root (http://localhost:5173 by default).
 *
 * This is a full browser navigation — not an Axios request.
 */
export function initiateGitHubOAuth(): void {
  window.location.href = API_PATHS.AUTH.GITHUB_OAUTH;
}

/**
 * Client-side logout.
 *
 * LIMITATION: No backend logout endpoint is documented in API_Reference.md.
 * This function clears React auth state and redirects to login.
 * The HttpOnly JWT cookie remains valid on the server until its Max-Age expires
 * (24 hours). To implement true server-side session invalidation, a
 * POST /api/v1/auth/logout endpoint would need to be added to the backend.
 */
export function logoutClientSide(): void {
  // Nothing to clear from storage — JWT is in an HttpOnly cookie.
  // The AuthContext handles state reset; the caller handles navigation.
}
