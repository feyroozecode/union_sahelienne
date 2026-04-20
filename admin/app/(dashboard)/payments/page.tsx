'use client';

import { useEffect, useState } from 'react';
import { fetchApi, getErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { AdminPayment } from '@/lib/types';
import tableStyles from '@/components/Table.module.css';
import pageStyles from './page.module.css';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    fetchApi<AdminPayment[]>('/admin/payments')
      .then((data) => {
        if (isActive) {
          setPayments(data);
        }
      })
      .catch((error) => {
        if (isActive) {
          setError(getErrorMessage(error, 'Failed to load payments.'));
        }
        console.error('Failed to fetch payments', error);
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
          <h1>Revenue & Payments</h1>
          <p>Subscription and match payment validations</p>
        </div>
      </header>

      <div className={`${tableStyles.tableContainer} animate-fade-in-up stagger-2`}>
        <div className={tableStyles.tableHeader}>
          <div className={tableStyles.tableTitle}>Transaction History</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th className={tableStyles.th}>Transaction ID</th>
                <th className={tableStyles.th}>User</th>
                <th className={tableStyles.th}>Amount</th>
                <th className={tableStyles.th}>Type</th>
                <th className={tableStyles.th}>Status</th>
                <th className={tableStyles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className={tableStyles.td} style={{ textAlign: 'center' }}>
                    Loading payments...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className={tableStyles.td} style={{ textAlign: 'center' }}>
                    {error}
                  </td>
                </tr>
              ) : payments.map((payment) => (
                <tr key={payment.id} className={tableStyles.tr}>
                  <td className={tableStyles.td}>#{payment.id}</td>
                  <td className={tableStyles.td}>User #{payment.userId}</td>
                  <td className={tableStyles.td} style={{ fontWeight: 600 }}>
                    {payment.amount !== null && payment.amount !== undefined
                      ? `CFA ${payment.amount}`
                      : 'N/A'}
                  </td>
                  <td className={tableStyles.td}>{payment.type || 'Subscription'}</td>
                  <td className={tableStyles.td}>
                    {payment.status === 'validated' ? (
                      <span className={`${tableStyles.badge} ${tableStyles.badgeSuccess}`}>Validated</span>
                    ) : payment.status === 'pending' ? (
                      <span className={`${tableStyles.badge} ${tableStyles.badgePending}`}>Pending</span>
                    ) : payment.status === 'rejected' ? (
                      <span className={`${tableStyles.badge} ${tableStyles.badgeDanger}`}>Rejected</span>
                    ) : (
                      <span className={tableStyles.badge} style={{ background: 'var(--bg-tertiary)' }}>{payment.status}</span>
                    )}
                  </td>
                  <td className={tableStyles.td}>
                    {formatDate(payment.createdAt)}
                  </td>
                </tr>
              ))}
              {!loading && payments.length === 0 && (
                <tr>
                  <td colSpan={6} className={tableStyles.td} style={{ textAlign: 'center' }}>
                    No payments found.
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
