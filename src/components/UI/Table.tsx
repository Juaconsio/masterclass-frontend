'use client';

import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Table as TableEmptyIcon,
} from 'lucide-react';

import { cn } from '@/lib/cn';

// ==================== TYPES ====================

export interface TableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  formatter?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

export interface TableAction<T> {
  label?: string;
  icon?: React.ReactNode;
  onClick?: (row: T) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  show?: (row: T) => boolean;
  isDisabled?: (row: T) => boolean;
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

export interface TableScroll {
  maxHeight: string | number;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  actions?: TableAction<T>[];
  pagination?: TablePagination;
  scroll?: TableScroll;
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  rowKey: keyof T | ((row: T) => string | number);
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  className?: string;
  expandableRow?: {
    render: (row: T) => React.ReactNode;
  };
}

// ==================== COMPONENT ====================

export default function Table<T extends Record<string, any>>({
  columns,
  data,
  actions,
  pagination,
  scroll,
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  onSort,
  rowKey,
  striped = true,
  hoverable = true,
  compact = false,
  className = '',
  expandableRow,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    order: 'asc' | 'desc';
  } | null>(null);
  const [expandedRowKey, setExpandedRowKey] = useState<string | number | null>(null);

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
    if (column.render) {
      return column.render(row);
    }
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
    <div className={cn('w-full', className)}>
      {/* Table Container */}
      <div
        className={cn(
          'border-base-300 overflow-x-auto rounded-lg border',
          scroll && 'overflow-y-auto'
        )}
        style={scroll ? { maxHeight: scroll.maxHeight } : undefined}
      >
        <table
          className={cn(
            'table w-full min-w-max',
            striped && 'table-zebra',
            hoverable && 'table-hover',
            compact && 'table-compact'
          )}
        >
          {/* Table Header */}
          <thead className={cn('bg-primary text-primary-content', scroll && 'sticky top-0 z-10')}>
            <tr>
              {expandableRow && <th className="w-10" />}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    column.className,
                    column.sortable && onSort && 'cursor-pointer select-none'
                  )}
                  onClick={() => (column.sortable && onSort ? handleSort(column.key) : undefined)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && onSort && (
                      <span className="inline-flex shrink-0" aria-hidden>
                        {sortConfig?.key === column.key ? (
                          sortConfig.order === 'asc' ? (
                            <ArrowUp className="text-primary-content h-3.5 w-3.5 opacity-90" />
                          ) : (
                            <ArrowDown className="text-primary-content h-3.5 w-3.5 opacity-90" />
                          )
                        ) : (
                          <ArrowUpDown className="text-primary-content h-3.5 w-3.5 opacity-60" />
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
                <td
                  colSpan={columns.length + (actions ? 1 : 0) + (expandableRow ? 1 : 0)}
                  className="py-8 text-center"
                >
                  <span className="loading loading-spinner loading-lg"></span>
                  <p className="text-base-content/60 mt-2 text-sm">Cargando...</p>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0) + (expandableRow ? 1 : 0)}
                  className="py-8 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <TableEmptyIcon
                      className="text-base-content/30 h-12 w-12"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <p className="text-base-content/60">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const rowKeyVal = getRowKey(row, index);
                const isExpanded = expandedRowKey === rowKeyVal;

                return (
                  <React.Fragment key={rowKeyVal}>
                    <tr>
                      {expandableRow && (
                        <td className="w-10 p-0 pl-2">
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs btn-square"
                            onClick={() => setExpandedRowKey(isExpanded ? null : rowKeyVal)}
                            aria-expanded={isExpanded}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      )}
                      {columns.map((column) => (
                        <td key={column.key} className={cn(column.className)}>
                          {getCellValue(row, column)}
                        </td>
                      ))}
                      {actions && actions.length > 0 && (
                        <td className="text-right">
                          <div className="flex justify-end gap-1">
                            {actions
                              .filter((action) => (action.show ? action.show(row) : true))
                              .map((action, actionIndex) => {
                                if (action.render) {
                                  return <div key={actionIndex}>{action.render(row)}</div>;
                                }
                                return (
                                  <button
                                    key={actionIndex}
                                    className={cn(
                                      'btn btn-xs',
                                      getActionVariantClass(action.variant),
                                      action.className
                                    )}
                                    onClick={() => action.onClick?.(row)}
                                    disabled={action.isDisabled ? action.isDisabled(row) : false}
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
                    {expandableRow && isExpanded && (
                      <tr key={`${rowKeyVal}-expanded`}>
                        <td
                          colSpan={columns.length + (actions ? 1 : 0) + 1}
                          className="bg-base-200/50 p-0 align-top"
                        >
                          <div className="p-4">{expandableRow.render(row)}</div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && !loading && data.length > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-4 px-2 sm:flex-row">
          <div className="text-base-content/60 text-sm">
            Mostrando{' '}
            <span className="text-base-content font-medium">
              {(pagination.currentPage - 1) * pagination.pageSize + 1}
            </span>{' '}
            -{' '}
            <span className="text-base-content font-medium">
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}
            </span>{' '}
            de <span className="text-base-content font-medium">{pagination.totalItems}</span>{' '}
            resultados
          </div>

          <div className="flex items-center gap-3">
            {pagination.onPageSizeChange && (
              <div className="flex items-center gap-2">
                <span className="text-base-content/70 text-sm">Filas:</span>
                <select
                  className="select select-bordered select-sm border-base-300 bg-base-100 h-8 min-h-8 rounded-md text-sm"
                  value={pagination.pageSize}
                  onChange={(e) => pagination.onPageSizeChange?.(Number(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            )}

            <div className="border-base-300 bg-base-100 flex items-center gap-0.5 rounded-lg border p-0.5">
              <button
                type="button"
                className="btn btn-ghost btn-sm hover:bg-base-200 h-8 min-h-8 w-8 rounded-md px-2 disabled:pointer-events-none disabled:opacity-40"
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                aria-label="Primera página"
              >
                «
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === pagination.totalPages ||
                    Math.abs(page - pagination.currentPage) <= 1
                )
                .map((page, index, array) => {
                  const prevPage = array[index - 1];
                  const showEllipsis = prevPage != null && page - prevPage > 1;
                  const isActive = pagination.currentPage === page;

                  return (
                    <div key={page} className="flex items-center gap-0.5">
                      {showEllipsis && (
                        <span className="text-base-content/50 flex h-8 w-8 items-center justify-center text-sm">
                          …
                        </span>
                      )}
                      <button
                        type="button"
                        className={cn(
                          'btn btn-sm h-8 min-h-8 w-8 rounded-md px-2',
                          isActive
                            ? 'btn-primary text-primary-content'
                            : 'btn-ghost hover:bg-base-200'
                        )}
                        onClick={() => pagination.onPageChange(page)}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}

              <button
                type="button"
                className="btn btn-ghost btn-sm hover:bg-base-200 h-8 min-h-8 w-8 rounded-md px-2 disabled:pointer-events-none disabled:opacity-40"
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                aria-label="Última página"
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
