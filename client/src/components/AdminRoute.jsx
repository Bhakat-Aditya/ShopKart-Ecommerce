import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  const isAuthorized = user && (user.isAdmin || user.isSeller);

  return isAuthorized ? (
    <Outlet />
  ) : (
    <Navigate to={`/login?redirect=${location.pathname}`} />
  );
};

export default AdminRoute;