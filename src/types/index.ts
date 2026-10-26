// ─── Shared API Types ────────────────────────────────────────────────────────

/** UserCardResponse — returned by feed and received requests endpoints. */
export interface UserCardResponse {
  id: number;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
}

/** Full authenticated-user profile. */
export interface UserProfile {
  status: number;
  message: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl: string;
}

/** Response for login and register. Server also sets the HttpOnly JWT cookie. */
export interface AuthResponse {
  status: number;
  message: string;
  token: string;
}

/** Generic success response used by connection endpoints. */
export interface SuccessResponse {
  status: number;
  message: string;
}

/** Response from PATCH /api/v1/users/profile */
export interface UpdateProfileResponse {
  status: number;
  message: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
}

/** A single chat message. */
export interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string; // ISO 8601 LocalDateTime string
}

// ─── Request Types ────────────────────────────────────────────────────────────

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChatSendRequest {
  receiverId: number;
  content: string;
}

export interface ChatHistoryRequest {
  otherUserId: number;
  lastSeenTime?: string;
  lastSeenId?: number;
}

// ─── Error Response ───────────────────────────────────────────────────────────

export interface ApiErrorResponse {
  status: number;
  error?: string;
  message: string;
  path?: string;
  timestamp?: string;
  validationErrors?: Record<string, string>;
}

// ─── Enums ────────────────────────────────────────────────────────────────────

export type ReviewAction = 'ACCEPT' | 'REJECT';
