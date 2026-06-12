import { fetchApi } from './api';
import { AdminWaitlistUser } from './types';

export function listWaitlisted(
  gender?: 'male' | 'female',
): Promise<AdminWaitlistUser[]> {
  const qs = gender ? `?gender=${gender}` : '';
  return fetchApi<AdminWaitlistUser[]>(`/admin/waitlist${qs}`);
}

export function unblockWaitlisted(
  userId: number,
): Promise<{ success: true; userId: number }> {
  return fetchApi<{ success: true; userId: number }>(
    `/admin/waitlist/${userId}/unblock`,
    { method: 'POST' },
  );
}
