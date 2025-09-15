export const USER_ID_STORAGE_KEY = 'ymp_user_id';

export function getOrCreateUserId(): string {
  if (typeof window === 'undefined') {
    return 'server';
  }

  let userId = localStorage.getItem(USER_ID_STORAGE_KEY);
  if (!userId) {
    userId = `user_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
    localStorage.setItem(USER_ID_STORAGE_KEY, userId);
  }

  return userId;
}
