'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi, getErrorMessage } from '@/lib/api';
import type { AdminDashboardResponse } from '@/lib/types';
import styles from './page.module.css';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Link2, User, CreditCard, Settings, Activity, Database, Mail, HardDrive } from 'lucide-react';

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
          <div className={styles.kpiTrend}>Active on platform</div>
        </div>
        <div className={`${styles.kpiCard} ${styles.accentOchre}`}>
          <div className={styles.kpiTitle}>Total Matches</div>
          <div className={styles.kpiValue}>{kpis.totalMatches}</div>
          <div className={styles.kpiTrend}>Connections made</div>
        </div>
        <div className={`${styles.kpiCard} ${styles.accentGolden}`}>
          <div className={styles.kpiTitle}>Pending Payments</div>
          <div className={styles.kpiValue}>{kpis.pendingPaymentsCount}</div>
          <div className={styles.kpiTrend}>Awaiting processing</div>
        </div>
        <div className={`${styles.kpiCard} ${styles.accentAlert}`}>
          <div className={styles.kpiTitle}>Unverified Identities</div>
          <div className={styles.kpiValue}>{kpis.unverifiedIdentities}</div>
          <div className={styles.kpiTrend}>Require attention</div>
        </div>
      </div>

      {/* Quick Access Section */}
      <section className={`${styles.quickAccessSection} animate-fade-in-up stagger-3`}>
        <h2 className={styles.sectionTitle}>Quick Access</h2>
        <div className={styles.quickAccessCardsGrid}>
          {/* Users Card */}
          <div className={`${styles.quickAccessMainCard} ${styles.cardUsers}`}>
            <div className={styles.cardHeader}>
              <Users className={styles.cardIcon} size={28} strokeWidth={1.5} />
              <div>
                <h3 className={styles.cardTitle}>Users</h3>
                <p className={styles.cardDescription}>Manage user accounts</p>
              </div>
            </div>
            <div className={styles.recentList}>
              {data?.recentUsers && data.recentUsers.length > 0 ? (
                data.recentUsers.map((user) => (
                  <div key={user.id} className={styles.recentItem}>
                    <div className={styles.recentItemName}>{user.name}</div>
                    <div className={styles.recentItemMeta}>{user.email}</div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>No recent users</div>
              )}
            </div>
            <button
              onClick={() => router.push('/users')}
              className={styles.viewAllBtn}
            >
              View All Users →
            </button>
          </div>

          {/* Matches Card */}
          <div className={`${styles.quickAccessMainCard} ${styles.cardMatches}`}>
            <div className={styles.cardHeader}>
              <Link2 className={styles.cardIcon} size={28} strokeWidth={1.5} />
              <div>
                <h3 className={styles.cardTitle}>Matches</h3>
                <p className={styles.cardDescription}>View all connections</p>
              </div>
            </div>
            <div className={styles.recentList}>
              {data?.recentMatches && data.recentMatches.length > 0 ? (
                data.recentMatches.map((match) => (
                  <div key={match.id} className={styles.recentItem}>
                    <div className={styles.recentItemName}>Match #{match.id}</div>
                    <div className={`${styles.recentItemMeta} ${styles.statusBadge}`}>
                      <span className={`${styles.statusDot} ${styles[`status-${match.status}`]}`}></span>
                      {match.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>No recent matches</div>
              )}
            </div>
            <button
              onClick={() => router.push('/matches')}
              className={styles.viewAllBtn}
            >
              View All Matches →
            </button>
          </div>

          {/* Profiles Card */}
          <div className={`${styles.quickAccessMainCard} ${styles.cardProfiles}`}>
            <div className={styles.cardHeader}>
              <User className={styles.cardIcon} size={28} strokeWidth={1.5} />
              <div>
                <h3 className={styles.cardTitle}>Profiles</h3>
                <p className={styles.cardDescription}>Manage user profiles</p>
              </div>
            </div>
            <div className={styles.recentList}>
              {data?.recentProfiles && data.recentProfiles.length > 0 ? (
                data.recentProfiles.map((profile) => (
                  <div key={profile.id} className={styles.recentItem}>
                    <div className={styles.recentItemName}>Profile #{profile.id}</div>
                    <div className={styles.recentItemMeta}>
                      {profile.gender} • {profile.country || 'Unknown'}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>No recent profiles</div>
              )}
            </div>
            <button
              onClick={() => router.push('/profiles')}
              className={styles.viewAllBtn}
            >
              View All Profiles →
            </button>
          </div>

          {/* Payments Card */}
          <div className={`${styles.quickAccessMainCard} ${styles.cardPayments}`}>
            <div className={styles.cardHeader}>
              <CreditCard className={styles.cardIcon} size={28} strokeWidth={1.5} />
              <div>
                <h3 className={styles.cardTitle}>Payments</h3>
                <p className={styles.cardDescription}>Process transactions</p>
              </div>
            </div>
            <div className={styles.recentList}>
              {data?.recentPayments && data.recentPayments.length > 0 ? (
                data.recentPayments.map((payment) => (
                  <div key={payment.id} className={styles.recentItem}>
                    <div className={styles.recentItemName}>
                      {payment.amount ? `${payment.amount.toLocaleString()} ${payment.type}` : payment.type}
                    </div>
                    <div className={`${styles.recentItemMeta} ${styles.statusBadge}`}>
                      <span className={`${styles.statusDot} ${styles[`status-${payment.status}`]}`}></span>
                      {payment.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>No recent payments</div>
              )}
            </div>
            <button
              onClick={() => router.push('/payments')}
              className={styles.viewAllBtn}
            >
              View All Payments →
            </button>
          </div>

          {/* Admins Card */}
          <div className={`${styles.quickAccessMainCard} ${styles.cardAdmins}`}>
            <div className={styles.cardHeader}>
              <Settings className={styles.cardIcon} size={28} strokeWidth={1.5} />
              <div>
                <h3 className={styles.cardTitle}>Admins</h3>
                <p className={styles.cardDescription}>Manage admin accounts</p>
              </div>
            </div>
            <div className={styles.recentList}>
              <div className={styles.emptyState}>No recent admins</div>
            </div>
            <button
              onClick={() => router.push('/admins')}
              className={styles.viewAllBtn}
            >
              View All Admins →
            </button>
          </div>
        </div>
      </section>

      <div className={`${styles.chartContainer} animate-fade-in-up stagger-4`}>
        <div className={styles.chartHeader}>
          <h2>Registration Trends</h2>
          <p className={styles.chartSubtitle}>7-day registration activity</p>
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

      {/* Platform Health Section */}
      <section className={`${styles.healthSection} animate-fade-in-up stagger-5`}>
        <h2 className={styles.sectionTitle}>System Status</h2>
        <div className={styles.healthGrid}>
          <div className={`${styles.healthCard} ${styles.healthGood}`}>
            <Activity className={styles.healthIconComponent} size={20} strokeWidth={2} />
            <div className={styles.healthInfo}>
              <div className={styles.healthLabel}>API Server</div>
              <div className={styles.healthStatus}>Operational</div>
            </div>
          </div>
          <div className={`${styles.healthCard} ${styles.healthGood}`}>
            <Database className={styles.healthIconComponent} size={20} strokeWidth={2} />
            <div className={styles.healthInfo}>
              <div className={styles.healthLabel}>Database</div>
              <div className={styles.healthStatus}>Connected</div>
            </div>
          </div>
          <div className={`${styles.healthCard} ${styles.healthGood}`}>
            <Mail className={styles.healthIconComponent} size={20} strokeWidth={2} />
            <div className={styles.healthInfo}>
              <div className={styles.healthLabel}>Mail Service</div>
              <div className={styles.healthStatus}>Running</div>
            </div>
          </div>
          <div className={`${styles.healthCard} ${styles.healthGood}`}>
            <HardDrive className={styles.healthIconComponent} size={20} strokeWidth={2} />
            <div className={styles.healthInfo}>
              <div className={styles.healthLabel}>File Storage</div>
              <div className={styles.healthStatus}>Available</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
