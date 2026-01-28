import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";
import {
  Loader,
  Package,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  Banknote,
  Warehouse, // Icon for Logistics
  Calendar,
  X,
} from "lucide-react";

const SellerOrders = () => {
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [status, setStatus] = useState("Processing");
  const [date, setDate] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

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

  // Handle Opening Modal
  const openLogisticsModal = (order) => {
    setSelectedOrder(order);
    setStatus(order.orderStatus || "Processing");
    // Format date for input type="date" (YYYY-MM-DD)
    if (order.expectedDelivery) {
      setDate(new Date(order.expectedDelivery).toISOString().split("T")[0]);
    } else {
      setDate("");
    }
  };

  // Handle Logistics Update
  const updateLogisticsHandler = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(
        `/api/orders/${selectedOrder._id}/status`,
        { status, date },
        config,
      );
      toast.success("Logistics Updated Successfully");
      setSelectedOrder(null); // Close modal
      fetchOrders(); // Refresh data
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdateLoading(false);
    }
  };

  // --- MARK AS DELIVERED HANDLER ---
  const markDeliveredHandler = async (orderId) => {
    if (
      !(await confirm(
        "Are you sure this order is delivered?",
        "Confirm Delivery",
        "info",
      ))
    )
      return;

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
        "Confirm payment received for this order?",
        "Confirm Payment",
      ))
    )
      return;

    setActionLoading(orderId);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(
        `/api/orders/${orderId}/pay`,
        {
          id: `MANUAL-COD-${Date.now()}`,
          status: "success",
          update_time: new Date().toISOString(),
          email: user.email,
        },
        config,
      );
      toast.success("Order Marked as Paid!");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader className="animate-spin" />
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center p-20">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8 font-outfit relative">
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
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                    Logistics
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

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${order.isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {order.isPaid ? "Paid" : "Pending"}
                      </span>
                    </td>

                    {/* NEW: Logistics Status Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1
                                ${
                                  order.orderStatus === "Delivered"
                                    ? "bg-green-100 text-green-800"
                                    : order.orderStatus === "Out for Delivery"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-blue-50 text-blue-600"
                                }`}
                        >
                          {order.orderStatus === "Delivered" ? (
                            <CheckCircle size={12} />
                          ) : (
                            <Truck size={12} />
                          )}
                          {order.orderStatus || "Processing"}
                        </span>
                      </div>
                      {order.expectedDelivery && !order.isDelivered && (
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Calendar size={10} /> Exp:{" "}
                          {new Date(
                            order.expectedDelivery,
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center gap-2">
                      {/* WAREHOUSE BUTTON */}
                      <button
                        onClick={() => openLogisticsModal(order)}
                        className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700 shadow-sm"
                        title="Update Warehouse Status"
                      >
                        <Warehouse size={16} />
                      </button>

                      {/* MARK PAID BUTTON */}
                      {!order.isPaid && (
                        <button
                          onClick={() => markPaidHandler(order._id)}
                          disabled={actionLoading === order._id}
                          className="bg-green-600 text-white p-2 rounded hover:bg-green-700 shadow-sm disabled:opacity-50"
                          title="Mark Paid"
                        >
                          {actionLoading === order._id ? (
                            <Loader size={16} className="animate-spin" />
                          ) : (
                            <Banknote size={16} />
                          )}
                        </button>
                      )}

                      <Link
                        to={`/order/${order._id}`}
                        className="text-gray-500 hover:text-amazon-blue p-2 bg-gray-100 rounded"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Warehouse className="text-amazon-blue" /> Update Logistics
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={updateLogisticsHandler} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Current Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border p-2 rounded focus:ring-2 ring-amazon-yellow outline-none"
                >
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border p-2 rounded focus:ring-2 ring-amazon-yellow outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set the estimated arrival date for the customer.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="px-4 py-2 bg-amazon-yellow text-amazon-blue rounded font-bold hover:bg-yellow-400 shadow-sm flex items-center gap-2"
                >
                  {updateLoading ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    "Update Status"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
