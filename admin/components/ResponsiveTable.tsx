/**
 * Reusable Responsive Table Component for Mobile/Desktop views
 */
import React from 'react';

interface ResponsiveTableColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  mobile?: boolean;
}


interface ResponsiveTableProps {
  columns: ResponsiveTableColumn[];
  data: any[];
  loading?: boolean;
  error?: string | null;
  loadingMessage?: string;
  emptyMessage?: string;
  isMobile?: boolean;
  tableStyles?: any;
  renderRowActions?: (row: any) => React.ReactNode;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  data,
  loading = false,
  error = null,
  loadingMessage = 'Chargement en cours...',
  emptyMessage = 'Aucune donnée disponible.',
  isMobile = false,
  tableStyles = {},
  renderRowActions,
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
        {loadingMessage}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
        {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
        {emptyMessage}
      </div>
    );
  }

  if (isMobile) {
    // Mobile Card View
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '12px',
          padding: '12px',
        }}
      >
        {data.map((row, idx) => (
          <div
            key={idx}
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
            {columns.map((column) => (
              <div key={column.key} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>
                  {column.label}
                </div>
                <div>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </div>
              </div>
            ))}
            {renderRowActions && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                {renderRowActions(row)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Desktop Table View
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', ...tableStyles }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
          {columns.map((column) => (
            <th
              key={column.key}
              style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '13px',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-tertiary)',
              }}
            >
              {column.label}
            </th>
          ))}
          {renderRowActions && (
            <th
              style={{
                padding: '12px 16px',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '13px',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-tertiary)',
              }}
            >
              Actions
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}>
            {columns.map((column) => (
              <td
                key={column.key}
                style={{
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                }}
              >
                {column.render ? column.render(row[column.key], row) : row[column.key]}
              </td>
            ))}
            {renderRowActions && (
              <td
                style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '14px',
                }}
              >
                {renderRowActions(row)}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
