'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  listWaitlisted,
  unblockWaitlisted,
} from '@/lib/waitlist';
import { AdminWaitlistUser } from '@/lib/types';
import { Hourglass, RefreshCw, Unlock, UserX, Filter } from 'lucide-react';
import { ResponsiveTable } from '@/components/ResponsiveTable';
import styles from './page.module.css';

type GenderFilter = 'all' | 'male' | 'female';

export default function WaitlistPage() {
  const [items, setItems] = useState<AdminWaitlistUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<GenderFilter>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listWaitlisted(
        filter === 'all' ? undefined : filter,
      );
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUnblock = async (userId: number) => {
    if (!confirm(`Unblock user #${userId}? They will be marked active.`)) return;
    try {
      await unblockWaitlisted(userId);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unblock failed');
    }
  };

  const totalByGender = items.reduce(
    (acc, u) => {
      const g = u.profile?.gender;
      if (g === 'male') acc.male += 1;
      else if (g === 'female') acc.female += 1;
      return acc;
    },
    { male: 0, female: 0 },
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <Hourglass size={20} /> Waitlist
          </h1>
          <p className={styles.subtitle}>
            Users whose payment was validated but the gender ratio held them back.
          </p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.filterGroup}>
            <Filter size={14} />
            {(['all', 'male', 'female'] as GenderFilter[]).map((g) => (
              <button
                key={g}
                className={`${styles.filterButton} ${filter === g ? styles.filterButtonActive : ''}`}
                onClick={() => setFilter(g)}
              >
                {g}
              </button>
            ))}
          </div>
          <button onClick={load} className={styles.refreshButton} title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      <div className={styles.statRow}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Total waitlisted</span>
          <span className={styles.statValue}>{items.length}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Male</span>
          <span className={styles.statValue}>{totalByGender.male}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Female</span>
          <span className={styles.statValue}>{totalByGender.female}</span>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <UserX size={32} />
          <p>No users on the waitlist.</p>
        </div>
      ) : (
        <ResponsiveTable
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'gender', label: 'Gender' },
            { key: 'position', label: 'Position' },
            { key: 'waitlistedAt', label: 'Since' },
            { key: 'actions', label: '' },
          ]}
          data={items.map((u) => ({
            id: u.id,
            name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || '—',
            email: u.email ?? '—',
            gender: u.profile?.gender ?? '—',
            position: u.position ? `#${u.position}` : '—',
            waitlistedAt: u.waitlistedAt
              ? new Date(u.waitlistedAt).toLocaleString()
              : '—',
            actions: (
              <button
                className={styles.unblockButton}
                onClick={() => handleUnblock(u.id)}
                title="Unblock this user"
              >
                <Unlock size={14} /> Unblock
              </button>
            ),
          }))}
        />
      )}
    </div>
  );
}
