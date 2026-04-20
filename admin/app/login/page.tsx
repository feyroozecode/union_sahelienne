'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi, getErrorMessage, removeToken, setToken } from '@/lib/api';
import type {
  AdminLoginResponse,
  AdminOtpChallengeResponse,
} from '@/lib/types';
import styles from './page.module.css';

const ADMIN_ROLE_ID = '1';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await fetchApi<
        AdminLoginResponse | AdminOtpChallengeResponse
      >('/auth/email/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if ('requiresOtp' in data) {
        setError(
          `OTP verification is required via ${data.channel}. Complete the OTP flow before using the admin portal.`,
        );
        return;
      }

      if (String(data.user?.role?.id) !== ADMIN_ROLE_ID) {
        removeToken();
        setError('This account does not have admin access.');
        return;
      }

      if (data.token) {
        setToken(data.token);
        router.push('/');
      } else {
        throw new Error('No token returned');
      }
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          'Login failed. Please check your credentials.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form className={`${styles.loginCard} animate-fade-in-up`} onSubmit={handleLogin}>
        <div className={styles.brand}>
          <h1>Union Sahelienne</h1>
          <p>Administration Portal</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={`${styles.formGroup} stagger-1`}>
          <label className={styles.label} htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            className={styles.input}
            placeholder="admin@union-sahelienne.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={`${styles.formGroup} stagger-2`}>
          <label className={styles.label} htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className={styles.input}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          className={`${styles.submitBtn} stagger-3`}
          disabled={loading}
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
