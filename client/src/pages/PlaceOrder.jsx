import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Loader } from "lucide-react";

const PlaceOrder = () => {
  const { cartItems, shippingAddress, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Math Logic
  const itemsPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );
  const baseShipping = itemsPrice > 500 ? 0 : 75;
  const expressCost = shippingAddress.isExpress ? 85 : 0;
  const shippingPrice = baseShipping + expressCost;
  const taxPrice = itemsPrice * 0.18;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  useEffect(() => {
    if (!shippingAddress.address) navigate("/shipping");
    else if (cartItems.length === 0) navigate("/cart");
  }, [shippingAddress, cartItems, navigate]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const placeOrderHandler = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      // 1. Create the Order in Database FIRST (Status: Not Paid)
      const { data: createdOrder } = await axios.post(
        "/api/orders",
        {
          orderItems: cartItems,
          shippingAddress: shippingAddress,
          paymentMethod: "Razorpay",
          itemsPrice: Number(itemsPrice.toFixed(2)),
          shippingPrice: Number(shippingPrice.toFixed(2)),
          taxPrice: Number(taxPrice.toFixed(2)),
          totalPrice: Number(totalPrice.toFixed(2)),
        },
        config,
      );

      // 2. Load Razorpay SDK
      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      // 3. Create Razorpay Order ID
      const { data: razorpayOrder } = await axios.post(
        "/api/payment/create-order",
        { amount: totalPrice.toFixed(2) },
        config,
      );

      const {
        data: { key },
      } = await axios.get("/api/payment/get-key");

      // 4. Open Razorpay Popup
      const options = {
        key: key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "ShopKart",
        description: "Complete your purchase",
        image: "https://cdn-icons-png.flaticon.com/512/4290/4290854.png",
        order_id: razorpayOrder.id,

        // --- PAYMENT SUCCESS HANDLER ---
        handler: async function (response) {
          try {
            // 5. Update Order to PAID in Database
            await axios.put(
              `/api/orders/${createdOrder._id}/pay`,
              {
                id: response.razorpay_payment_id,
                status: "success",
                update_time: new Date().toISOString(),
                email: user.email,
              },
              config,
            );

            // 6. Success! Clear cart & Redirect
            clearCart();
            navigate(`/order/${createdOrder._id}`);
          } catch (error) {
            console.error(error);
            alert(
              "Payment Successful, but server update failed. Please contact support.",
            );
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: "9999999999",
        },
        theme: {
          color: "#febd69",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
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
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-3 uppercase tracking-wide text-gray-700">
              Shipping
            </h2>
            <p className="text-gray-600 mb-2">
              <strong>Address: </strong>
              {shippingAddress.address}, {shippingAddress.city},{" "}
              {shippingAddress.postalCode}, {shippingAddress.country}
            </p>
          </div>
          <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-3 uppercase tracking-wide text-gray-700">
              Order Items
            </h2>
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
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded shadow-sm border border-gray-200 sticky top-24">
            <h2 className="text-lg font-bold mb-4 text-center border-b pb-2">
              Order Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Items:</span>
                <span>₹{itemsPrice.toFixed(2)}</span>
              </div>
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
                <span>₹{taxPrice.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg text-red-700">
                <span>Order Total:</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={placeOrderHandler}
              disabled={cartItems.length === 0 || loading}
              className="w-full bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue font-bold py-3 rounded shadow-sm mt-6 transition-colors flex justify-center items-center"
            >
              {loading ? (
                <Loader className="animate-spin" />
              ) : (
                "Pay & Place Order"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
