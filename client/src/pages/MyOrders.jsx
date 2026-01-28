import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { Loader, Package, Search } from "lucide-react";

const MyOrders = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get("/api/orders/myorders", config);
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  // Handle "Buy it again" logic
  const handleBuyAgain = async (productId) => {
    try {
      const { data } = await axios.get(`/api/products/${productId}`);
      if (data.countInStock > 0) {
        addToCart(data, 1);
        toast.success("Added to Cart");
        navigate("/cart");
      } else {
        toast.error("Product is currently out of stock");
      }
    } catch (error) {
      toast.error("Could not add product");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader className="animate-spin text-amazon-blue" />
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center p-10">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8 font-outfit max-w-5xl min-h-screen">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-500 mb-2">
        <Link to="/" className="hover:underline">
          Your Account
        </Link>{" "}
        › <span className="text-amazon-orange">Your Orders</span>
      </div>

      <div className="flex justify-between items-end mb-6 border-b pb-4">
        <h1 className="text-3xl font-normal text-gray-800">Your Orders</h1>

        {/* Search Orders (Visual Only) */}
        <div className="hidden md:flex items-center border border-gray-300 rounded overflow-hidden">
          <div className="bg-gray-100 px-2 py-2">
            <Search size={18} className="text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search all orders"
            className="px-2 py-1 outline-none text-sm w-64"
          />
          <button className="bg-gray-800 text-white px-4 py-1.5 text-sm font-bold rounded-full m-1">
            Search Orders
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 border rounded-lg">
          <Package size={48} className="mx-auto text-gray-300 mb-3" />
          <h2 className="text-xl text-gray-800">You have no orders yet.</h2>
          <Link
            to="/"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-300 rounded-lg bg-white overflow-hidden hover:shadow-sm transition-shadow"
            >
              {/* --- ORDER HEADER --- */}
              <div className="bg-gray-100 p-4 flex flex-col md:flex-row justify-between text-sm text-gray-600 gap-4">
                <div className="flex gap-8">
                  <div className="flex flex-col">
                    <span className="uppercase text-xs font-bold">
                      Order Placed
                    </span>
                    <span className="text-gray-800">
                      {order.createdAt.substring(0, 10)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="uppercase text-xs font-bold">Total</span>
                    <span className="text-gray-800">₹{order.totalPrice}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="uppercase text-xs font-bold">Ship To</span>
                    <span className="text-blue-600 group relative cursor-pointer hover:underline">
                      {user.name}
                      {/* Tooltip for Address */}
                      <div className="hidden group-hover:block absolute top-6 left-0 bg-white border shadow-lg p-2 rounded w-48 z-10 text-gray-800 text-xs">
                        {order.shippingAddress.address},{" "}
                        {order.shippingAddress.city}
                      </div>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col md:items-end">
                  <span className="uppercase text-xs font-bold">
                    Order # {order._id}
                  </span>
                  <div className="flex gap-4 mt-1">
                    {/* Link to Order Details */}
                    <Link
                      to={`/order/${order._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View Order Details
                    </Link>
                    <span className="text-gray-300">|</span>
                    <Link
                      to={`/order/${order._id}/invoice`}
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      Invoice
                    </Link>
                  </div>
                </div>
              </div>

              {/* --- ORDER BODY --- */}
              <div className="p-6">
                <h3 className="font-bold text-lg mb-4 text-gray-800">
                  {order.isDelivered
                    ? `Delivered ${order.deliveredAt?.substring(0, 10)}`
                    : order.orderStatus === "Shipped"
                      ? "Shipped"
                      : order.orderStatus === "Out for Delivery"
                        ? "Out for Delivery"
                        : "Arriving Soon"}
                </h3>

                <div className="flex flex-col md:flex-row justify-between gap-6">
                  {/* Items List */}
                  <div className="flex-1 space-y-4">
                    {order.orderItems.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-start">
                        {/* Product Image Link */}
                        <Link to={`/product/${item.product}`}>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-contain border p-1 rounded"
                          />
                        </Link>
                        <div>
                          <Link
                            to={`/product/${item.product}`}
                            className="text-blue-600 font-medium hover:underline line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-gray-500 mt-1">
                            Return window closed on{" "}
                            {new Date().toLocaleDateString()}
                          </p>

                          {/* Buy Again Button */}
                          <button
                            onClick={() => handleBuyAgain(item.product)}
                            className="bg-amazon-yellow text-sm px-3 py-1 rounded-lg mt-2 hover:bg-yellow-400 border border-yellow-500 shadow-sm transition-colors"
                          >
                            Buy it again
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="md:w-64 flex flex-col gap-2">
                    {/* Track Package Button -> Goes to Order Details */}
                    <button
                      onClick={() => navigate(`/order/${order._id}`)}
                      className="w-full bg-white border border-gray-300 py-1.5 rounded-lg text-sm text-center shadow-sm hover:bg-gray-50 font-medium"
                    >
                      Track Package
                    </button>

                    <button className="w-full bg-white border border-gray-300 py-1.5 rounded-lg text-sm shadow-sm hover:bg-gray-50 text-gray-400 cursor-not-allowed">
                      Write a product review
                    </button>
                    <button className="w-full bg-white border border-gray-300 py-1.5 rounded-lg text-sm shadow-sm hover:bg-gray-50 text-gray-400 cursor-not-allowed">
                      Leave seller feedback
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
