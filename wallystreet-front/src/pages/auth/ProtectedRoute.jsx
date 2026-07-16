import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/auth/useAuth";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/statpage" replace />;
};

export default ProtectedRoute;
