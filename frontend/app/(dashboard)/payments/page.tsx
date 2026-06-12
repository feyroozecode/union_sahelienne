'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchApi, getErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { useIsMobile } from '@/hooks/useMediaQuery';
import type { AdminPayment } from '@/lib/types';
import { ResponsiveTable, type ResponsiveTableColumn } from '@/components/ResponsiveTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MoreHorizontal } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { CheckCircle, XCircle } from 'lucide-react';
import styles from './page.module.css';

export default function PaymentsPage() {
  const isMobile = useIsMobile();
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);
  const [actionType, setActionType] = useState<'validate' | 'reject' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApi<AdminPayment[]>('/admin/payments');
      setPayments(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load payments.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleOpenActionModal = (payment: AdminPayment, type: 'validate' | 'reject') => {
    setSelectedPayment(payment);
    setActionType(type);
    setConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedPayment || !actionType) return;
    setSubmitting(true);
    try {
      const newStatus = actionType === 'validate' ? 'validated' : 'rejected';
      await fetchApi(`/admin/payments/${selectedPayment.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === selectedPayment.id ? { ...payment, status: newStatus } : payment
        )
      );
      setConfirmModal(false);
      setSelectedPayment(null);
      setActionType(null);
    } catch (err) {
      console.error('Failed to update payment status:', err);
      // Add toast feedback here
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ResponsiveTableColumn<AdminPayment>[] = [
    { key: 'id', label: 'Transaction ID', render: (val) => `#${val}` },
    { key: 'userId', label: 'User', render: (val) => `User #${val}` },
    { 
      key: 'amount', 
      label: 'Amount', 
      render: (val) => val ? `CFA ${val.toLocaleString()}` : 'N/A' 
    },
    { key: 'type', label: 'Type', render: (val) => val || 'Subscription' },
    { 
      key: 'status', 
      label: 'Status', 
      render: (val) => (
        <Badge 
          variant={
            val === 'validated' ? 'success' : 
            val === 'pending' ? 'warning' : 
            val === 'rejected' ? 'error' : 'neutral'
          }
        >
          {val}
        </Badge>
      )
    },
    { 
      key: 'createdAt', 
      label: 'Date', 
      render: (val) => formatDate(val),
      desktopOnly: true
    },
  ];

  const renderActions = (payment: AdminPayment) => (
    <div style={{ display: 'flex', gap: '8px', justifyContent: isMobile ? 'flex-start' : 'center' }}>
      {payment.status === 'pending' && (
        <>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleOpenActionModal(payment, 'validate')}
            title="Validate"
          >
            <CheckCircle size={16} color="var(--color-success)" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleOpenActionModal(payment, 'reject')}
            title="Reject"
          >
            <XCircle size={16} color="var(--color-danger)" />
          </Button>
        </>
      )}
      <Button variant="ghost" size="sm" onClick={() => console.log('Details', payment.id)} title="View Details">
        <MoreHorizontal size={16} />
      </Button>
    </div>
  );

  return (
    <div className="animate-fade-in-up">
      <header className={styles.header}>
        <div>
          <h1>Revenue & Payments</h1>
          <p>Subscription and match payment validations</p>
        </div>
      </header>

      <ResponsiveTable
        title="Transaction History"
        columns={columns}
        data={payments}
        loading={loading}
        error={error}
        isMobile={isMobile}
        renderRowActions={renderActions}
      />

      <Modal
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        title={actionType === 'validate' ? 'Confirm Validation' : 'Confirm Rejection'}
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Are you sure you want to {actionType === 'validate' ? 'validate' : 'reject'} this payment?
          </p>

          {selectedPayment && (
            <div style={{ 
              padding: '16px', 
              backgroundColor: 'var(--bg-tertiary)', 
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '13px'
            }}>
              <div><strong>Transaction ID:</strong> #{selectedPayment.id}</div>
              <div><strong>User:</strong> User #{selectedPayment.userId}</div>
              <div><strong>Amount:</strong> CFA {selectedPayment.amount?.toLocaleString() || 'N/A'}</div>
              <div><strong>Type:</strong> {selectedPayment.type || 'Subscription'}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <Button variant="secondary" onClick={() => setConfirmModal(false)}>
              Cancel
            </Button>
            <Button 
              variant={actionType === 'validate' ? 'primary' : 'danger'} 
              onClick={handleConfirmAction} 
              isLoading={submitting}
            >
              Confirm {actionType === 'validate' ? 'Validation' : 'Rejection'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
