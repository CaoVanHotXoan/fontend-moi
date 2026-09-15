import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
};

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!isAuthenticated) {
      router.replace(`/Login/Login?returnUrl=${encodeURIComponent(router.asPath)}`);
      return;
    }

    if (requireAdmin && !isAdmin) {
      router.replace('/');
    }
  }, [isAuthenticated, isAdmin, status, router, requireAdmin]);

  if (status === 'loading' || !isAuthenticated || (requireAdmin && !isAdmin)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: '#183230', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #c2e0d8', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Đang kiểm tra quyền truy cập bảo mật...</p>
      </div>
    );
  }

  return <>{children}</>;
}
