import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart(); // Use updateQuantity
  const navigate = useNavigate();

  const total = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

  const checkoutHandler = () => {
    navigate("/login?redirect=/shipping");
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center font-outfit">
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <Link
          to="/"
          className="bg-amazon-yellow text-amazon-blue px-6 py-2 rounded-full font-bold hover:bg-yellow-400 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 font-outfit">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="flex gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 object-contain"
              />
              <div className="flex-grow">
                <Link
                  to={`/product/${item._id}`}
                  className="font-bold text-lg text-gray-800 hover:text-blue-600"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-gray-500 mb-2">{item.brand}</p>
                <p className="font-bold text-xl">₹{item.price}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <div className="flex items-center border border-gray-300 rounded">
                  {/* --- FIX: Use updateQuantity --- */}
                  <button
                    className="p-1 px-3 hover:bg-gray-100 disabled:opacity-50"
                    disabled={item.qty <= 1}
                    onClick={() => updateQuantity(item._id, item.qty - 1)}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-2 font-bold">{item.qty}</span>
                  <button
                    className="p-1 px-3 hover:bg-gray-100 disabled:opacity-50"
                    disabled={item.qty >= item.countInStock}
                    onClick={() => updateQuantity(item._id, item.qty + 1)}
                  >
                    <Plus size={16} />
                  </button>
                  {/* ----------------------------- */}
                </div>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm mt-2"
                >
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-4">
            <h2 className="text-xl font-bold mb-4">
              Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)}{" "}
              items)
            </h2>
            <p className="text-3xl font-bold mb-6">₹{total.toFixed(2)}</p>
            <button
              onClick={checkoutHandler}
              className="w-full bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
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
