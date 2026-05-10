'use client';

import { useEffect, useState } from 'react';
import { fetchApi, getErrorMessage } from '@/lib/api';
import { formatLocation, formatUserLabel } from '@/lib/format';
import { useIsMobile } from '@/hooks/useMediaQuery';
import type { AdminProfile } from '@/lib/types';
import tableStyles from '@/components/Table.module.css';
import pageStyles from './page.module.css';

export default function ProfilesPage() {
  const isMobile = useIsMobile();

  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<AdminProfile | null>(null);

  useEffect(() => {
    let isActive = true;

    fetchApi<AdminProfile[]>('/admin/profiles')
      .then((data) => {
        if (isActive) setProfiles(data);
      })
      .catch((error) => {
        if (isActive) {
          setError(getErrorMessage(error, 'Failed to load profiles.'));
        }
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleOpenVerifyModal = (profile: AdminProfile) => {
    setSelectedProfile(profile);
    setConfirmModal(true);
    setOpenDropdown(null);
  };

  const handleConfirmVerify = async () => {
    if (!selectedProfile) return;

    try {
      await fetchApi(`/admin/profiles/${selectedProfile.id}/verify-identity`, {
        method: 'PATCH',
      });

      setProfiles((prev) =>
        prev.map((p) =>
          p.id === selectedProfile.id
            ? { ...p, isIdentityVerified: true }
            : p
        )
      );

      setConfirmModal(false);
      setSelectedProfile(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to verify profile.'));
    }
  };

  const handleCancel = () => {
    setConfirmModal(false);
    setSelectedProfile(null);
  };

  return (
    <>
      {/* HEADER */}
      <header className={`${pageStyles.header} animate-fade-in-up stagger-1`}>
        <div>
          <h1>User Profiles</h1>
          <p>Review and verify user profiles</p>
        </div>
      </header>

      {/* TABLE CONTAINER */}
      <div className={`${tableStyles.tableContainer} animate-fade-in-up stagger-2`}>
        <div className={tableStyles.tableHeader}>
          <div className={tableStyles.tableTitle}>All Profiles</div>
        </div>

        <div style={{ overflowX: isMobile ? 'hidden' : 'auto' }}>
          {isMobile ? (
            /* ================= MOBILE VIEW ================= */
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
                  Loading profiles...
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                  {error}
                </div>
              ) : profiles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                  No profiles found.
                </div>
              ) : (
                profiles.map((profile) => (
                  <div
                    key={profile.id}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          Profile ID: #{profile.id}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {formatUserLabel(profile.user, `User #${profile.userId}`)}
                        </div>
                      </div>

                      <button
                        onClick={() => setOpenDropdown(openDropdown === profile.id ? null : profile.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '20px',
                          cursor: 'pointer',
                          color: 'var(--text-primary)',
                          padding: '4px',
                          minWidth: '44px',
                          minHeight: '44px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        ⋯
                      </button>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div><strong>Location:</strong> {formatLocation(profile.city, profile.country)}</div>
                      <div><strong>Gender:</strong> {profile.gender}</div>
                      <div>
                        <strong>Identity:</strong>{' '}
                        {profile.isIdentityVerified ? (
                          <span style={{ color: 'var(--color-success)' }}>Verified</span>
                        ) : (
                          <span style={{ color: 'var(--color-warning)' }}>Unverified</span>
                        )}
                      </div>
                      <div>
                        <strong>Status:</strong>{' '}
                        {profile.isValidated ? (
                          <span style={{ color: 'var(--color-success)' }}>Validated</span>
                        ) : (
                          <span style={{ color: 'var(--color-danger)' }}>Not Validated</span>
                        )}
                      </div>
                    </div>

                    {/* Mobile Dropdown Menu */}
                    {openDropdown === profile.id && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          marginTop: '8px',
                          paddingTop: '8px',
                          borderTop: '1px solid var(--border-color)',
                        }}
                      >
                        <button
                          onClick={() => handleOpenVerifyModal(profile)}
                          style={{
                            padding: '10px 12px',
                            backgroundColor: 'var(--bg-tertiary)',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: 'var(--text-primary)',
                            minHeight: '40px',
                            width: '100%',
                            textAlign: 'left',
                          }}
                        >
                          Verify Identity
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            /* ================= DESKTOP VIEW ================= */
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th className={tableStyles.th}>ID</th>
                  <th className={tableStyles.th}>Member</th>
                  <th className={tableStyles.th}>Location</th>
                  <th className={tableStyles.th}>Gender</th>
                  <th className={tableStyles.th}>Identity</th>
                  <th className={tableStyles.th}>Status</th>
                  <th className={tableStyles.th} style={{ textAlign: 'center' }}>Actions</th>
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
                    <td className={tableStyles.td}>{profile.gender}</td>
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

                    <td className={tableStyles.td} style={{ textAlign: 'center', position: 'relative' }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                          onClick={() => setOpenDropdown(openDropdown === profile.id ? null : profile.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            padding: '4px 8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          title="Menu d'actions"
                        >
                          ⋯
                        </button>

                        {openDropdown === profile.id && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '100%',
                              right: 0,
                              marginTop: '4px',
                              backgroundColor: 'var(--bg-secondary)',
                              border: `1px solid var(--border-color)`,
                              borderRadius: 'var(--radius-sm)',
                              boxShadow: 'var(--shadow-lg)',
                              zIndex: 100,
                              minWidth: '180px',
                              animation: 'slideDown 0.2s ease-out',
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleOpenVerifyModal(profile)}
                              style={{
                                display: 'block',
                                width: '100%',
                                padding: '12px 16px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: 'var(--text-primary)',
                                transition: 'background-color 0.2s',
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = 'transparent')
                              }
                            >
                              Verify Identity
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && selectedProfile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(17, 17, 17, 0.7)',
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease-out',
            padding: isMobile ? '0' : '16px',
          }}
          onClick={handleCancel}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              padding: isMobile ? '24px' : '32px',
              borderRadius: isMobile ? 'var(--radius-lg) var(--radius-lg) 0 0' : 'var(--radius-lg)',
              maxWidth: '500px',
              width: isMobile ? '100%' : '90%',
              boxShadow: 'var(--shadow-lg)',
              border: isMobile ? 'none' : `1px solid var(--border-color)`,
              animation: isMobile ? 'slideUp 0.3s ease-out' : 'slideUp 0.3s ease-out',
              maxHeight: isMobile ? '90vh' : 'auto',
              overflowY: isMobile ? 'auto' : 'visible',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: isMobile ? '1.2rem' : '1.5rem' }}>
              Confirm Verification
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px', fontSize: isMobile ? '13px' : '14px' }}>
              Are you sure you want to verify this profile?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong>ID:</strong> #{selectedProfile.id}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong>User:</strong> {formatUserLabel(selectedProfile.user, `User #${selectedProfile.userId}`)}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong>Location:</strong> {formatLocation(selectedProfile.city, selectedProfile.country)}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong>Gender:</strong> {selectedProfile.gender}
              </div>
            </div>

            <div style={{ display: 'flex', gap: isMobile ? '8px' : '12px', justifyContent: 'flex-end', flexDirection: isMobile ? 'column-reverse' : 'row' }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: isMobile ? '12px 16px' : '10px 20px',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: `1px solid var(--border-color)`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  minHeight: isMobile ? '44px' : 'auto',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVerify}
                style={{
                  padding: isMobile ? '12px 16px' : '10px 20px',
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--text-primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'background-color 0.2s',
                  minHeight: isMobile ? '44px' : 'auto',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-terracotta-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                }}
              >
                Confirm
              </button>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }

            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}