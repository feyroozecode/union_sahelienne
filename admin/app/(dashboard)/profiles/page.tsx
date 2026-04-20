'use client';

import { useEffect, useState } from 'react';
import { fetchApi, getErrorMessage } from '@/lib/api';
import { formatLocation, formatUserLabel } from '@/lib/format';
import type { AdminProfile } from '@/lib/types';
import tableStyles from '@/components/Table.module.css';
import pageStyles from './page.module.css';

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    fetchApi<AdminProfile[]>('/admin/profiles')
      .then((data) => {
        if (isActive) {
          setProfiles(data);
        }
      })
      .catch((error) => {
        if (isActive) {
          setError(getErrorMessage(error, 'Failed to load profiles.'));
        }
        console.error('Failed to fetch profiles', error);
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

  const handleVerify = async (id: number) => {
    setVerifying(id);
    try {
      await fetchApi(`/admin/profiles/${id}/verify-identity`, {
        method: 'PATCH',
      });
      setProfiles((currentProfiles) =>
        currentProfiles.map((profile) =>
          profile.id === id
            ? { ...profile, isIdentityVerified: true }
            : profile,
        ),
      );
    } catch (error) {
      setError(
        getErrorMessage(error, 'Failed to verify this profile.'),
      );
      console.error(error);
    } finally {
      setVerifying(null);
    }
  };

  return (
    <>
      <header className={`${pageStyles.header} animate-fade-in-up stagger-1`}>
        <div>
          <h1>User Profiles</h1>
          <p>Review and verify user profiles</p>
        </div>
      </header>

      <div className={`${tableStyles.tableContainer} animate-fade-in-up stagger-2`}>
        <div className={tableStyles.tableHeader}>
          <div className={tableStyles.tableTitle}>All Profiles</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th className={tableStyles.th}>ID</th>
                <th className={tableStyles.th}>Member</th>
                <th className={tableStyles.th}>Location</th>
                <th className={tableStyles.th}>Gender</th>
                <th className={tableStyles.th}>Identity</th>
                <th className={tableStyles.th}>Status</th>
                <th className={tableStyles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className={tableStyles.td} style={{ textAlign: 'center' }}>
                    Loading profiles...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className={tableStyles.td} style={{ textAlign: 'center' }}>
                    {error}
                  </td>
                </tr>
              ) : profiles.map((profile) => (
                <tr key={profile.id} className={tableStyles.tr}>
                  <td className={tableStyles.td}>#{profile.id}</td>
                  <td className={tableStyles.td}>
                    {formatUserLabel(profile.user, `User #${profile.userId}`)}
                  </td>
                  <td className={tableStyles.td}>
                    {formatLocation(profile.city, profile.country)}
                  </td>
                  <td className={tableStyles.td} style={{ textTransform: 'capitalize' }}>{profile.gender}</td>
                  <td className={tableStyles.td}>
                    {profile.isIdentityVerified ? (
                      <span className={`${tableStyles.badge} ${tableStyles.badgeSuccess}`}>Verified</span>
                    ) : (
                      <span className={`${tableStyles.badge} ${tableStyles.badgePending}`}>Unverified</span>
                    )}
                  </td>
                  <td className={tableStyles.td}>
                    {profile.isValidated ? (
                      <span className={`${tableStyles.badge} ${tableStyles.badgeSuccess}`}>Validated</span>
                    ) : (
                      <span className={`${tableStyles.badge} ${tableStyles.badgeDanger}`}>Not Validated</span>
                    )}
                  </td>
                  <td className={tableStyles.td}>
                    {!profile.isIdentityVerified && (
                      <button 
                        className={tableStyles.actionBtn}
                        onClick={() => handleVerify(profile.id)}
                        disabled={verifying === profile.id}
                      >
                        {verifying === profile.id ? 'Verifying...' : 'Verify Identity'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && profiles.length === 0 && (
                <tr>
                  <td colSpan={7} className={tableStyles.td} style={{ textAlign: 'center' }}>
                    No profiles found.
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
