'use client';

import { useEffect, useState } from 'react';
import { fetchApi, getErrorMessage } from '@/lib/api';
import { formatDate, formatUserLabel } from '@/lib/format';
import type { AdminId, AdminUser } from '@/lib/types';
import { useIsMobile } from '@/hooks/useMediaQuery';
import tableStyles from '@/components/Table.module.css';
import pageStyles from './page.module.css';

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
}

export default function AdminsPage() {
  const isMobile = useIsMobile();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<AdminId | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'toggle' | 'modify' | 'detail';
    userId: AdminId;
    currentStatus?: string;
  } | null>(null);

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
          setError(getErrorMessage(error, 'Échec du chargement des utilisateurs.'));
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setSubmitting(true);
    console.log('Submitting form with data:', formData);
    try {
      const response = await fetchApi<AdminUser>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setUsers((prev) => [...prev, response]);
      setFormData({ email: '', firstName: '', lastName: '', phone: '', role: '' });
      setShowModal(false);
    } catch (err) {
      console.error('Failed to create admin:', err);
      setError(getErrorMessage(err, 'Échec de la création de l\'administrateur.'));
    } finally {
      setSubmitting(false);
    }
  };

  const resetModal = () => {
    setFormData({ email: '', firstName: '', lastName: '', phone: '', role: '' });
    setShowModal(false);
  };

  // New action handlers
  const handleToggleStatus = async (userId: AdminId, currentStatus: string) => {
    setConfirmAction({ type: 'toggle', userId, currentStatus });
    setShowConfirmModal(true);
  };

  const handleModify = (userId: AdminId) => {
    setConfirmAction({ type: 'modify', userId });
    setShowConfirmModal(true);
  };

  const handleDetail = (userId: AdminId) => {
    setConfirmAction({ type: 'detail', userId });
    setShowConfirmModal(true);
  };

  const executeAction = async () => {
    if (!confirmAction) return;

    try {
      if (confirmAction.type === 'toggle') {
        const newStatus = confirmAction.currentStatus === 'active' ? 'inactive' : 'active';
        await fetchApi(`/admin/users/${confirmAction.userId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus }),
        });
        setUsers((prev) =>
          prev.map((user) =>
            user.id === confirmAction.userId
              ? { ...user, status: newStatus }
              : user
          )
        );
      } else if (confirmAction.type === 'modify') {
        console.log('Modify admin:', confirmAction.userId);
        // router.push(`/dashboard/admins/${confirmAction.userId}/edit`);
      } else if (confirmAction.type === 'detail') {
        console.log('View detail:', confirmAction.userId);
        // router.push(`/dashboard/admins/${confirmAction.userId}`);
      }
      setOpenDropdown(null);
      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (err) {
      console.error('Failed to execute action:', err);
      setError(getErrorMessage(err, 'Échec de l\'exécution de l\'action.'));
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const getConfirmationMessage = () => {
    if (!confirmAction) return '';
    const user = users.find((u) => u.id === confirmAction.userId);
    const userName = user ? formatUserLabel(user, `Utilisateur #${user.id}`) : `Utilisateur #${confirmAction.userId}`;

    switch (confirmAction.type) {
      case 'toggle':
        const action = confirmAction.currentStatus === 'active' ? 'désactiver' : 'activer';
        return `Êtes-vous sûr de vouloir ${action} ${userName} ?`;
      case 'modify':
        return `Êtes-vous sûr de vouloir modifier ${userName} ?`;
      case 'detail':
        return `Êtes-vous sûr de vouloir voir les détails de ${userName} ?`;
      default:
        return 'Êtes-vous sûr de cette action ?';
    }
  };

  return (
    <>
      <header className={`${pageStyles.header} animate-fade-in-up stagger-1`}>
        <div>
          <h1>Gestion Administrateurs</h1>
          <p>La page de gestion des comptes administrateurs </p>
        </div>
      </header>

      <div className={`${tableStyles.tableContainer} animate-fade-in-up stagger-2`}>
        <div className={tableStyles.tableHeader}>
          <div className={tableStyles.tableTitle}>Tous les Comptes Enregistrés</div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: isMobile ? '8px 12px' : '8px 16px',
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--text-primary)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'background-color 0.2s',
              minHeight: '44px',
              width: isMobile ? '100%' : 'auto',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-terracotta-light)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-primary)')}
          >
            {isMobile ? 'Ajouter' : 'Ajouter Admin'}
          </button>
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
                  Chargement en cours...
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                  {error}
                </div>
              ) : users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                  Aucun utilisateur trouvé.
                </div>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
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
                          ID: #{user.id}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {formatUserLabel(user, `Utilisateur #${user.id}`)}
                        </div>
                      </div>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
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
                      <div><strong>Email:</strong> {user.email || 'N/A'}</div>
                      <div><strong>Rôle:</strong> {user.role?.name || `Rôle #${user.role?.id ?? 'N/A'}`}</div>
                      <div><strong>Fournisseur:</strong> {user.provider || 'Email'}</div>
                      <div><strong>Inscription:</strong> {formatDate(user.createdAt)}</div>
                    </div>

                    {/* Mobile Dropdown Menu */}
                    {openDropdown === user.id && (
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
                          onClick={() => {
                            handleToggleStatus(user.id, user.status || 'active');
                          }}
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
                          {user.status === 'active' ? 'Désactiver' : 'Activer'}
                        </button>
                        <button
                          onClick={() => handleModify(user.id)}
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
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDetail(user.id)}
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
                          Détails
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
                  <th className={tableStyles.th}>ID</th>
                  <th className={tableStyles.th}>Nom</th>
                  <th className={tableStyles.th}>Email</th>
                  <th className={tableStyles.th}>Rôle</th>
                  <th className={tableStyles.th}>Fournisseur</th>
                  <th className={tableStyles.th}>Date d'inscription</th>
                  <th className={tableStyles.th} style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className={tableStyles.td} style={{ textAlign: 'center' }}>
                      Chargement encoure...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className={tableStyles.td} style={{ textAlign: 'center' }}>
                      {error}
                    </td>
                  </tr>
                ) : users.map((user) => (
                  <tr key={user.id} className={tableStyles.tr}>
                    <td className={tableStyles.td}>#{user.id}</td>
                    <td className={tableStyles.td}>
                      {formatUserLabel(user, `Utilisateur #${user.id}`)}
                    </td>
                    <td className={tableStyles.td}>{user.email || 'Aucun email'}</td>
                    <td className={tableStyles.td}>{user.role?.name || `Rôle #${user.role?.id ?? 'N/A'}`}</td>
                    <td className={tableStyles.td} style={{ textTransform: 'capitalize' }}>{user.provider || 'Email'}</td>
                    <td className={tableStyles.td}>
                      {formatDate(user.createdAt)}
                    </td>
                    <td className={tableStyles.td} style={{ textAlign: 'center', position: 'relative' }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                          onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
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
                        {openDropdown === user.id && (
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
                            {/* Active/Desactive Option */}
                            <button
                              onClick={() =>
                                handleToggleStatus(
                                  user.id,
                                  user.status || 'active'
                                )
                              }
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
                              {user.status === 'active' ? 'Désactiver' : 'Activer'}
                            </button>

                            {/* Modify Option */}
                            <button
                              onClick={() => handleModify(user.id)}
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
                             Modifier
                            </button>

                            {/* Detail Option */}
                            <button
                              onClick={() => handleDetail(user.id)}
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
                              Détails
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={7} className={tableStyles.td} style={{ textAlign: 'center' }}>
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(17, 17, 17, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            animation: 'fadeIn 0.3s ease-out',
            padding: '16px',
          }}
          onClick={closeConfirmModal}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              padding: isMobile ? '24px' : '32px',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '400px',
              width: isMobile ? '100%' : '90%',
              boxShadow: 'var(--shadow-lg)',
              border: `1px solid var(--border-color)`,
              animation: 'slideUp 0.3s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: isMobile ? '1.1rem' : '1.3rem' }}>
              Confirmation
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: isMobile ? '13px' : '14px', lineHeight: '1.5' }}>
              {getConfirmationMessage()}
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeConfirmModal}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: `1px solid var(--border-color)`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: isMobile ? '12px' : '13px',
                  color: 'var(--text-primary)',
                  fontWeight: '500',
                  minHeight: '40px',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
              >
                Annuler
              </button>
              <button
                onClick={executeAction}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--accent-primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: isMobile ? '12px' : '13px',
                  color: 'var(--text-primary)',
                  fontWeight: '500',
                  minHeight: '40px',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-terracotta-light)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-primary)')}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form for Adding Admin */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(17, 17, 17, 0.7)',
            display: 'flex',
            alignItems: 'self-start',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease-out',
            padding: '16px',
          }}
          onClick={() => resetModal()}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              padding: isMobile ? '24px' : '32px',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '500px',
              width: isMobile ? '100%' : '90%',
              boxShadow: 'var(--shadow-lg)',
              border: `1px solid var(--border-color)`,
              animation: 'slideUp 0.3s ease-out',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: isMobile ? '1.2rem' : '1.5rem' }}>
              Ajouter un Administrateur
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px', fontSize: isMobile ? '13px' : '14px' }}>
              Veuillez remplir les informations ci-dessous pour créer un nouvel compte administrateur.
            </p>

            <form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    color: 'var(--text-primary)',
                    fontWeight: '500',
                    marginBottom: '6px',
                    fontSize: isMobile ? '13px' : '14px',
                  }}
                >
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px' : '10px 12px',
                    border: `1px solid var(--border-color)`,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: isMobile ? '16px' : '14px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    minHeight: isMobile ? '44px' : 'auto',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.boxShadow = `0 0 0 2px rgba(205, 92, 8, 0.1)`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* First Name Field */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="firstName"
                  style={{
                    display: 'block',
                    color: 'var(--text-primary)',
                    fontWeight: '500',
                    marginBottom: '6px',
                    fontSize: isMobile ? '13px' : '14px',
                  }}
                >
                  Prénom *
                </label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px' : '10px 12px',
                    border: `1px solid var(--border-color)`,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: isMobile ? '16px' : '14px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    minHeight: isMobile ? '44px' : 'auto',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.boxShadow = `0 0 0 2px rgba(205, 92, 8, 0.1)`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Last Name Field */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="lastName"
                  style={{
                    display: 'block',
                    color: 'var(--text-primary)',
                    fontWeight: '500',
                    marginBottom: '6px',
                    fontSize: isMobile ? '13px' : '14px',
                  }}
                >
                  Nom *
                </label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px' : '10px 12px',
                    border: `1px solid var(--border-color)`,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: isMobile ? '16px' : '14px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    minHeight: isMobile ? '44px' : 'auto',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.boxShadow = `0 0 0 2px rgba(205, 92, 8, 0.1)`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Phone Field */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="phone"
                  style={{
                    display: 'block',
                    color: 'var(--text-primary)',
                    fontWeight: '500',
                    marginBottom: '6px',
                    fontSize: isMobile ? '13px' : '14px',
                  }}
                >
                  Téléphone
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px' : '10px 12px',
                    border: `1px solid var(--border-color)`,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: isMobile ? '16px' : '14px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    minHeight: isMobile ? '44px' : 'auto',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.boxShadow = `0 0 0 2px rgba(205, 92, 8, 0.1)`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Role Field */}
              <div style={{ marginBottom: '24px' }}>
                <label
                  htmlFor="role"
                  style={{
                    display: 'block',
                    color: 'var(--text-primary)',
                    fontWeight: '500',
                    marginBottom: '6px',
                    fontSize: isMobile ? '13px' : '14px',
                  }}
                >
                  Rôle *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px' : '10px 12px',
                    border: `1px solid var(--border-color)`,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: isMobile ? '16px' : '14px',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    minHeight: isMobile ? '44px' : 'auto',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.boxShadow = `0 0 0 2px rgba(205, 92, 8, 0.1)`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Sélectionner un rôle</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Modérateur</option>
                  <option value="support">Support</option>
                   <option value="staff">Staff</option>
                </select>
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: isMobile ? '8px' : '12px', justifyContent: 'flex-end', flexDirection: isMobile ? 'column-reverse' : 'row' }}>
                <button
                  type="button"
                  onClick={() => resetModal()}
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
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: isMobile ? '12px 16px' : '10px 20px',
                    backgroundColor: submitting ? 'var(--text-muted)' : 'var(--accent-primary)',
                    color: 'var(--text-primary)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    transition: 'background-color 0.2s',
                    minHeight: isMobile ? '44px' : 'auto',
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.backgroundColor = 'var(--color-terracotta-light)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                    }
                  }}
                >
                  {submitting ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
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
