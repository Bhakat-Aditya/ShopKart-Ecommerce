import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Loader,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get("/api/orders/admin/stats", config);
        setStats(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load dashboard data");
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader className="animate-spin" />
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center p-20">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8 font-outfit">
      <h1 className="text-2xl font-bold mb-8 text-amazon-blue flex items-center gap-2">
        <TrendingUp className="text-amazon-yellow" /> Admin Dashboard
      </h1>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Card 1: Revenue */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase">
              Total Revenue
            </p>
            <p className="text-2xl font-bold text-gray-800">
              ₹{stats.totalSales.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Card 2: Orders */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase">
              Total Orders
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.ordersCount}
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <ShoppingBag size={24} />
          </div>
        </div>

        {/* Card 3: Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-amazon-yellow flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase">
              Total Products
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.productsCount}
            </p>
          </div>
          <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
            <Package size={24} />
          </div>
        </div>

        {/* Card 4: Sellers */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase">
              Total Sellers
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.sellersCount}
            </p>
            <p className="text-xs text-gray-400">
              Total Users: {stats.usersCount}
            </p>
          </div>
          <div className="bg-purple-100 p-3 rounded-full text-purple-600">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* --- RECENT ORDERS TABLE --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-bold text-lg text-gray-800">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="text-sm text-blue-600 hover:underline flex items-center"
          >
            View All <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    #{order._id.substring(20, 24)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.user?.name || "Deleted User"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.createdAt.substring(0, 10)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                    ₹{order.totalPrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.isPaid ? (
                      <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">
                        Paid
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link
                      to={`/order/${order._id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
