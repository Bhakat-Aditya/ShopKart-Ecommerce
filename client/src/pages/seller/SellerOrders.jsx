import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  Loader,
  Package,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  Banknote, // Icon for Mark Paid
} from "lucide-react";

const SellerOrders = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // Track specific button loading state

  const fetchOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get("/api/orders/seller", config);
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.isSeller) fetchOrders();
  }, [user]);

  // --- MARK AS DELIVERED HANDLER ---
  const markDeliveredHandler = async (orderId) => {
    if (
      !(await confirm(
        "Are you sure you want to mark this order as Delivered?",
        "Confirm Delivery",
        "info",
      ))
    ) {
      return;
    }
    setActionLoading(orderId);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/orders/${orderId}/deliver`, {}, config);
      toast.success("Order Marked as Delivered!");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setActionLoading(null);
    }
  };

  // --- NEW: MARK AS PAID HANDLER (For COD) ---
  const markPaidHandler = async (orderId) => {
    if (
      !(await confirm(
        "Have you received the cash payment for this order?",
        "Confirm Payment",
      ))
    ) {
      return;
    }

    setActionLoading(orderId);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      // Reuse the existing pay endpoint, passing manual details
      await axios.put(
        `/api/orders/${orderId}/pay`,
        {
          id: `MANUAL-COD-${Date.now()}`,
          status: "success",
          update_time: new Date().toISOString(),
          email: user.email, // Seller marked it
        },
        config,
      );
      toast.success("Payment Recorded Successfully!");
      fetchOrders();
    } catch (err) {
      toast.error("Could not update payment status");
    } finally {
      setActionLoading(null);
    }
  };
  // ------------------------------------------

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
      <h1 className="text-2xl font-bold mb-6 text-amazon-blue">
        Manage Orders
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white p-8 rounded shadow text-center">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">You have no orders yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                    Customer
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">
                      #{order._id.substring(20, 24)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.user?.name || "Guest"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.createdAt.substring(0, 10)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      ₹{order.totalPrice}
                    </td>

                    {/* Status Column (Combined Paid + Deliver) */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col gap-1">
                        {order.isPaid ? (
                          <span className="flex items-center gap-1 text-green-600 font-bold text-xs">
                            <CheckCircle size={12} /> Paid
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 font-bold text-xs">
                            <XCircle size={12} /> Pending Pay
                          </span>
                        )}

                        {order.isDelivered ? (
                          <span className="flex items-center gap-1 text-green-600 font-bold text-xs">
                            <Truck size={12} /> Delivered
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-600 font-bold text-xs">
                            <Truck size={12} /> Processing
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center gap-2">
                      <Link
                        to={`/order/${order._id}`}
                        className="text-gray-500 hover:text-amazon-blue p-2 rounded hover:bg-gray-100"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </Link>

                      {/* MARK PAID BUTTON (Only if not paid) */}
                      {!order.isPaid && (
                        <button
                          onClick={() => markPaidHandler(order._id)}
                          disabled={actionLoading === order._id}
                          className="bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700 flex items-center gap-1 shadow-sm disabled:opacity-50"
                          title="Mark as Paid (COD Received)"
                        >
                          {actionLoading === order._id ? (
                            <Loader size={12} className="animate-spin" />
                          ) : (
                            <Banknote size={14} />
                          )}
                          Paid
                        </button>
                      )}

                      {/* MARK DELIVERED BUTTON (Only if not delivered) */}
                      {!order.isDelivered && (
                        <button
                          onClick={() => markDeliveredHandler(order._id)}
                          disabled={actionLoading === order._id}
                          className="bg-amazon-blue text-white px-3 py-1.5 rounded text-xs hover:bg-gray-800 flex items-center gap-1 shadow-sm disabled:opacity-50"
                          title="Mark as Delivered"
                        >
                          {actionLoading === order._id ? (
                            <Loader size={12} className="animate-spin" />
                          ) : (
                            <Truck size={14} />
                          )}
                          Delivered
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
