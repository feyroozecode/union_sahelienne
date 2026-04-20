'use client';

import { useEffect, useState } from 'react';
import { fetchApi, getErrorMessage } from '@/lib/api';
import type { AdminDashboardResponse } from '@/lib/types';
import styles from './page.module.css';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    let isActive = true;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    fetchApi<AdminDashboardResponse>('/admin/dashboard')
      .then((response) => {
        if (!isActive) {
          return;
        }

        setData(response);
        setError(null);
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }

        const message = getErrorMessage(
          error,
          'Unable to load the dashboard right now.',
        );

        setError(message);
        console.error('Failed to load dashboard stats', error);

        // When the backend is still booting, retry automatically so the
        // dashboard recovers without requiring a manual refresh.
        retryTimer = setTimeout(() => {
          if (isActive) {
            setLoading(true);
            setRequestKey((current) => current + 1);
          }
        }, 3000);
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [requestKey]);

  if (loading) {
    return <div className={styles.loadingPlaceholder}>Loading Dashboard...</div>;
  }

  if (error) {
    return (
      <div className={styles.loadingPlaceholder}>
        <div>{error}</div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setRequestKey((current) => current + 1);
          }}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '999px',
            border: '1px solid var(--accent-primary)',
            background: 'transparent',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            font: 'inherit',
          }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!data?.kpis) {
    return <div className={styles.loadingPlaceholder}>No dashboard data is available yet.</div>;
  }

  const { kpis, recentRegistrations } = data;

  return (
    <>
      <header className={`${styles.header} animate-fade-in-up stagger-1`}>
        <div>
          <h1>Overview</h1>
          <p>Union Sahelienne Platform Metrics</p>
        </div>
      </header>

      <div className={`${styles.kpiGrid} animate-fade-in-up stagger-2`}>
        <div className={`${styles.kpiCard} ${styles.accentTerracotta}`}>
          <div className={styles.kpiTitle}>Total Users</div>
          <div className={styles.kpiValue}>{kpis.totalUsers}</div>
        </div>
        <div className={`${styles.kpiCard} ${styles.accentOchre}`}>
          <div className={styles.kpiTitle}>Total Matches</div>
          <div className={styles.kpiValue}>{kpis.totalMatches}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiTitle}>Pending Payments</div>
          <div className={styles.kpiValue}>{kpis.pendingPaymentsCount}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiTitle}>Unverified Identities</div>
          <div className={styles.kpiValue}>{kpis.unverifiedIdentities}</div>
        </div>
      </div>

      <div className={`${styles.chartContainer} animate-fade-in-up stagger-3`}>
        <div className={styles.chartHeader}>
          <h2>Registration Trends</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={recentRegistrations} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-terracotta)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-terracotta)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-onyx-muted)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="var(--text-secondary)" 
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(date) => {
                const d = new Date(date);
                return `${d.getDate()}/${d.getMonth()+1}`;
              }}
            />
            <YAxis 
              stroke="var(--text-secondary)" 
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--bg-secondary)', 
                borderColor: 'var(--color-terracotta)',
                borderRadius: '8px',
                color: 'var(--text-primary)'
              }}
              labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="var(--color-terracotta)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRegistrations)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
