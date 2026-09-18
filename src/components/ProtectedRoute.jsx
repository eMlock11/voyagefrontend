import { Navigate, Outlet } from 'react-router-dom';
import { userService } from '../services/userService';

export default function ProtectedRoute() {
  const isAuth = userService.isAuthenticated();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
