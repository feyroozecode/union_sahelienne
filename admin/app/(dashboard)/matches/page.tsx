'use client';

import { useEffect, useState } from 'react';
import { fetchApi, getErrorMessage } from '@/lib/api';
import { formatDate, formatUserLabel } from '@/lib/format';
import type { AdminMatch } from '@/lib/types';
import { useIsMobile } from '@/hooks/useMediaQuery';
import tableStyles from '@/components/Table.module.css';
import pageStyles from './page.module.css';

export default function MatchesPage() {
  const isMobile = useIsMobile();
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    fetchApi<AdminMatch[]>('/admin/matches')
      .then((data) => {
        if (isActive) {
          setMatches(data);
        }
      })
      .catch((error) => {
        if (isActive) {
          setError(getErrorMessage(error, 'Failed to load matches.'));
        }
        console.error('Failed to fetch matches', error);
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
          <h1>Match Pipeline</h1>
          <p>Monitor connecting user relationships</p>
        </div>
      </header>

      <div className={`${tableStyles.tableContainer} animate-fade-in-up stagger-2`}>
        <div className={tableStyles.tableHeader}>
          <div className={tableStyles.tableTitle}>All Matches</div>
        </div>
        <div style={{ overflowX: isMobile ? 'hidden' : 'auto' }}>
          {isMobile ? (
            // Mobile Card View
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '12px',
                padding: '12px',
              }}
            >
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                  Loading matches...
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                  {error}
                </div>
              ) : matches.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                  No matches found.
                </div>
              ) : (
                matches.map((match) => (
                  <div
                    key={match.id}
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Match ID: #{match.id}
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>
                        <strong>Requester:</strong> {formatUserLabel(match.requester, `User #${match.requesterId}`)}
                      </div>
                      <div>
                        <strong>Target:</strong> {formatUserLabel(match.target, `User #${match.targetId}`)}
                      </div>
                      <div>
                        <strong>Status:</strong>{' '}
                        {match.status === 'accepted' ? (
                          <span style={{ color: 'var(--color-success)' }}>Accepted</span>
                        ) : match.status === 'pending' ? (
                          <span style={{ color: 'var(--color-warning)' }}>Pending</span>
                        ) : match.status === 'rejected' ? (
                          <span style={{ color: 'var(--color-danger)' }}>Rejected</span>
                        ) : (
                          <span>{match.status}</span>
                        )}
                      </div>
                      <div><strong>Created:</strong> {formatDate(match.createdAt)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Desktop Table View
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th className={tableStyles.th}>ID</th>
                  <th className={tableStyles.th}>Requester</th>
                  <th className={tableStyles.th}>Target</th>
                  <th className={tableStyles.th}>Status</th>
                  <th className={tableStyles.th}>Created At</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className={tableStyles.td} style={{ textAlign: 'center' }}>
                      Loading matches...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className={tableStyles.td} style={{ textAlign: 'center' }}>
                      {error}
                    </td>
                  </tr>
                ) : matches.map((match) => (
                  <tr key={match.id} className={tableStyles.tr}>
                    <td className={tableStyles.td}>#{match.id}</td>
                    <td className={tableStyles.td}>
                      {formatUserLabel(match.requester, `User #${match.requesterId}`)}
                    </td>
                    <td className={tableStyles.td}>
                      {formatUserLabel(match.target, `User #${match.targetId}`)}
                    </td>
                    <td className={tableStyles.td}>
                      {match.status === 'accepted' ? (
                        <span className={`${tableStyles.badge} ${tableStyles.badgeSuccess}`}>Accepted</span>
                      ) : match.status === 'pending' ? (
                        <span className={`${tableStyles.badge} ${tableStyles.badgePending}`}>Pending</span>
                      ) : match.status === 'rejected' ? (
                        <span className={`${tableStyles.badge} ${tableStyles.badgeDanger}`}>Rejected</span>
                      ) : (
                        <span className={tableStyles.badge} style={{ background: 'var(--bg-tertiary)' }}>{match.status}</span>
                      )}
                    </td>
                    <td className={tableStyles.td}>
                      {formatDate(match.createdAt)}
                    </td>
                  </tr>
                ))}
                {!loading && matches.length === 0 && (
                  <tr>
                    <td colSpan={5} className={tableStyles.td} style={{ textAlign: 'center' }}>
                      No matches found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
