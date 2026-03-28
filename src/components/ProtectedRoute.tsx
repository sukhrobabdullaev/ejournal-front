import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkPermissions } from '../utils/auth.utils';

interface ProtectedRouteProps {
  requiredRole?: 'admin' | 'editor' | 'reviewer' | 'author';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Yuklanmoqda...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !checkPermissions(user, requiredRole)) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Kirish rad etildi (403)</h2>
        <p>Kechirasiz, sizda bu sahifaga kirish uchun ruxsat yo'q yoki rolingiz hali Admin tomonidan tasdiqlanmagan.</p>
      </div>
    );
  }

  return <Outlet />; // Barcha tekshiruvlardan o'tsa, ichki sahifani ko'rsatish
};