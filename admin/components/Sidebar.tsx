'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { removeToken } from '@/lib/api';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { ThemeToggle } from './ThemeToggle';
import styles from './Sidebar.module.css';

const navItems = [
  { href: '/', label: 'Overview' },
  { href: '/profiles', label: 'Profiles' },
  { href: '/matches', label: 'Matches' },
  { href: '/payments', label: 'Payments' },
  { href: '/users', label: 'Users' },
  { href: '/admins', label: 'Admins' },
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
      {/* Mobile Header with Hamburger */}
      {isMobile && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
            U-<span style={{ color: 'var(--accent-primary)' }}>S</span> Admin
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '44px',
                minHeight: '44px',
              }}
              aria-label="Toggle menu"
            >
              ☰
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 39,
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={styles.sidebar}
        style={
          isMobile
            ? {
                position: 'fixed',
                left: isMobileMenuOpen ? 0 : '-100%',
                top: 0,
                width: '80%',
                height: '100vh',
                zIndex: 50,
                transition: 'left 0.3s ease-in-out',
                boxShadow: isMobileMenuOpen ? 'var(--shadow-lg)' : 'none',
                overflowY: 'auto',
              }
            : {}
        }
      >
        <div className={styles.brand}>
          <span>U<span className={styles.brandAccent}>S</span></span>
          Admin
          <div style={{ marginLeft: 'auto' }}>
            <ThemeToggle />
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={handleNavClick}
                style={
                  isMobile
                    ? {
                        padding: '16px',
                        display: 'block',
                        minHeight: '44px',
                        lineHeight: '1.5',
                      }
                    : {}
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>s
          <button
            onClick={() => {
              handleLogout();
              handleNavClick();
            }}
            className={styles.logoutBtn}
            style={
              isMobile
                ? {
                    width: '100%',
                    padding: '12px 16px',
                    minHeight: '44px',
                  }
                : {}
            }
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
