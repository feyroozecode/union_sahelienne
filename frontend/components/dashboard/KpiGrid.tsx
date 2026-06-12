import React from 'react';
import { Users, Link2, CreditCard, ShieldAlert, Heart, CheckCircle } from 'lucide-react';
import styles from '@/app/(dashboard)/page.module.css';

interface KpiGridProps {
  kpis: {
    totalUsers: number;
    totalMatches: number;
    pendingPaymentsCount: number;
    unverifiedIdentities: number;
    activeMatches: number;
    validatedProfiles: number;
  };
}

export const KpiGrid: React.FC<KpiGridProps> = ({ kpis }) => {
  const cards = [
    { 
      title: 'Total Users', 
      value: kpis.totalUsers, 
      trend: 'Active on platform', 
      icon: Users, 
      accent: styles.accentTerracotta 
    },
    { 
      title: 'Total Matches', 
      value: kpis.totalMatches, 
      trend: `${kpis.activeMatches} Currently Active`, 
      icon: Heart, 
      accent: styles.accentOchre 
    },
    { 
      title: 'Pending Payments', 
      value: kpis.pendingPaymentsCount, 
      trend: 'Awaiting validation', 
      icon: CreditCard, 
      accent: styles.accentGolden 
    },
    { 
      title: 'Verified Profiles', 
      value: kpis.validatedProfiles, 
      trend: 'Fully vetted users', 
      icon: CheckCircle, 
      accent: styles.accentSuccess 
    },
    { 
      title: 'Unverified IDs', 
      value: kpis.unverifiedIdentities, 
      trend: 'Verification required', 
      icon: ShieldAlert, 
      accent: styles.accentAlert 
    },
  ];

  return (
    <div className={styles.kpiGrid}>
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div 
            key={card.title} 
            className={`${styles.kpiCard} ${card.accent} animate-fade-in-up`}
            style={{ animationDelay: `${0.1 * (idx + 1)}s` }}
          >
            <div className={styles.kpiHeader}>
              <div className={styles.kpiTitle}>{card.title}</div>
              <Icon size={18} className={styles.kpiIcon} />
            </div>
            <div className={styles.kpiValue}>{card.value.toLocaleString()}</div>
            <div className={styles.kpiTrend}>{card.trend}</div>
          </div>
        );
      })}
    </div>
  );
};
