/**
 * Helper para construir query params desde un objeto de filtros
 * Omite valores undefined, null y strings vacíos
 */
function buildQueryParams<T extends Record<string, any>>(filters?: T): URLSearchParams {
  const params = new URLSearchParams();

  if (!filters) return params;

  Object.entries(filters).forEach(([key, value]) => {
    // Omitir valores undefined, null o strings vacíos
    if (value === undefined || value === null || value === '') {
      return;
    }

    // Convertir valores a string
    if (typeof value === 'boolean' || typeof value === 'number') {
      params.append(key, String(value));
    } else if (typeof value === 'string') {
      params.append(key, value);
    } else if (Array.isArray(value)) {
      // Manejar arrays (e.g., para filtros múltiples)
      value.forEach((item) => params.append(key, String(item)));
    } else if (value instanceof Date) {
      // Manejar fechas
      params.append(key, value.toISOString());
    } else {
      // Para otros tipos, intentar convertir a string
      params.append(key, String(value));
    }
  });

  return params;
}

/**
 * Helper alternativo que retorna directamente el string de query
 */
export function buildQueryString<T extends Record<string, any>>(filters?: T): string {
  const params = buildQueryParams(filters);
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}
