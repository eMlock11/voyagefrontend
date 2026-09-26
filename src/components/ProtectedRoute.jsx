import PropTypes from 'prop-types';
import { Navigate, Outlet } from 'react-router-dom';
import { userService } from '../services/userService';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const isAuth = userService.isAuthenticated();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  const currentUser = userService.getCurrentUser();
  const userRole = currentUser?.type || 'client';

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redireciona com base no papel do usuário se tentar acessar rota indevida
    if (userRole === 'owner') {
      return <Navigate to="/company" replace />;
    } else if (userRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

