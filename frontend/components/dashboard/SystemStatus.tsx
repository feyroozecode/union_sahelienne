import React from 'react';
import { Activity, Database, Mail, HardDrive } from 'lucide-react';
import styles from '@/app/(dashboard)/page.module.css';

export const SystemStatus: React.FC = () => {
  return (
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
  );
};
