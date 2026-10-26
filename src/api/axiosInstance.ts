import axios from 'axios';
import { API_BASE_URL } from '@/constants/api';

/**
 * Shared Axios instance.
 *
 * Authentication: the backend uses an HttpOnly cookie named `jwt`.
 * withCredentials: true ensures the browser sends this cookie on every request.
 * Do NOT manually read or attach the JWT — the browser handles it entirely.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,          // send the HttpOnly jwt cookie automatically
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Response interceptor.
 * On 401, dispatch a custom event so the AuthContext can react
 * without this module needing a direct reference to React state.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Only dispatch the event for protected endpoints
      const url = error.config?.url ?? '';
      const isAuthEndpoint =
        url.includes('/auth/register') || url.includes('/auth/authenticate');

      if (!isAuthEndpoint) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
