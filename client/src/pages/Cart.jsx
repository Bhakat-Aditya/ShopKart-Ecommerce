import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from "lucide-react";

const Cart = () => {
  const { cartItems, removeFromCart, addToCart } = useCart();
  const navigate = useNavigate();

  const checkoutHandler = () => {
    navigate("/login?redirect=shipping");
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cartItems
    .reduce((acc, item) => acc + item.qty * item.price, 0)
    .toFixed(2);

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 font-outfit text-center">
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 max-w-lg mx-auto">
          <ShoppingBag size={64} className="mx-auto text-gray-200 mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-gray-500 mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link
            to="/"
            className="bg-amazon-blue text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
          >
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 font-outfit bg-gray-50 min-h-[90vh]">
      <h1 className="text-3xl font-bold mb-8 text-amazon-blue">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 transition-transform hover:shadow-md"
            >
              {/* Image */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-lg flex items-center justify-center p-2 flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Details */}
              <div className="flex-grow text-center sm:text-left">
                <Link
                  to={`/product/${item._id}`}
                  className="text-lg font-bold text-gray-800 hover:text-amazon-yellow transition-colors line-clamp-2"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-gray-500 mt-1">{item.brand}</p>
                <div className="text-xl font-bold text-gray-900 mt-2">
                  ₹{item.price}
                </div>

                {/* Stock Status */}
                <p
                  className={`text-xs font-bold mt-1 ${item.countInStock > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {item.countInStock > 0 ? "In Stock" : "Out of Stock"}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-center gap-4">
                {/* Qty Selector */}
                <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50">
                  <button
                    disabled={item.qty <= 1}
                    onClick={() => addToCart(item, item.qty - 1)}
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-l-lg disabled:opacity-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-3 font-bold text-sm w-8 text-center">
                    {item.qty}
                  </span>
                  <button
                    disabled={item.qty >= item.countInStock}
                    onClick={() => addToCart(item, item.qty + 1)}
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-r-lg disabled:opacity-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Delete */}
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                >
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Checkout Box */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-4">
              Order Summary
            </h2>

            <div className="flex justify-between items-center mb-2 text-gray-600">
              <span>Subtotal ({totalItems} items):</span>
              <span className="font-bold text-gray-900">₹{totalPrice}</span>
            </div>

            <p className="text-xs text-green-600 mb-6">
              Eligible for FREE Delivery
            </p>

            <button
              onClick={checkoutHandler}
              disabled={cartItems.length === 0}
              className="w-full bg-amazon-yellow text-amazon-blue font-bold py-3.5 rounded-lg shadow-md hover:bg-yellow-400 transition-all transform active:scale-95 flex justify-center items-center gap-2"
            >
              Proceed to Checkout <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
