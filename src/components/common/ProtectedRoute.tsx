import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner, Flex } from '@chakra-ui/react';

type ProtectedRouteProps = {
  requireAdmin?: boolean;
};

export const ProtectedRoute = ({ requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  // Si no hay usuario autenticado, redirige al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere admin pero el usuario no lo es, redirige a home
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Si pasa todas las validaciones, muestra el contenido de la ruta
  return <Outlet />;
};
