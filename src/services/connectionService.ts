import apiClient from '@/api/axiosInstance';
import { handleAxiosError } from '@/api/errorHandler';
import { API_PATHS } from '@/constants/api';
import type { ReviewAction, SuccessResponse, UserCardResponse } from '@/types';

/**
 * Get paginated developer suggestion feed.
 * Returns users the current user has not yet connected with or sent requests to.
 */
export async function getFeed(page: number, size: number): Promise<UserCardResponse[]> {
  try {
    const response = await apiClient.get<UserCardResponse[]>(API_PATHS.CONNECTIONS.FEED, {
      params: { page, size },
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

/**
 * Send a connection request to the specified user.
 *
 * @param receiverId - The target user's ID.
 * @throws ApiError with status 409 if a request already exists.
 */
export async function sendConnectionRequest(receiverId: number): Promise<SuccessResponse> {
  try {
    const response = await apiClient.post<SuccessResponse>(
      API_PATHS.CONNECTIONS.SEND(receiverId),
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

/**
 * Get all pending connection requests received by the current user.
 *
 * IMPORTANT IMPLEMENTATION NOTE:
 * The API returns UserCardResponse objects. The `id` field is used as the
 * requestId for the review endpoint. Based on the API design, where received
 * requests returns cards for users who sent requests, this `id` is assumed
 * to be the connection REQUEST ID (not the sender's user ID).
 *
 * If the backend inspection reveals that `id` is the USER ID, then a
 * separate mechanism to retrieve the actual requestId would be needed.
 * This is documented in docs/api-integration-checklist.md.
 */
export async function getReceivedRequests(): Promise<UserCardResponse[]> {
  try {
    const response = await apiClient.get<UserCardResponse[]>(
      API_PATHS.CONNECTIONS.RECEIVED,
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

/**
 * Accept or reject a received connection request.
 *
 * @param requestId - The ID of the connection request (from UserCardResponse.id).
 * @param action    - 'ACCEPT' or 'REJECT'.
 */
export async function reviewConnectionRequest(
  requestId: number,
  action: ReviewAction,
): Promise<SuccessResponse> {
  try {
    const response = await apiClient.post<SuccessResponse>(
      API_PATHS.CONNECTIONS.REVIEW(requestId),
      null,
      { params: { action } },
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
}
