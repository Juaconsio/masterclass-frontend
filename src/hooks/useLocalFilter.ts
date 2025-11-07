import { useState, useMemo } from 'react';

export interface UseLocalFilterOptions<T> {
  data: T[];
  searchKeys?: (keyof T)[];
  filterFn?: (item: T, filters: Record<string, any>) => boolean;
}

export interface UseLocalFilterReturn<T> {
  filteredData: T[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: Record<string, any>;
  setFilter: (key: string, value: any) => void;
  clearFilters: () => void;
}

/**
 * Hook for client-side filtering and searching of data
 *
 * @example
 * ```tsx
 * const { filteredData, searchTerm, setSearchTerm, setFilter } = useLocalFilter({
 *   data: courses,
 *   searchKeys: ['title', 'acronym'],
 *   filterFn: (course, filters) => {
 *     if (filters.status === 'active') return course.isActive;
 *     if (filters.status === 'inactive') return !course.isActive;
 *     return true;
 *   }
 * });
 * ```
 */
export function useLocalFilter<T>({
  data,
  searchKeys = [],
  filterFn,
}: UseLocalFilterOptions<T>): UseLocalFilterReturn<T> {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});

  const filteredData = useMemo(() => {
    let result = data;

    // Apply search term
    if (searchTerm && searchKeys.length > 0) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter((item) => {
        return searchKeys.some((key) => {
          const value = item[key];
          if (value == null) return false;
          return String(value).toLowerCase().includes(lowerSearchTerm);
        });
      });
    }

    // Apply custom filters
    if (filterFn) {
      result = result.filter((item) => filterFn(item, filters));
    }

    return result;
  }, [data, searchTerm, searchKeys, filters, filterFn]);

  const setFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({});
  };

  return {
    filteredData,
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    clearFilters,
  };
}
