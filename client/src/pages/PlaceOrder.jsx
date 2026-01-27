import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Loader } from "lucide-react";

const PlaceOrder = () => {
  const { cartItems, shippingAddress } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- 1. Calculations ---
  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };

  const itemsPrice = Number(
    cartItems.reduce((acc, item) => acc + item.price * item.qty, 0),
  );

  // DELIVERY LOGIC:
  // 1. Base Shipping: ₹0 if total > 500, else ₹75
  const baseShipping = itemsPrice > 500 ? 0 : 75;

  // 2. Express Fee: ₹85 if 'isExpress' is true, else 0
  const expressCost = shippingAddress.isExpress ? 85 : 0;

  // 3. Final Shipping Cost
  const shippingPrice = baseShipping + expressCost;

  const taxPrice = Number((0.18 * itemsPrice).toFixed(2)); // 18% GST

  const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2);

  // --- 2. Redirect if missing data ---
  useEffect(() => {
    if (!shippingAddress.address) {
      navigate("/shipping");
    } else if (cartItems.length === 0) {
      navigate("/cart");
    }
  }, [shippingAddress, cartItems, navigate]);

  // --- 3. Place Order Handler ---
  const placeOrderHandler = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "/api/orders",
        {
          orderItems: cartItems,
          shippingAddress: shippingAddress,
          paymentMethod: "Stripe",
          itemsPrice: itemsPrice,
          shippingPrice: shippingPrice,
          taxPrice: taxPrice,
          totalPrice: totalPrice,
        },
        config,
      );

      alert("Order Placed Successfully!");
      navigate(`/order/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 font-outfit">
      <h1 className="text-2xl font-bold mb-6 text-amazon-blue">
        Review Your Order
      </h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Info */}
          <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-3 uppercase tracking-wide text-gray-700">
              Shipping
            </h2>
            <p className="text-gray-600 mb-2">
              <strong>Address: </strong>
              {shippingAddress.address}, {shippingAddress.city},{" "}
              {shippingAddress.postalCode}, {shippingAddress.country}
            </p>
            {/* Show Delivery Method Badge */}
            <div className="flex gap-2">
              <span
                className={`px-2 py-1 rounded text-xs font-bold ${baseShipping === 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
              >
                {baseShipping === 0
                  ? "Free Standard Delivery"
                  : "Standard Delivery"}
              </span>
              {shippingAddress.isExpress && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                  Express (+₹85)
                </span>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-3 uppercase tracking-wide text-gray-700">
              Order Items
            </h2>
            {cartItems.length === 0 ? (
              <p>Your cart is empty</p>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-contain rounded"
                      />
                      <Link
                        to={`/product/${item._id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {item.name}
                      </Link>
                    </div>
                    <div className="text-gray-600">
                      {item.qty} x ₹{item.price} ={" "}
                      <strong>₹{item.qty * item.price}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded shadow-sm border border-gray-200 sticky top-24">
            <h2 className="text-lg font-bold mb-4 text-center border-b pb-2">
              Order Summary
            </h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Items:</span>
                <span>₹{itemsPrice}</span>
              </div>

              {/* Detailed Shipping Breakdown */}
              <div className="flex justify-between text-gray-600">
                <span>Base Delivery:</span>
                <span>{baseShipping === 0 ? "FREE" : `₹${baseShipping}`}</span>
              </div>
              {shippingAddress.isExpress && (
                <div className="flex justify-between text-blue-600">
                  <span>Express Fee:</span>
                  <span>+₹85</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Tax (18%):</span>
                <span>₹{taxPrice}</span>
              </div>

              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg text-red-700">
                <span>Order Total:</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue font-bold py-3 rounded shadow-sm mt-6 transition-colors flex justify-center items-center"
              disabled={cartItems.length === 0 || loading}
              onClick={placeOrderHandler}
            >
              {loading ? <Loader className="animate-spin" /> : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
