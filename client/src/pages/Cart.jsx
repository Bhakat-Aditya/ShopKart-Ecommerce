import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ArrowLeft, ShoppingBag } from "lucide-react";

const Cart = () => {
  const { cartItems, removeFromCart } = useCart();
  const navigate = useNavigate();

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.qty * item.price,
    0,
  );

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-gray-500 mb-6">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link
          to="/"
          className="bg-amazon-yellow text-amazon-blue px-6 py-2 rounded-full font-bold shadow-sm hover:bg-yellow-400"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-medium mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="flex flex-col sm:flex-row items-center gap-4 py-6 border-b border-gray-100 last:border-0"
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 object-contain"
              />

              {/* Details */}
              <div className="flex-grow text-center sm:text-left">
                <Link
                  to={`/product/${item._id}`}
                  className="text-lg font-medium hover:text-amazon-yellow text-amazon-blue"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-gray-500 mt-1">{item.brand}</p>
                <p className="text-green-600 text-sm font-medium mt-1">
                  In Stock
                </p>
              </div>

              {/* Price & Actions */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xl font-bold">
                  ₹{item.price * item.qty}
                </span>
                <span className="text-xs text-gray-500">
                  ({item.qty} x ₹{item.price})
                </span>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center mt-2"
                >
                  <Trash2 size={16} className="mr-1" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Summary Box */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-24">
            <h2 className="text-lg font-bold mb-4">
              Subtotal ({totalItems} items):
            </h2>
            <p className="text-3xl font-bold mb-6">₹{totalPrice}</p>

            <button
              onClick={() => navigate("/shipping")}
              className="w-full bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue font-bold py-3 rounded-md shadow-sm transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
