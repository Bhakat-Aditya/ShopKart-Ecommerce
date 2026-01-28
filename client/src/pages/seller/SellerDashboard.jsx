import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  Loader,
  DollarSign,
  Package,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";
import { Link } from "react-router-dom";

const SellerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get("/api/seller/dashboard", config);
        setStats(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data. Please try again.");
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading)
    return (
      <div className="p-10 flex justify-center">
        <Loader className="animate-spin" />
      </div>
    );

  // --- FIX: Handle case where stats is null (e.g. API error) ---
  if (error || !stats) {
    return (
      <div className="container mx-auto px-4 py-8 font-outfit text-center">
        <h2 className="text-red-500 text-xl font-bold mb-4">
          {error || "Something went wrong"}
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="bg-amazon-yellow px-6 py-2 rounded-lg font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 font-outfit">
      <h1 className="text-3xl font-bold mb-2 text-amazon-blue">
        Seller Dashboard
      </h1>
      <p className="text-gray-500 mb-8">Welcome back, {user.name}!</p>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full text-green-700">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Earnings</p>
            {/* Safe access using Optional Chaining (?.) just in case */}
            <h2 className="text-2xl font-bold">
              ₹{stats?.totalEarnings?.toLocaleString() || 0}
            </h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full text-blue-700">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Inventory Value</p>
            <h2 className="text-2xl font-bold">
              ₹{stats?.futureProfit?.toLocaleString() || 0}
            </h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-full text-orange-700">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Stock</p>
            <h2 className="text-2xl font-bold">
              {stats?.totalStock || 0} units
            </h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-full text-purple-700">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Products Listed</p>
            <h2 className="text-2xl font-bold">{stats?.productsCount || 0}</h2>
          </div>
        </div>
      </div>

      {/* --- ACTION BUTTONS --- */}
      <div className="flex gap-4">
        <Link
          to="/seller/products"
          className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors"
        >
          Manage Products
        </Link>
        <Link
          to="/seller/orders"
          className="bg-amazon-yellow text-amazon-blue px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center gap-2"
        >
          <Package size={20} /> Manage Orders
        </Link>
      </div>
    </div>
  );
};

export default SellerDashboard;
