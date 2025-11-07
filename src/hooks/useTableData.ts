import { useState, useEffect, useCallback } from 'react';
import type { TableResponse } from '@/interfaces';
export interface TableFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  [key: string]: any; // Allow additional custom filters
}

export interface UseTableDataOptions<T, F extends TableFilters = TableFilters> {
  fetchFn: (filters: F) => Promise<TableResponse<T>>;
  initialFilters?: Partial<F>;
  autoLoad?: boolean;
}

export interface UseTableDataReturn<T, F extends TableFilters = TableFilters> {
  data: T[];
  loading: boolean;
  error: Error | null;
  total: number;
  filters: F;
  totalPages: number;
  setFilters: React.Dispatch<React.SetStateAction<F>>;
  updateFilters: (updates: Partial<F>) => void;
  reload: () => Promise<void>;
  handleSort: (key: string, order: 'asc' | 'desc') => void;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (limit: number) => void;
  handleSearch: (search: string) => void;
}

/**
 * Generic hook for managing table data with pagination, sorting, and filtering
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   loading,
 *   filters,
 *   totalPages,
 *   handleSort,
 *   handlePageChange,
 * } = useTableData({
 *   fetchFn: getStudents,
 *   initialFilters: { page: 1, limit: 10 }
 * });
 * ```
 */
export function useTableData<T, F extends TableFilters = TableFilters>({
  fetchFn,
  initialFilters = {} as Partial<F>,
  autoLoad = true,
}: UseTableDataOptions<T, F>): UseTableDataReturn<T, F> {
  const defaultFilters: TableFilters = {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  };

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<F>({
    ...defaultFilters,
    ...initialFilters,
  } as F);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchFn(filters);
      setData(response.data);
      setTotal(response.total);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error loading data');
      setError(error);
      console.error('Error loading table data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, filters]);

  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
  }, [loadData, autoLoad]);

  const updateFilters = useCallback((updates: Partial<F>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleSort = useCallback(
    (key: string, order: 'asc' | 'desc') => {
      updateFilters({
        sortBy: key,
        sortOrder: order,
        page: 1,
      } as Partial<F>);
    },
    [updateFilters]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateFilters({ page } as Partial<F>);
    },
    [updateFilters]
  );

  const handlePageSizeChange = useCallback(
    (limit: number) => {
      updateFilters({ limit, page: 1 } as Partial<F>);
    },
    [updateFilters]
  );

  const handleSearch = useCallback(
    (search: string) => {
      updateFilters({ search, page: 1 } as Partial<F>);
    },
    [updateFilters]
  );

  const totalPages = Math.ceil(total / (filters.limit || 10));

  return {
    data,
    loading,
    error,
    total,
    filters,
    totalPages,
    setFilters,
    updateFilters,
    reload: loadData,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
  };
}
