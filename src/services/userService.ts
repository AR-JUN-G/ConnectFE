import apiClient from '@/api/axiosInstance';
import { handleAxiosError } from '@/api/errorHandler';
import { API_PATHS } from '@/constants/api';
import type { UpdateProfileResponse, UserProfile } from '@/types';

/**
 * Fetch the currently authenticated user's profile.
 * Returns 401 if the JWT cookie is missing or expired.
 * Used to validate the session on app load.
 */
export async function getProfile(): Promise<UserProfile> {
  try {
    const response = await apiClient.get<UserProfile>(API_PATHS.USERS.PROFILE);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

/**
 * Update the current user's profile.
 * Uses multipart/form-data — do NOT manually set Content-Type;
 * the browser/Axios will set it with the required boundary.
 *
 * Only include fields that are being changed. All fields are optional.
 */
export async function updateProfile(
  formData: FormData,
): Promise<UpdateProfileResponse> {
  try {
    const response = await apiClient.patch<UpdateProfileResponse>(
      API_PATHS.USERS.PROFILE,
      formData,
      {
        // Let Axios set the Content-Type with the multipart boundary
        headers: { 'Content-Type': undefined },
      },
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
}
