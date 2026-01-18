'use client';

import { useState } from 'react';

// ==================== TYPES ====================

export interface TableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  formatter?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

export interface TableAction<T> {
  label?: string;
  icon?: React.ReactNode;
  onClick?: (row: T) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  show?: (row: T) => boolean;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

export interface TablePagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  actions?: TableAction<T>[];
  pagination?: TablePagination;
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  rowKey: keyof T | ((row: T) => string | number);
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  className?: string;
}

// ==================== COMPONENT ====================

export default function Table<T extends Record<string, any>>({
  columns,
  data,
  actions,
  pagination,
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  onSort,
  rowKey,
  striped = true,
  hoverable = true,
  compact = false,
  className = '',
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    order: 'asc' | 'desc';
  } | null>(null);

  // Handle sort
  const handleSort = (key: string) => {
    if (!onSort) return;

    const newOrder = sortConfig?.key === key && sortConfig.order === 'asc' ? 'desc' : 'asc';

    setSortConfig({ key, order: newOrder });
    onSort(key, newOrder);
  };

  // Get row key
  const getRowKey = (row: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(row);
    }
    return row[rowKey] ?? index;
  };

  // Get cell value
  const getCellValue = (row: T, column: TableColumn<T>) => {
    const value = row[column.key];

    if (column.formatter) {
      return column.formatter(value, row);
    }

    return value ?? '-';
  };

  // Get action button variant classes
  const getActionVariantClass = (variant?: TableAction<T>['variant']) => {
    switch (variant) {
      case 'primary':
        return 'btn-primary';
      case 'secondary':
        return 'btn-secondary';
      case 'danger':
        return 'btn-error';
      case 'success':
        return 'btn-success';
      default:
        return 'btn-ghost';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Table Container */}
      <div className="border-base-300 overflow-x-auto rounded-lg border">
        <table
          className={`table w-full ${striped ? 'table-zebra' : ''} ${
            hoverable ? 'table-hover' : ''
          } ${compact ? 'table-compact' : ''}`}
        >
          {/* Table Header */}
          <thead className="bg-base-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${column.className || ''} ${
                    column.sortable && onSort ? 'cursor-pointer select-none' : ''
                  }`}
                  onClick={() => (column.sortable && onSort ? handleSort(column.key) : undefined)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && onSort && (
                      <span className="text-xs">
                        {sortConfig?.key === column.key ? (
                          sortConfig.order === 'asc' ? (
                            <span>↑</span>
                          ) : (
                            <span>↓</span>
                          )
                        ) : (
                          <span className="opacity-30">↕</span>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && actions.length > 0 && <th className="text-right">Acciones</th>}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="py-8 text-center">
                  <span className="loading loading-spinner loading-lg"></span>
                  <p className="text-base-content/60 mt-2 text-sm">Cargando...</p>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="py-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-base-content/30 h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p className="text-base-content/60">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={getRowKey(row, index)}>
                  {columns.map((column) => (
                    <td key={column.key} className={column.className || ''}>
                      {getCellValue(row, column)}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        {actions
                          .filter((action) => (action.show ? action.show(row) : true))
                          .map((action, actionIndex) => {
                            // Custom render function
                            if (action.render) {
                              return <div key={actionIndex}>{action.render(row)}</div>;
                            }

                            // Default button
                            return (
                              <button
                                key={actionIndex}
                                className={`btn btn-xs ${getActionVariantClass(
                                  action.variant
                                )} ${action.className || ''}`}
                                onClick={() => action.onClick?.(row)}
                                title={action.label}
                              >
                                {action.icon && (
                                  <span className="flex items-center">{action.icon}</span>
                                )}
                                {!action.icon && action.label}
                              </button>
                            );
                          })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && !loading && data.length > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-4 px-2 sm:flex-row">
          {/* Items info */}
          <div className="text-base-content/60 text-sm">
            Mostrando{' '}
            <span className="font-medium">
              {(pagination.currentPage - 1) * pagination.pageSize + 1}
            </span>{' '}
            -{' '}
            <span className="font-medium">
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}
            </span>{' '}
            de <span className="font-medium">{pagination.totalItems}</span> resultados
          </div>

          {/* Pagination controls */}
          <div className="flex items-center gap-2">
            {/* Page size selector */}
            {pagination.onPageSizeChange && (
              <select
                className="select select-bordered select-sm"
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange?.(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            )}

            {/* Page buttons */}
            <div className="join">
              <button
                className="join-item btn btn-sm"
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                «
              </button>

              {/* Show pages */}
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first, last, current, and adjacent pages
                  return (
                    page === 1 ||
                    page === pagination.totalPages ||
                    Math.abs(page - pagination.currentPage) <= 1
                  );
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const prevPage = array[index - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;

                  return (
                    <div key={page} className="join-item flex">
                      {showEllipsis && <button className="btn btn-sm btn-disabled">...</button>}
                      <button
                        className={`join-item btn btn-sm ${
                          pagination.currentPage === page ? 'btn-active' : ''
                        }`}
                        onClick={() => pagination.onPageChange(page)}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}

              <button
                className="join-item btn btn-sm"
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
