'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { removeToken } from '@/lib/api';
import styles from './Sidebar.module.css';

const navItems = [
  { href: '/', label: 'Overview' },
  { href: '/profiles', label: 'Profiles' },
  { href: '/matches', label: 'Matches' },
  { href: '/payments', label: 'Payments' },
  { href: '/users', label: 'Users' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span>U<span className={styles.brandAccent}>S</span></span>
        Admin
      </div>
      
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
