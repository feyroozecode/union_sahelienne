'use client';

import React from 'react';
import styles from './ResponsiveTable.module.css';

export interface ResponsiveTableColumn<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

interface ResponsiveTableProps<T = any> {
  columns: ResponsiveTableColumn<T>[];
  data: T[];
  loading?: boolean;
  error?: string | null;
  loadingMessage?: string;
  emptyMessage?: string;
  isMobile?: boolean;
  title?: string;
  renderRowActions?: (row: T) => React.ReactNode;
  headerActions?: React.ReactNode;
}

export function ResponsiveTable<T = any>({
  columns,
  data,
  loading = false,
  error = null,
  loadingMessage = 'Loading data...',
  emptyMessage = 'No data available.',
  isMobile = false,
  title,
  renderRowActions,
  headerActions,
}: ResponsiveTableProps<T>) {
  if (loading) {
    return (
      <div className={styles.tableContainer}>
        {title && <div className={styles.tableHeader}><div className={styles.tableTitle}>{title}</div></div>}
        <div className={styles.statusContainer}>
          <span className={styles.loader}></span>
          <p>{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.tableContainer}>
        {title && <div className={styles.tableHeader}><div className={styles.tableTitle}>{title}</div></div>}
        <div className={styles.statusContainer}>
          <p style={{ color: 'var(--color-danger)' }}>{error}</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (data.length === 0) {
      return (
        <div className={styles.statusContainer}>
          <p>{emptyMessage}</p>
        </div>
      );
    }

    if (isMobile) {
      return (
        <div className={styles.mobileGrid}>
          {data.map((row, idx) => (
            <div key={idx} className={styles.mobileCard}>
              {columns.filter(col => !col.desktopOnly).map((column) => (
                <div key={column.key} className={styles.mobileField}>
                  <div className={styles.mobileLabel}>{column.label}</div>
                  <div className={styles.mobileValue}>
                    {column.render ? column.render((row as any)[column.key], row) : (row as any)[column.key]}
                  </div>
                </div>
              ))}
              {renderRowActions && (
                <div className={styles.mobileActions}>
                  {renderRowActions(row)}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.filter(col => !col.mobileOnly).map((column) => (
                <th key={column.key} className={styles.th}>
                  {column.label}
                </th>
              ))}
              {renderRowActions && <th className={styles.th} style={{ textAlign: 'center' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className={styles.tr}>
                {columns.filter(col => !col.mobileOnly).map((column) => (
                  <td key={column.key} className={styles.td}>
                    {column.render ? column.render((row as any)[column.key], row) : (row as any)[column.key]}
                  </td>
                ))}
                {renderRowActions && (
                  <td className={styles.td} style={{ textAlign: 'center' }}>
                    {renderRowActions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={styles.tableContainer}>
      {(title || headerActions) && (
        <div className={styles.tableHeader}>
          {title && <div className={styles.tableTitle}>{title}</div>}
          {headerActions && <div className={styles.headerActions}>{headerActions}</div>}
        </div>
      )}
      {renderContent()}
    </div>
  );
}
