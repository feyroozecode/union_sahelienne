'use client';

import { useEffect, useState } from 'react';
import { fetchApi, getErrorMessage } from '@/lib/api';
import { formatDate, formatUserLabel } from '@/lib/format';
import type { AdminUser } from '@/lib/types';
import tableStyles from '@/components/Table.module.css';
import pageStyles from './page.module.css';

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    fetchApi<AdminUser[] | { data?: AdminUser[] }>('/admin/users')
      .then((data) => {
        if (isActive) {
          setUsers(Array.isArray(data) ? data : data.data || []);
        }
      })
      .catch((error) => {
        if (isActive) {
          setError(getErrorMessage(error, 'Failed to load users.'));
        }
        console.error('Failed to fetch users', error);
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <>
      <header className={`${pageStyles.header} animate-fade-in-up stagger-1`}>
        <div>
          <h1>User Directory</h1>
          <p>Global account administration</p>
        </div>
      </header>

      <div className={`${tableStyles.tableContainer} animate-fade-in-up stagger-2`}>
        <div className={tableStyles.tableHeader}>
          <div className={tableStyles.tableTitle}>All Registered Accounts</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th className={tableStyles.th}>ID</th>
                <th className={tableStyles.th}>Name</th>
                <th className={tableStyles.th}>Email</th>
                <th className={tableStyles.th}>Role</th>
                <th className={tableStyles.th}>Provider</th>
                <th className={tableStyles.th}>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className={tableStyles.td} style={{ textAlign: 'center' }}>
                    Loading directory...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className={tableStyles.td} style={{ textAlign: 'center' }}>
                    {error}
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className={tableStyles.tr}>
                  <td className={tableStyles.td}>#{user.id}</td>
                  <td className={tableStyles.td}>
                    {formatUserLabel(user, `User #${user.id}`)}
                  </td>
                  <td className={tableStyles.td}>{user.email || 'No email'}</td>
                  <td className={tableStyles.td}>{user.role?.name || `Role #${user.role?.id ?? 'N/A'}`}</td>
                  <td className={tableStyles.td} style={{ textTransform: 'capitalize' }}>{user.provider || 'Email'}</td>
                  <td className={tableStyles.td}>
                    {formatDate(user.createdAt)}
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className={tableStyles.td} style={{ textAlign: 'center' }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
