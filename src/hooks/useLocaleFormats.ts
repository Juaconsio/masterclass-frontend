import { useCallback } from 'react';

/** Formato CLP y fechas para tablas admin (compartido sin mezclar dominios). */
export function useLocaleFormats() {
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  }, []);

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  return { formatCurrency, formatDate };
}
