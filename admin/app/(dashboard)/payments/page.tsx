'use client';

import { useEffect, useState } from 'react';
import { fetchApi, getErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { useIsMobile } from '@/hooks/useMediaQuery';
import type { AdminPayment } from '@/lib/types';
import tableStyles from '@/components/Table.module.css';
import pageStyles from './page.module.css';

export default function PaymentsPage() {
  const isMobile = useIsMobile();
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);
  const [actionType, setActionType] = useState<'validate' | 'reject' | null>(null);

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

  const handleOpenValidateModal = (payment: AdminPayment) => {
    setSelectedPayment(payment);
    setActionType('validate');
    setConfirmModal(true);
    setOpenDropdown(null);
  };

  const handleOpenRejectModal = (payment: AdminPayment) => {
    setSelectedPayment(payment);
    setActionType('reject');
    setConfirmModal(true);
    setOpenDropdown(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedPayment || !actionType) return;

    try {
      const newStatus = actionType === 'validate' ? 'validated' : 'rejected';
      await fetchApi(`/admin/payments/${selectedPayment.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === selectedPayment.id
            ? { ...payment, status: newStatus }
            : payment
        )
      );
      setConfirmModal(false);
      setSelectedPayment(null);
      setActionType(null);
    } catch (err) {
      console.error('Failed to update payment status:', err);
      setError(getErrorMessage(err, 'Failed to update payment status.'));
    }
  };

  const handleCancelAction = () => {
    setConfirmModal(false);
    setSelectedPayment(null);
    setActionType(null);
  };

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
                  Loading payments...
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                  {error}
                </div>
              ) : payments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                  No payments found.
                </div>
              ) : (
                payments.map((payment) => (
                  <div
                    key={payment.id}
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
                          Transaction ID: #{payment.id}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          CFA {payment.amount || 'N/A'}
                        </div>
                      </div>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === payment.id ? null : payment.id)}
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
                      <div><strong>User:</strong> User #{payment.userId}</div>
                      <div><strong>Type:</strong> {payment.type || 'Subscription'}</div>
                      <div>
                        <strong>Status:</strong>{' '}
                        {payment.status === 'validated' ? (
                          <span style={{ color: 'var(--color-success)' }}>Validated</span>
                        ) : payment.status === 'pending' ? (
                          <span style={{ color: 'var(--color-warning)' }}>Pending</span>
                        ) : payment.status === 'rejected' ? (
                          <span style={{ color: 'var(--color-danger)' }}>Rejected</span>
                        ) : (
                          <span>{payment.status}</span>
                        )}
                      </div>
                      <div><strong>Date:</strong> {formatDate(payment.createdAt)}</div>
                    </div>

                    {/* Mobile Dropdown Menu */}
                    {openDropdown === payment.id && (
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
                          onClick={() => handleOpenValidateModal(payment)}
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
                          Valider
                        </button>
                        <button
                          onClick={() => handleOpenRejectModal(payment)}
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
                          Rejeter
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            // Desktop Table View
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th className={tableStyles.th}>Transaction ID</th>
                  <th className={tableStyles.th}>User</th>
                  <th className={tableStyles.th}>Amount</th>
                  <th className={tableStyles.th}>Type</th>
                  <th className={tableStyles.th}>Status</th>
                  <th className={tableStyles.th}>Date</th>
                  <th className={tableStyles.th} style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className={tableStyles.td} style={{ textAlign: 'center' }}>
                      Loading payments...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className={tableStyles.td} style={{ textAlign: 'center' }}>
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
                    <td className={tableStyles.td} style={{ textAlign: 'center', position: 'relative' }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                          onClick={() => setOpenDropdown(openDropdown === payment.id ? null : payment.id)}
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

                        {/* Dropdown Menu */}
                        {openDropdown === payment.id && (
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
                            {/* Validate Option */}
                            <button
                              onClick={() => handleOpenValidateModal(payment)}
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
                                borderBottom: `1px solid var(--border-color)`,
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = 'transparent')
                              }
                            >
                              Valider
                            </button>

                            {/* Reject Option */}
                            <button
                              onClick={() => handleOpenRejectModal(payment)}
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
                              Rejeter
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && payments.length === 0 && (
                  <tr>
                    <td colSpan={7} className={tableStyles.td} style={{ textAlign: 'center' }}>
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && selectedPayment && (
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
          onClick={() => handleCancelAction()}
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
              {actionType === 'validate' ? 'Confirmer la Validation' : 'Confirmer le Rejet'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px', fontSize: isMobile ? '13px' : '14px' }}>
              {actionType === 'validate'
                ? 'Êtes-vous sûr de vouloir valider ce paiement ?'
                : 'Êtes-vous sûr de vouloir rejeter ce paiement ?'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong>ID:</strong> #{selectedPayment.id}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong>Utilisateur:</strong> User #{selectedPayment.userId}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong>Montant:</strong> CFA {selectedPayment.amount || 'N/A'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong>Type:</strong> {selectedPayment.type || 'Subscription'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong>Date:</strong> {formatDate(selectedPayment.createdAt)}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: isMobile ? '8px' : '12px', justifyContent: 'flex-end', flexDirection: isMobile ? 'column-reverse' : 'row' }}>
              <button
                type="button"
                onClick={() => handleCancelAction()}
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
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleConfirmAction()}
                style={{
                  padding: isMobile ? '12px 16px' : '10px 20px',
                  backgroundColor: actionType === 'validate' ? 'var(--accent-primary)' : 'var(--color-danger)',
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
                  e.currentTarget.style.backgroundColor = actionType === 'validate' ? 'var(--color-terracotta-light)' : 'var(--color-danger-dark)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = actionType === 'validate' ? 'var(--accent-primary)' : 'var(--color-danger)';
                }}
              >
                {actionType === 'validate' ? 'Valider' : 'Rejeter'}
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
