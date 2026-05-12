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
import { MoreHorizontal, UserPlus, Power, Edit2, Eye } from 'lucide-react';
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

export default function UsersPage() {
  const isMobile = useIsMobile();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<AdminId | null>(null);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApi<AdminUser[] | { data?: AdminUser[] }>('/admin/users');
      setUsers(Array.isArray(data) ? data : data.data || []);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load users.'));
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
      console.error('Failed to create user:', err);
      setError(getErrorMessage(err, 'Failed to create user.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId: AdminId, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await fetchApi(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, status: newStatus } : user))
      );
      setOpenDropdown(null);
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(getErrorMessage(err, 'Failed to update user status.'));
    }
  };

  const columns: ResponsiveTableColumn<AdminUser>[] = [
    { key: 'id', label: 'ID', render: (val) => `#${val}` },
    { 
      key: 'name', 
      label: 'Name', 
      render: (_, user) => (
        <div style={{ fontWeight: 600 }}>
          {formatUserLabel(user, `User #${user.id}`)}
        </div>
      )
    },
    { key: 'email', label: 'Email', render: (val) => val || 'No email' },
    { 
      key: 'role', 
      label: 'Role', 
      render: (val) => val?.name || `Role #${val?.id ?? 'N/A'}` 
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
    { 
      key: 'createdAt', 
      label: 'Joined', 
      render: (val) => formatDate(val),
      desktopOnly: true
    },
  ];

  const renderActions = (user: AdminUser) => (
    <div style={{ display: 'flex', gap: '8px', justifyContent: isMobile ? 'flex-start' : 'center' }}>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => handleToggleStatus(user.id, user.status || 'active')}
        title={user.status === 'active' ? 'Deactivate' : 'Activate'}
      >
        <Power size={16} color={user.status === 'active' ? 'var(--color-danger)' : 'var(--color-success)'} />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => console.log('Edit', user.id)} title="Edit">
        <Edit2 size={16} />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => console.log('Details', user.id)} title="Details">
        <Eye size={16} />
      </Button>
    </div>
  );

  return (
    <div className="animate-fade-in-up">
      <header className={styles.header}>
        <div>
          <h1>Users Management</h1>
          <p>Manage all platform user accounts</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <UserPlus size={18} style={{ marginRight: '8px' }} />
          Add Admin
        </Button>
      </header>

      <ResponsiveTable
        title="All Registered Accounts"
        columns={columns}
        data={users}
        loading={loading}
        error={error}
        isMobile={isMobile}
        renderRowActions={renderActions}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Administrator"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Fill in the information below to create a new administrator account.
          </p>
          
          <Input
            label="Email *"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="admin@example.com"
          />

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
            <Input
              label="First Name *"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Last Name *"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>

          <Input
            label="Phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />

          <Input
            label="Role *"
            as="select"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a role</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="support">Support</option>
            <option value="staff">Staff</option>
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
    </div>
  );
}
