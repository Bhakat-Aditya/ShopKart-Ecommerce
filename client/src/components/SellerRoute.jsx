import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SellerRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // STRICTLY check for isSeller
  return user && user.isSeller ? <Outlet /> : <Navigate to="/seller/register" />;
};

export default SellerRoute;