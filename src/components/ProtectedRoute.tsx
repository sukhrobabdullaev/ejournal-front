import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: 'admin' | 'editor' | 'reviewer' | 'author';
}

const checkPermissions = (
  user: { roles?: string[]; editor_status?: string | null; reviewer_status?: string | null } | null,
  requiredRole: 'admin' | 'editor' | 'reviewer' | 'author'
) => {
  if (!user) {
    return false;
  }

  const roles = user.roles || [];
  if (requiredRole === 'admin') {
    return roles.includes('admin');
  }

  if (requiredRole === 'editor') {
    return roles.includes('editor') && user.editor_status === 'approved';
  }

  if (requiredRole === 'reviewer') {
    return roles.includes('reviewer') && user.reviewer_status === 'approved';
  }

  return roles.includes('author');
};

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
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Access denied (403)</h2>
        <p>Sorry, you don't have permission to access this page, or your role hasn't been approved by an admin yet.</p>
      </div>
    );
  }

  return <Outlet />; // Barcha tekshiruvlardan o'tsa, ichki sahifani ko'rsatish
};