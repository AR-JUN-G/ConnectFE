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
 * Log out the current user by invalidating the session on the backend.
 * The server clears the HttpOnly JWT cookie by setting Max-Age=0.
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post(API_PATHS.AUTH.LOGOUT);
  } catch (error) {
    // Log error but allow client cleanup to proceed
    console.error('Logout API request failed:', error);
  }
}
