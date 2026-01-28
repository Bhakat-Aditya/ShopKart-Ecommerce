import { useConfirm } from "../context/ConfirmContext";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  Loader,
  CheckCircle,
  Package,
  XCircle,
  Trash2,
  Truck,
} from "lucide-react"; // Removed MapPin, CreditCard imports if unused or use them

const OrderDetails = () => {
  const confirm = useConfirm();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Unused state removed: const [deliverLoading, setDeliverLoading] = useState(false);

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
    if (user) fetchOrder();
  }, [id, user]);

  const cancelOrderHandler = async () => {
    if (
      await confirm(
        "Are you sure you want to cancel this order? This cannot be undone.",
        "Cancel Order",
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

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader className="animate-spin" />
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center p-20">{error}</div>;
  if (!order)
    return <div className="text-center p-20 text-red-500">Order not found</div>;

  // --- LOGIC FOR TRACKING BAR ---
  // Steps: Ordered -> Shipped -> Out for Delivery -> Delivered
  let currentStep = 1;
  if (order.isPaid) currentStep = 2; // Assume paid means preparing/shipped
  if (order.isDelivered) currentStep = 4; // Final step

  const getStepClass = (step) => {
    if (currentStep >= step) return "text-amazon-green font-bold";
    return "text-gray-400";
  };

  const getBarClass = (step) => {
    if (currentStep >= step) return "bg-green-600";
    return "bg-gray-200";
  };

  return (
    <div className="container mx-auto px-4 py-8 font-outfit max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl text-gray-800 font-normal">
            View order details
          </h1>
          <div className="text-sm text-gray-500 mt-1">
            Ordered on {new Date(order.createdAt).toLocaleDateString()} | Order
            # {order._id}
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          {!order.isDelivered && !order.isCancelled && (
            <button
              onClick={cancelOrderHandler}
              className="border border-red-300 bg-white text-red-600 shadow-sm px-4 py-1.5 rounded-lg text-sm hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 size={16} /> Cancel Order
            </button>
          )}
          <button className="border border-gray-300 bg-white shadow-sm px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50">
            Invoice
          </button>
        </div>
      </div>

      {/* --- SHIPPING INFO BOX --- */}
      <div className="border border-gray-300 rounded-lg p-4 md:p-6 mb-8 bg-white grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        <div>
          <h3 className="font-bold text-gray-700 mb-2">Shipping Address</h3>
          <p className="font-medium text-gray-900">{user.name}</p>
          <p>{order.shippingAddress.address}</p>
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.postalCode}
          </p>
          <p>{order.shippingAddress.country}</p>
        </div>
        <div>
          <h3 className="font-bold text-gray-700 mb-2">Payment Method</h3>
          <p className="flex items-center gap-2">
            <span className="font-medium text-gray-800">
              {order.paymentMethod}
            </span>
          </p>
          <div className="mt-2">
            {order.isPaid ? (
              <span className="text-green-600 font-bold flex items-center gap-1 text-xs uppercase tracking-wide border border-green-200 bg-green-50 px-2 py-1 rounded w-fit">
                <CheckCircle size={14} /> Paid
              </span>
            ) : (
              <span className="text-red-600 font-bold flex items-center gap-1 text-xs uppercase tracking-wide border border-red-200 bg-red-50 px-2 py-1 rounded w-fit">
                <XCircle size={14} /> Pending
              </span>
            )}
          </div>
        </div>
        <div>
          <h3 className="font-bold text-gray-700 mb-2">Order Summary</h3>
          <div className="flex justify-between mb-1">
            <span>Item(s) Subtotal:</span>
            <span>₹{order.itemsPrice || 0}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Shipping:</span>
            <span>
              {order.shippingPrice === 0 ? "FREE" : `₹${order.shippingPrice}`}
            </span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Tax:</span>
            <span>₹{order.taxPrice || 0}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-800 mt-2 pt-2 border-t">
            <span>Grand Total:</span>
            <span>₹{order.totalPrice}</span>
          </div>
        </div>
      </div>

      {/* --- TRACKING SECTION --- */}
      <div className="border border-gray-300 rounded-lg bg-white mb-8 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
            {order.isDelivered ? (
              <CheckCircle className="text-green-600" />
            ) : (
              <Truck className="text-amazon-blue" />
            )}
            {order.isDelivered ? "Delivered" : "Arriving Soon"}
          </h2>
          <p className="text-green-600 text-sm ml-8">
            {order.isDelivered
              ? "Package was handed to resident."
              : "On the way"}
          </p>
        </div>

        {/* PROGRESS BAR */}
        <div className="p-6 md:px-12 bg-white">
          <div className="relative flex justify-between items-center mb-2">
            {/* Lines */}
            <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-200 -z-20 rounded-full"></div>

            {/* Overlay Green Bar based on step */}
            <div
              className={`absolute top-1/2 left-0 h-1.5 bg-green-600 -z-10 transition-all duration-1000 rounded-full`}
              style={{
                width:
                  currentStep === 1
                    ? "0%"
                    : currentStep === 2
                      ? "33%"
                      : currentStep === 3
                        ? "66%"
                        : "100%",
              }}
            ></div>

            {/* Dots */}
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${currentStep >= step ? "bg-green-600 scale-110" : "bg-gray-200"}`}
              ></div>
            ))}
          </div>

          {/* Labels */}
          <div className="flex justify-between text-xs md:text-sm mt-2 font-medium">
            <span className={getStepClass(1)}>Ordered</span>
            <span className={getStepClass(2)}>Shipped</span>
            <span className={getStepClass(3)}>Out for Delivery</span>
            <span className={getStepClass(4)}>Delivered</span>
          </div>
        </div>

        {/* ITEMS IN PACKAGE */}
        <div className="p-6 border-t border-gray-200">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Package size={18} /> Package Contents
          </h3>
          {order.orderItems.map((item, index) => (
            <div key={index} className="flex gap-4 mb-4 last:mb-0 items-center">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-contain mix-blend-multiply border rounded bg-white p-1"
              />
              <div className="flex-1">
                <Link
                  to={`/product/${item.product}`}
                  className="text-blue-600 font-bold hover:underline line-clamp-1"
                >
                  {item.name}
                </Link>
                <p className="text-xs text-gray-500">
                  Sold by: ShopKart Retail
                </p>
                <div className="flex gap-4 mt-1 items-center">
                  <span className="text-sm font-bold text-gray-800">
                    ₹{item.price}
                  </span>
                  <span className="text-xs text-gray-500">Qty: {item.qty}</span>
                </div>
              </div>
              <button className="hidden sm:block text-sm bg-amazon-yellow text-amazon-blue px-4 py-1.5 rounded shadow-sm hover:bg-yellow-400 font-medium transition-colors">
                Buy it again
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
