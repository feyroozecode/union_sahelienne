'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { removeToken } from '@/lib/api';
import { useIsMobile } from '@/hooks/useMediaQuery';
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Link2,
  CreditCard,
  ShieldCheck,
  LogOut,
  Menu,
  Settings,
  Bell,
  ChevronRight,
  Hourglass,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/profiles', label: 'Profiles', icon: UserCircle },
  { href: '/matches', label: 'Matches', icon: Link2 },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/waitlist', label: 'Waitlist', icon: Hourglass },
  { href: '/admins', label: 'Admins', icon: ShieldCheck },
  { href: '/config', label: 'App Config', icon: Settings },
];

const bottomNavItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  const handleNavClick = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {isMobile && (
        <div className={styles.mobileHeader}>
          <div className={styles.mobileBrand}>
            <span>U<span className={styles.brandAccent}>S</span></span> Admin
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={styles.hamburger}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
        </div>
      )}

      {isMobile && isMobileMenuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
          ${styles.sidebar}
          ${isMobile ? (isMobileMenuOpen ? styles.mobileSidebarOpen : styles.mobileSidebarClosed) : ''}
        `}
      >
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <span>US</span>
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>Union Sahelienne</span>
            <span className={styles.brandSub}>Admin Portal</span>
          </div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>Main</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={handleNavClick}
              >
                <div className={styles.navItemInner}>
                  <Icon size={18} className={styles.navItemIcon} />
                  <span>{item.label}</span>
                </div>
                {isActive && <div className={styles.activeIndicator} />}
              </Link>
            );
          })}

          <div className={styles.navSection} style={{ marginTop: 'var(--space-4)' }}>System</div>
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={handleNavClick}
              >
                <div className={styles.navItemInner}>
                  <Icon size={18} className={styles.navItemIcon} />
                  <span>{item.label}</span>
                </div>
                {isActive && <div className={styles.activeIndicator} />}
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className={styles.userName}>Administrator</div>
              <div className={styles.userRole}>Super Admin</div>
            </div>
          </div>
          <button
            onClick={() => {
              handleLogout();
              handleNavClick();
            }}
            className={styles.logoutBtn}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
