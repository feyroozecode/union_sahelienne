'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchApi, getErrorMessage } from '@/lib/api';
import { formatLocation, formatUserLabel } from '@/lib/format';
import { useIsMobile } from '@/hooks/useMediaQuery';
import type { AdminProfile } from '@/lib/types';
import { ResponsiveTable, type ResponsiveTableColumn } from '@/components/ResponsiveTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { CheckCircle, Shield } from 'lucide-react';
import styles from './page.module.css';

export default function ProfilesPage() {
  const isMobile = useIsMobile();
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<AdminProfile | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApi<AdminProfile[]>('/admin/profiles');
      setProfiles(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load profiles.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleOpenVerifyModal = (profile: AdminProfile) => {
    setSelectedProfile(profile);
    setConfirmModal(true);
  };

  const handleConfirmVerify = async () => {
    if (!selectedProfile) return;
    setSubmitting(true);
    try {
      await fetchApi(`/admin/profiles/${selectedProfile.id}/verify-identity`, {
        method: 'PATCH',
      });
      setProfiles((prev) =>
        prev.map((p) => (p.id === selectedProfile.id ? { ...p, isIdentityVerified: true } : p))
      );
      setConfirmModal(false);
      setSelectedProfile(null);
    } catch (err) {
      console.error('Failed to verify profile:', err);
      // You could add a toast here
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ResponsiveTableColumn<AdminProfile>[] = [
    { key: 'id', label: 'ID', render: (val) => `#${val}` },
    { 
      key: 'user', 
      label: 'Member', 
      render: (_, profile) => (
        <div style={{ fontWeight: 600 }}>
          {formatUserLabel(profile.user, `User #${profile.userId}`)}
        </div>
      )
    },
    { 
      key: 'location', 
      label: 'Location', 
      render: (_, profile) => formatLocation(profile.city, profile.country) 
    },
    { key: 'gender', label: 'Gender' },
    { 
      key: 'isIdentityVerified', 
      label: 'Identity', 
      render: (val) => (
        <Badge variant={val ? 'success' : 'warning'}>
          {val ? 'Verified' : 'Unverified'}
        </Badge>
      )
    },
    { 
      key: 'isValidated', 
      label: 'Status', 
      render: (val) => (
        <Badge variant={val ? 'success' : 'error'}>
          {val ? 'Validated' : 'Not Validated'}
        </Badge>
      )
    },
  ];

  const renderActions = (profile: AdminProfile) => (
    <div style={{ display: 'flex', gap: '8px', justifyContent: isMobile ? 'flex-start' : 'center' }}>
      {!profile.isIdentityVerified && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleOpenVerifyModal(profile)}
          title="Verify Identity"
        >
          <Shield size={16} color="var(--color-ochre)" />
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={() => console.log('Details', profile.id)} title="View Profile">
        <CheckCircle size={16} />
      </Button>
    </div>
  );

  return (
    <div className="animate-fade-in-up">
      <header className={styles.header}>
        <div>
          <h1>User Profiles</h1>
          <p>Review and verify user profiles</p>
        </div>
      </header>

      <ResponsiveTable
        title="All Profiles"
        columns={columns}
        data={profiles}
        loading={loading}
        error={error}
        isMobile={isMobile}
        renderRowActions={renderActions}
      />

      <Modal
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        title="Confirm Verification"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Are you sure you want to verify this profile's identity?
          </p>

          {selectedProfile && (
            <div style={{ 
              padding: '16px', 
              backgroundColor: 'var(--bg-tertiary)', 
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '13px'
            }}>
              <div><strong>Profile:</strong> #{selectedProfile.id}</div>
              <div><strong>Member:</strong> {formatUserLabel(selectedProfile.user, `User #${selectedProfile.userId}`)}</div>
              <div><strong>Location:</strong> {formatLocation(selectedProfile.city, selectedProfile.country)}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <Button variant="secondary" onClick={() => setConfirmModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmVerify} isLoading={submitting}>
              Confirm Verification
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
