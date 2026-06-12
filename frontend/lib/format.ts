import type { AdminUserSummary } from '@/lib/types';

export function formatDate(value?: string | Date | null) {
  if (!value) {
    return 'N/A';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return 'N/A';
  }

  return parsed.toLocaleDateString();
}

export function formatUserLabel(
  user?: AdminUserSummary | null,
  fallback = 'Unknown user',
) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  return fullName || user?.email || fallback;
}

export function formatLocation(city?: string | null, country?: string | null) {
  const location = [city, country].filter(Boolean).join(', ');

  return location || 'Not provided';
}
