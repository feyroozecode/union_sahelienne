'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi, getErrorMessage } from '@/lib/api';
import type { AdminDashboardResponse } from '@/lib/types';
import styles from './page.module.css';
import { KpiGrid } from '@/components/dashboard/KpiGrid';
import { QuickAccess } from '@/components/dashboard/QuickAccess';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { SystemStatus } from '@/components/dashboard/SystemStatus';
import { GenderPieChart } from '@/components/dashboard/GenderPieChart';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    let isActive = true;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    fetchApi<AdminDashboardResponse>('/admin/dashboard')
      .then((response) => {
        if (!isActive) return;
        setData(response);
        setError(null);
      })
      .catch((error) => {
        if (!isActive) return;
        const message = getErrorMessage(error, 'Unable to load the dashboard right now.');
        setError(message);
        console.error('Failed to load dashboard stats', error);

        retryTimer = setTimeout(() => {
          if (isActive) {
            setLoading(true);
            setRequestKey((current) => current + 1);
          }
        }, 3000);
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [requestKey]);

  if (loading) {
    return (
      <div className={styles.loadingPlaceholder}>
        <div className={styles.loader}></div>
        <span>Initializing Dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.loadingPlaceholder}>
        <div style={{ textAlign: 'center' }}>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setRequestKey((current) => current + 1);
            }}
            className={styles.retryBtn}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!data?.kpis) {
    return <div className={styles.loadingPlaceholder}>No dashboard data is available yet.</div>;
  }

  const { kpis, recentRegistrations } = data;

  return (
    <div className={styles.dashboardContainer}>
      <header className={`${styles.header} animate-fade-in-up stagger-1`}>
        <div>
          <h1>Platform Overview</h1>
          <p>Real-time metrics and system performance across Union Sahelienne</p>
        </div>
      </header>

      <KpiGrid kpis={{
        totalUsers: kpis.totalUsers,
        totalMatches: kpis.totalMatches,
        pendingPaymentsCount: kpis.pendingPaymentsCount,
        unverifiedIdentities: kpis.unverifiedIdentities,
        activeMatches: kpis.activeMatches,
        validatedProfiles: kpis.validatedProfiles
      }} />

      <div className={`${styles.chartsGrid} animate-fade-in-up stagger-3`}>
        <TrendChart data={recentRegistrations} />
        <GenderPieChart male={kpis.totalMaleUsers} female={kpis.totalFemaleUsers} />
      </div>

      <QuickAccess data={data} />

      <SystemStatus />
    </div>
  );
}
