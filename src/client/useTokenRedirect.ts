import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router';

interface DecodedToken {
  exp?: number;
  role?: string;
  isAdmin?: boolean;
}

interface UseTokenRedirectOptions {
  onTokenValid?: (token: string) => void;
}

/**
 * Hook that checks for an existing valid token and redirects based on user role.
 * If a valid token exists, it calls onTokenValid with the token and redirects
 * to /admin for admins or /app for regular users.
 * @param options - Configuration options for the hook
 */
export function useTokenRedirect(options: UseTokenRedirectOptions = {}) {
  const { onTokenValid } = options;
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || undefined;
        if (!token) return;

        const decoded: DecodedToken = jwtDecode(token);

        if (decoded.exp && Date.now() / 1000 > decoded.exp) {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          return;
        }

        onTokenValid?.(token);
        const isAdmin = decoded?.role === 'admin' || decoded?.isAdmin === true;
        navigate(isAdmin ? '/admin' : '/app');
      } catch {
        // Silent fail if token verification fails
      }
    };

    checkToken();
  }, [navigate, onTokenValid]);
}
