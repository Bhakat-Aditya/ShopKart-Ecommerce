import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import {
  Loader,
  Package,
  MapPin,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";

const SellerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get("/api/orders/seller", config);
        setOrders(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (loading)
    return (
      <div className="p-10 flex justify-center">
        <Loader className="animate-spin" />
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 font-outfit">
      <h1 className="text-2xl font-bold mb-6 text-amazon-blue">
        Manage Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-600">No orders yet</h3>
          <p className="text-gray-400">
            Your products haven't been purchased yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Order ID
                  </span>
                  <p className="font-mono text-sm text-gray-800">
                    #{order._id}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Placed On
                  </span>
                  <p className="text-sm text-gray-800">
                    {order.createdAt.substring(0, 10)}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Customer
                  </span>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-400" />
                    <p className="text-sm font-bold text-gray-800">
                      {order.user?.name || "Guest"}
                    </p>
                  </div>
                </div>
                <div className="md:ml-auto">
                  {order.isPaid ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                      <CheckCircle size={14} /> Paid
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                      <XCircle size={14} /> Not Paid
                    </span>
                  )}
                </div>
              </div>

              {/* Order Items (Only THIS seller's items) */}
              <div className="p-6">
                <h4 className="font-bold text-sm mb-4 text-gray-600">
                  Items to Ship:
                </h4>
                <div className="space-y-4">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-contain border rounded bg-gray-50"
                      />
                      <div className="flex-grow">
                        <p className="font-bold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.qty} × ₹{item.price}
                        </p>
                      </div>
                      <div className="text-right font-bold">
                        ₹{item.qty * item.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Info & Actions */}
              <div className="bg-blue-50 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-2 max-w-md">
                  <MapPin
                    size={18}
                    className="text-blue-600 mt-1 flex-shrink-0"
                  />
                  <p className="text-sm text-gray-700">
                    <span className="font-bold">Shipping Address:</span>
                    <br />
                    {order.shippingAddress.address},{" "}
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.postalCode},{" "}
                    {order.shippingAddress.country}
                  </p>
                </div>
                {/* Future: Add "Mark as Shipped" button here */}
                <div className="text-lg font-bold text-amazon-blue">
                  Your Share: ₹{order.sellerTotal}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
