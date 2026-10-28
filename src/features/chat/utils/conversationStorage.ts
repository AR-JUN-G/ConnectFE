export interface ConversationSummary {
  userId: number;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

const STORAGE_KEY = 'connect_conversations';

export function getStoredConversations(): ConversationSummary[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function upsertConversation(conv: ConversationSummary): void {
  try {
    const existing = getStoredConversations();
    const filtered = existing.filter((item) => item.userId !== conv.userId);
    const updated = [
      {
        ...conv,
        name: conv.name || `Developer #${conv.userId}`,
      },
      ...filtered,
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
  } catch {
    // Ignore storage quota or disabled localStorage errors
  }
}

export function removeConversation(userId: number): void {
  try {
    const existing = getStoredConversations();
    const filtered = existing.filter((item) => item.userId !== userId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore errors
  }
}
