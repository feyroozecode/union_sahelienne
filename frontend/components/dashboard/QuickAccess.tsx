import React from 'react';
import { useRouter } from 'next/navigation';
import { Users, Link2, User, CreditCard, Settings, Smartphone } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import styles from '@/app/(dashboard)/page.module.css';
import type { AdminDashboardResponse } from '@/lib/types';

interface QuickAccessProps {
  data: AdminDashboardResponse;
}

export const QuickAccess: React.FC<QuickAccessProps> = ({ data }) => {
  const router = useRouter();

  return (
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
            {data.recentUsers && data.recentUsers.length > 0 ? (
              data.recentUsers.map((user) => (
                <div key={user.id} className={styles.recentItem}>
                  <div className={styles.recentItemHeader}>
                    <div className={styles.recentItemName}>{user.name}</div>
                    <Badge variant="info" className={styles.miniBadge}>New</Badge>
                  </div>
                  <div className={styles.recentItemMeta}>
                    <span>{user.email}</span>
                    <span className={styles.metaDivider}>•</span>
                    <span className={styles.lastSeen}>Just now</span>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>No recent users</div>
            )}
          </div>
          <button onClick={() => router.push('/users')} className={styles.viewAllBtn}>
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
            {data.recentMatches && data.recentMatches.length > 0 ? (
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
          <button onClick={() => router.push('/matches')} className={styles.viewAllBtn}>
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
            {data.recentProfiles && data.recentProfiles.length > 0 ? (
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
          <button onClick={() => router.push('/profiles')} className={styles.viewAllBtn}>
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
            {data.recentPayments && data.recentPayments.length > 0 ? (
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
          <button onClick={() => router.push('/payments')} className={styles.viewAllBtn}>
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
          <button onClick={() => router.push('/admins')} className={styles.viewAllBtn}>
            View All Admins →
          </button>
        </div>

        {/* App Config Card */}
        <div className={`${styles.quickAccessMainCard} ${styles.cardConfig}`}>
          <div className={styles.cardHeader}>
            <Smartphone className={styles.cardIcon} size={28} strokeWidth={1.5} />
            <div>
              <h3 className={styles.cardTitle}>App Config</h3>
              <p className={styles.cardDescription}>Mobile app settings</p>
            </div>
          </div>
          <div className={styles.recentList}>
            <div className={styles.recentItem}>
              <div className={styles.recentItemName}>Maintenance Mode</div>
              <div className={styles.recentItemMeta}>Inactive</div>
            </div>
            <div className={styles.recentItem}>
              <div className={styles.recentItemName}>Min Version</div>
              <div className={styles.recentItemMeta}>1.0.4</div>
            </div>
          </div>
          <button onClick={() => router.push('/config')} className={styles.viewAllBtn}>
            Manage Config →
          </button>
        </div>
      </div>
    </section>
  );
};
