import { Navigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
