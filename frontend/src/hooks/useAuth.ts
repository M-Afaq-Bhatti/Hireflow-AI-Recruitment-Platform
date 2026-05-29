'use client';
import { useState, useEffect } from 'react';
import type { AuthState } from '@/types';

export const useAuth = (): AuthState & { logout: () => void; loading: boolean } => {
  const [auth, setAuth] = useState<AuthState>({ token: null, user: null, tenantId: null, companyName: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hireflow_token');
    const user = localStorage.getItem('hireflow_user');
    const tenantId = localStorage.getItem('hireflow_tenantId');
    const companyName = localStorage.getItem('hireflow_company');
    if (token) {
      setAuth({ token, user: user ? JSON.parse(user) : null, tenantId, companyName });
    }
    setLoading(false);
  }, []);

  const logout = () => {
    ['hireflow_token', 'hireflow_user', 'hireflow_tenantId', 'hireflow_company'].forEach(k => localStorage.removeItem(k));
    window.location.href = '/';
  };

  return { ...auth, logout, loading };
};

export const saveAuth = (token: string, user: any, tenantId: string, companyName: string) => {
  localStorage.setItem('hireflow_token', token);
  localStorage.setItem('hireflow_user', JSON.stringify(user));
  localStorage.setItem('hireflow_tenantId', tenantId);
  localStorage.setItem('hireflow_company', companyName);
};
