import { useState, useEffect } from 'react';

interface UserInfo {
  id: number;
  email: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      setUser(null);
    }
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    role: user?.role,
  };
}
