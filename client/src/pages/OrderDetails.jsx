import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";
import { Printer } from "lucide-react";

import {
  Loader,
  Check,
  Package,
  Truck,
  Calendar,
  MapPin,
  CreditCard,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        "Are you sure you want to cancel this order?",
        "Cancel Order",
      )
    ) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`/api/orders/${id}`, config);
        toast.success("Order Cancelled Successfully");
        navigate("/myorders");
      } catch (err) {
        toast.error(err.response?.data?.message || "Could not cancel order");
      }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader className="animate-spin text-amazon-blue" size={40} />
      </div>
    );
  if (error)
    return (
      <div className="text-red-500 text-center p-20 text-lg font-medium">
        {error}
      </div>
    );
  if (!order)
    return (
      <div className="text-center p-20 text-gray-500">Order not found</div>
    );

  // --- LOGIC FOR PROGRESS BAR ---
  const steps = [
    { label: "Ordered", icon: Package },
    { label: "Shipped", icon: Truck },
    { label: "Out for Delivery", icon: Truck },
    { label: "Delivered", icon: Check },
  ];

  // Determine current step index
  const statusList = ["Processing", "Shipped", "Out for Delivery", "Delivered"];
  let currentStep = statusList.indexOf(order.orderStatus || "Processing");
  if (order.isDelivered) currentStep = 3;

  // Format Date Helper
  const formatDate = (dateString) => {
    if (!dateString) return "Pending";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-12 font-outfit">
      {/* --- TOP BAR / BREADCRUMBS --- */}
      <div className="bg-white border-b shadow-sm sticky top-[60px] z-30">
        <div className="container mx-auto px-4 py-3 max-w-6xl flex items-center gap-2 text-sm text-gray-500">
          <Link
            to="/myorders"
            className="hover:text-amazon-blue flex items-center gap-1"
          >
            <ArrowLeft size={16} /> Back to Orders
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-gray-900">Order #{order._id}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        {/* --- 1. TRACKING HERO SECTION --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Status Banner */}
          <div
            className={`p-6 md:p-8 ${order.isDelivered ? "bg-green-50" : "bg-gradient-to-r from-blue-50 to-white"}`}
          >
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h1
                  className={`text-3xl md:text-4xl font-bold mb-2 ${order.isDelivered ? "text-green-700" : "text-gray-900"}`}
                >
                  {order.isDelivered
                    ? "Delivered"
                    : order.expectedDelivery
                      ? `Arriving ${formatDate(order.expectedDelivery)}`
                      : "Order Processing"}
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  {order.isDelivered
                    ? "Package was handed directly to a resident."
                    : "We are working on getting your package to you."}
                </p>
              </div>
              {/* Invoice / Actions */}
              <div className="flex gap-3">
                {!order.isDelivered && !order.isCancelled && (
                  <button
                    onClick={cancelOrderHandler}
                    className="px-4 py-2 bg-white border border-gray-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-bold shadow-sm transition-all"
                  >
                    Cancel Order
                  </button>
                )}
                <button
                  onClick={() => navigate(`/order/${order._id}/invoice`)}
                  className="border border-gray-300 bg-white shadow-sm px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Printer size={16} /> Invoice
                </button>
              </div>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="p-8 md:px-16 bg-white relative">
            {/* Gray Background Line */}
            <div className="absolute top-12 left-16 right-16 h-1 bg-gray-200 rounded-full hidden md:block"></div>

            {/* Active Green Line */}
            <div
              className="absolute top-12 left-16 h-1 bg-green-600 rounded-full transition-all duration-1000 hidden md:block"
              style={{
                width: `calc(${(currentStep / (steps.length - 1)) * 100}% - 4rem)`,
              }}
            ></div>

            <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0">
              {steps.map((step, index) => {
                const isCompleted = index <= currentStep;
                const isCurrent = index === currentStep;

                return (
                  <div
                    key={index}
                    className="flex md:flex-col items-center gap-4 md:gap-2"
                  >
                    {/* Dot / Icon Circle */}
                    <div
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                                    ${
                                      isCompleted
                                        ? "bg-green-600 border-green-600 text-white shadow-md scale-110"
                                        : "bg-white border-gray-300 text-gray-300"
                                    }`}
                    >
                      {isCompleted ? (
                        <Check size={20} strokeWidth={3} />
                      ) : (
                        <step.icon size={18} />
                      )}
                    </div>

                    {/* Label */}
                    <div
                      className={`md:text-center transition-colors duration-300 ${isCompleted ? "text-green-700 font-bold" : "text-gray-400 font-medium"}`}
                    >
                      <p className="text-sm md:text-base">{step.label}</p>
                      {/* Optional: Add timestamps here if available in order object */}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- 2. ORDER INFO GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b">
              <MapPin size={18} className="text-amazon-orange" /> Shipping
              Address
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-bold text-gray-900 text-base">{user.name}</p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b">
              <CreditCard size={18} className="text-amazon-orange" /> Payment
              Method
            </h3>
            <div className="text-sm">
              <p className="font-medium text-gray-900 flex items-center gap-2 mb-2">
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                  <Check size={12} /> Payment Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                  <AlertCircle size={12} /> Pay on Delivery
                </span>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b">
              Order Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal:</span>
                <span>₹{order.itemsPrice}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping:</span>
                <span>
                  {order.shippingPrice === 0
                    ? "Free"
                    : `₹${order.shippingPrice}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax:</span>
                <span>₹{order.taxPrice}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t mt-2">
                <span>Order Total:</span>
                <span className="text-red-700">₹{order.totalPrice}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- 3. ITEMS LIST --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Package size={20} /> Items in this shipment
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {order.orderItems.map((item, index) => (
              <div
                key={index}
                className="p-6 flex flex-col md:flex-row items-start gap-6 hover:bg-gray-50 transition-colors"
              >
                <div className="w-24 h-24 flex-shrink-0 bg-white border rounded-lg p-2 flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain mix-blend-multiply"
                  />
                </div>

                <div className="flex-grow">
                  <Link
                    to={`/product/${item.product}`}
                    className="text-lg font-medium text-amazon-blue hover:underline hover:text-orange-600 transition-colors line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    Sold by:{" "}
                    <span className="text-gray-700">ShopKart Retail</span>
                  </p>
                  <div className="mt-2 flex items-center gap-4">
                    <span className="font-bold text-gray-900">
                      ₹{item.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      Qty: {item.qty}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0 w-full md:w-auto">
                  <button className="w-full md:w-auto px-6 py-2 bg-amazon-yellow hover:bg-yellow-400 text-sm font-bold rounded shadow-sm transition-colors">
                    Buy it again
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
