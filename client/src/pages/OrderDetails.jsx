import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  Loader,
  MapPin,
  Package,
  CreditCard,
  XCircle,
  Trash2,
  CheckCircle,
  Truck,
} from "lucide-react";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliverLoading, setDeliverLoading] = useState(false); // State for delivery button

  useEffect(() => {
    if (!user) return;
    const fetchOrder = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`/api/orders/${id}`, config);
        setOrder(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, user]);

  const cancelOrderHandler = async () => {
    if (
      window.confirm(
        "Are you sure you want to cancel this order? This cannot be undone.",
      )
    ) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`/api/orders/${id}`, config);
        alert("Order Cancelled Successfully");
        navigate("/myorders");
      } catch (err) {
        alert(err.response?.data?.message || "Could not cancel order");
      }
    }
  };

  // --- NEW: DELIVER ORDER HANDLER ---
  const deliverOrderHandler = async () => {
    try {
      setDeliverLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/orders/${id}/deliver`, {}, config);
      setOrder({
        ...order,
        isDelivered: true,
        deliveredAt: new Date().toISOString(),
      }); // Optimistic update
      setDeliverLoading(false);
      alert("Order Marked as Delivered!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Delivery update failed");
      setDeliverLoading(false);
    }
  };
  // ----------------------------------

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
        <span className="font-mono text-gray-500">#{order._id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Package size={20} /> Items
            </h2>
            <div className="space-y-4">
              {order.orderItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-contain rounded bg-gray-50"
                  />
                  <div className="flex-grow">
                    <Link
                      to={`/product/${item.product}`}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      Qty: {item.qty} x ₹{item.price}
                    </p>
                  </div>
                  <div className="font-bold">₹{item.qty * item.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4">Summary</h2>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Shipping:</strong> {order.shippingAddress.address},{" "}
              {order.shippingAddress.city}
            </p>

            <div className="border-t border-b py-4 my-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Payment Method</span>
                <span className="font-bold">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                {order.isPaid ? (
                  <span className="text-green-600 font-bold flex items-center gap-1">
                    <CheckCircle size={14} /> Paid
                  </span>
                ) : (
                  <span className="text-red-600 font-bold flex items-center gap-1">
                    <XCircle size={14} /> Not Paid
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total</span>
              <span>₹{order.totalPrice}</span>
            </div>

            {/* CANCEL BUTTON (Visible if not delivered) */}
            {!order.isDelivered && (
              <button
                onClick={cancelOrderHandler}
                className="w-full bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 mb-3"
              >
                <Trash2 size={18} /> Cancel Order
              </button>
            )}
            {order.isDelivered && (
              <div className="text-center text-green-700 bg-green-50 p-2 rounded border border-green-200 font-bold flex items-center justify-center gap-2">
                <CheckCircle size={20} /> Order Delivered
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
