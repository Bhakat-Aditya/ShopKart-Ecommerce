import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Loader, Package, XCircle, CheckCircle } from "lucide-react";

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        const { data } = await axios.get("/api/orders/myorders", config);
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8 font-outfit min-h-[80vh]">
      <h1 className="text-2xl font-bold mb-6 text-amazon-blue">Your Orders</h1>

      {loading ? (
        <div className="flex justify-center mt-10">
          <Loader className="animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-8 text-center rounded shadow-sm">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-700">No orders yet</h2>
          <Link
            to="/"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.createdAt.substring(0, 10)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{order.totalPrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {order.isPaid ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle size={16} className="mr-1" />{" "}
                        {order.paidAt?.substring(0, 10)}
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <XCircle size={16} className="mr-1" /> Not Paid
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {order.isDelivered ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle size={16} className="mr-1" /> Delivered
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <XCircle size={16} className="mr-1" /> Not Delivered
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-amazon-blue hover:text-amazon-yellow bg-gray-100 px-3 py-1 rounded border border-gray-300">
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
