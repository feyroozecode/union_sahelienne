'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchApi, getErrorMessage } from '@/lib/api';
import { formatDate, formatUserLabel } from '@/lib/format';
import type { AdminId, AdminUser } from '@/lib/types';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { ResponsiveTable, type ResponsiveTableColumn } from '@/components/ResponsiveTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, UserPlus, Power, Edit2, Eye, Trash2 } from 'lucide-react';
import styles from './page.module.css';

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
}

const INITIAL_FORM_DATA: FormData = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  role: '',
};

export default function AdminsPage() {
  const isMobile = useIsMobile();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      // In this project, admins are often just users with specific roles
      const data = await fetchApi<AdminUser[] | { data?: AdminUser[] }>('/admin/users');
      const allUsers = Array.isArray(data) ? data : data.data || [];
      // Filter for admins if necessary, or show all if the endpoint already filters
      setUsers(allUsers);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load administrators.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetchApi<AdminUser>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setUsers((prev) => [...prev, response]);
      setFormData(INITIAL_FORM_DATA);
      setShowModal(false);
    } catch (err) {
      console.error('Failed to create admin:', err);
      setError(getErrorMessage(err, 'Failed to create administrator.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      await fetchApi(`/admin/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const columns: ResponsiveTableColumn<AdminUser>[] = [
    { key: 'id', label: 'ID', render: (val) => `#${val}` },
    { 
      key: 'name', 
      label: 'Admin Name', 
      render: (_, user) => (
        <div style={{ fontWeight: 600 }}>
          {formatUserLabel(user, `Admin #${user.id}`)}
        </div>
      )
    },
    { key: 'email', label: 'Email' },
    { 
      key: 'role', 
      label: 'Role', 
      render: (val) => (
        <Badge variant="info">
          {val?.name || 'Admin'}
        </Badge>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (val) => {
        const statusName = typeof val === 'object' && val !== null ? (val as any).name : val;
        const isActive = statusName === 'active' || (typeof statusName === 'string' && statusName.toLowerCase() === 'active');
        return (
          <Badge variant={isActive ? 'success' : 'neutral'}>
            {statusName || 'Active'}
          </Badge>
        );
      }
    },
  ];

  const renderActions = (user: AdminUser) => (
    <div style={{ display: 'flex', gap: '8px', justifyContent: isMobile ? 'flex-start' : 'center' }}>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => handleToggleStatus(user)}
        title={user.status === 'active' ? 'Deactivate' : 'Activate'}
      >
        <Power size={16} color={user.status === 'active' ? 'var(--color-danger)' : 'var(--color-success)'} />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => console.log('Edit', user.id)} title="Edit">
        <Edit2 size={16} />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => {
          setSelectedAdmin(user);
          setShowConfirmModal(true);
        }} 
        title="Delete"
      >
        <Trash2 size={16} color="var(--color-danger)" />
      </Button>
    </div>
  );

  return (
    <div className="animate-fade-in-up">
      <header className={styles.header}>
        <div>
          <h1>Administrator Management</h1>
          <p>Configure system access and administrative roles</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <UserPlus size={18} style={{ marginRight: '8px' }} />
          Create Admin
        </Button>
      </header>

      <ResponsiveTable
        title="Active Administrative Accounts"
        columns={columns}
        data={users}
        loading={loading}
        error={error}
        isMobile={isMobile}
        renderRowActions={renderActions}
      />

      {/* Create Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Administrator"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Input
            label="Email Address *"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
            <Input
              label="First Name *"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Last Name *"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>

          <Input
            label="Administrative Role *"
            as="select"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a role</option>
            <option value="admin">Super Admin</option>
            <option value="moderator">Content Moderator</option>
            <option value="support">Support Agent</option>
          </Input>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Are you sure you want to remove <strong>{selectedAdmin && formatUserLabel(selectedAdmin, '')}</strong>? This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
              Keep Account
            </Button>
            <Button variant="danger" onClick={() => setShowConfirmModal(false)}>
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
