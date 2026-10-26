import apiClient from '@/api/axiosInstance';
import { handleAxiosError } from '@/api/errorHandler';
import { API_PATHS } from '@/constants/api';
import type { ChatHistoryRequest, ChatMessage, ChatSendRequest } from '@/types';

/**
 * Send a chat message via REST.
 * The backend also delivers it to the recipient via WebSocket.
 * Use the returned ChatMessage (with server-assigned id and createdAt)
 * to update the local conversation state.
 */
export async function sendMessage(data: ChatSendRequest): Promise<ChatMessage> {
  try {
    const response = await apiClient.post<ChatMessage>(API_PATHS.CHAT.SEND, data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

/**
 * Retrieve chat history using cursor-based backward pagination.
 *
 * This GET endpoint accepts a JSON request body (non-standard but valid HTTP).
 * Axios supports this via the `data` field in the request config.
 *
 * Cursor fields:
 *   - omit both for the initial load (returns newest `size` messages)
 *   - provide lastSeenTime + lastSeenId to load messages older than the cursor
 *
 * The response is an array of ChatMessage objects sorted from oldest to newest.
 * If the array length < size, there are no more older messages.
 *
 * @param body  - otherUserId and optional cursor (lastSeenTime, lastSeenId)
 * @param size  - number of messages to return (default: 30)
 */
export async function getChatHistory(
  body: ChatHistoryRequest,
  size: number = 30,
): Promise<ChatMessage[]> {
  try {
    const response = await apiClient.request<ChatMessage[]>({
      method: 'GET',
      url: API_PATHS.CHAT.HISTORY,
      params: { size },
      data: body,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
}
