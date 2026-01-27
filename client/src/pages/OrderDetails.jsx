import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  Loader,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Package,
  Calendar,
  AlertTriangle,
} from "lucide-react";

const OrderDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    // 1. SAFETY CHECK: Don't run if user is null
    if (!user) return;

    const fetchOrder = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        const { data } = await axios.get(`/api/orders/${id}`, config);
        setOrder(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, user]); // <--- 2. FIXED: Removed 'user.token' to prevent crash

  // 3. SAFETY CHECK: Redirect or show message if not logged in
  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen font-outfit">
        <h2 className="text-xl font-bold mb-4">
          Please log in to view this order
        </h2>
        <Link
          to="/login"
          className="bg-amazon-yellow px-6 py-2 rounded font-bold"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin text-amazon-blue" size={40} />
      </div>
    );
  if (error)
    return (
      <div className="text-red-500 text-center py-10 font-bold">{error}</div>
    );

  return (
    <div className="container mx-auto px-4 py-8 font-outfit max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-amazon-blue">Order Details</h1>
          <p className="text-gray-500 text-sm mt-1">
            Order ID:{" "}
            <span className="font-mono text-gray-700">#{order._id}</span>
          </p>
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Calendar size={16} />
          Placed on {order.createdAt.substring(0, 10)}
        </div>
      </div>

      {/* CANCELLED BANNER */}
      {order.isCancelled && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-8 flex items-center gap-3">
          <AlertTriangle size={24} className="text-red-600" />
          <div>
            <h3 className="font-bold text-lg">Order Cancelled</h3>
            <p className="text-sm">
              This order was cancelled on {order.cancelledAt?.substring(0, 10)}.
              A refund will be processed shortly.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-amazon-light">
              <MapPin size={20} /> Shipping Address
            </h2>
            <div className="ml-7 text-gray-700 space-y-1">
              <p>
                <span className="font-semibold">{order.user.name}</span>
              </p>
              <p>{order.user.email}</p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>

            <div className="mt-4 border-t pt-4 ml-7">
              {order.isDelivered ? (
                <div className="bg-green-100 text-green-800 px-4 py-3 rounded-md flex items-center gap-3 font-bold">
                  <CheckCircle size={20} /> Delivered on{" "}
                  {order.deliveredAt?.substring(0, 10)}
                </div>
              ) : (
                <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-md flex items-center gap-3 font-bold">
                  <Truck size={20} /> Delivery Status:{" "}
                  <span className="text-blue-600 font-normal">On the way</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-amazon-light">
              <CheckCircle size={20} /> Payment Method
            </h2>
            <div className="ml-7 mb-4">
              <span className="font-medium text-gray-700">Method: </span>
              <span className="capitalize">{order.paymentMethod}</span>
            </div>

            <div className="ml-7">
              {order.isPaid ? (
                <div className="bg-green-100 text-green-800 px-4 py-3 rounded-md flex items-center gap-3 font-bold">
                  <CheckCircle size={20} /> Paid on{" "}
                  {order.paidAt?.substring(0, 10)}
                </div>
              ) : (
                <div className="bg-yellow-50 text-yellow-800 px-4 py-3 rounded-md flex items-center gap-3 font-bold border border-yellow-100">
                  <XCircle size={20} /> Payment Status:{" "}
                  <span className="text-yellow-700 font-normal">Pending</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-amazon-light">
              <Package size={20} /> Order Items
            </h2>
            <div className="space-y-4">
              {order.orderItems.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 last:border-0 gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-gray-50 rounded flex justify-center items-center p-1">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <Link
                      to={`/product/${item.product}`}
                      className="hover:text-amazon-yellow text-blue-700 font-medium transition-colors line-clamp-2 max-w-xs"
                    >
                      {item.name}
                    </Link>
                  </div>
                  <div className="text-gray-600 font-medium pl-20 sm:pl-0">
                    {item.qty} x ₹{item.price} ={" "}
                    <span className="text-gray-900 font-bold">
                      ₹{item.qty * item.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-24">
            <h2 className="text-lg font-bold mb-4 border-b pb-3 text-amazon-light">
              Order Summary
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Items Total</span>
                <span>₹{order.itemsPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{order.shippingPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (18%)</span>
                <span>₹{order.taxPrice}</span>
              </div>
              <div className="flex justify-between font-bold text-xl border-t border-gray-200 pt-3 text-red-700 mt-2">
                <span>Order Total</span>
                <span>₹{order.totalPrice}</span>
              </div>
            </div>

            {/* CANCEL BUTTON HANDLER */}
            {!order.isCancelled && !order.isDelivered && (
              <button
                onClick={async () => {
                  if (
                    window.confirm(
                      "Are you sure you want to cancel? Items will be restocked.",
                    )
                  ) {
                    setCancelLoading(true);
                    try {
                      await axios.put(
                        `/api/orders/${id}/cancel`,
                        {},
                        {
                          headers: { Authorization: `Bearer ${user.token}` },
                        },
                      );
                      alert("Order cancelled.");
                      window.location.reload();
                    } catch (err) {
                      alert(err.response?.data?.message || "Error");
                      setCancelLoading(false);
                    }
                  }
                }}
                disabled={cancelLoading}
                className="block w-full bg-white border-2 border-red-500 text-red-600 font-bold text-center py-3 rounded-md shadow-sm mt-6 hover:bg-red-50 transition-colors"
              >
                {cancelLoading ? "Cancelling..." : "Cancel Order"}
              </button>
            )}

            <Link
              to="/"
              className="block w-full bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue font-bold text-center py-3 rounded-md shadow-sm mt-3 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
