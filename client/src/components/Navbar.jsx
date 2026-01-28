import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ShoppingCart, Search, Store, LayoutDashboard } from "lucide-react";

const Navbar = () => {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState(""); // Category State
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Amazon Categories
  const categories = [
    "Mobiles",
    "Computers",
    "TV, Audio & Cameras",
    "Appliances",
    "Fashion",
    "Home & Kitchen",
    "Beauty & Health",
    "Sports & Fitness",
    "Toys & Baby Products",
    "Books",
    "Video Games",
    "Automotive",
    "Tools & Home Improvement",
    "Pet Supplies",
    "Grocery & Gourmet Foods",
    "Office Products",
  ];

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      // Navigate with Keyword AND Category
      navigate(`/search/${keyword}?category=${category}`);
    } else {
      navigate("/");
    }
  };

  const logoutHandler = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-amazon-blue text-white p-2 md:p-3 font-outfit sticky top-0 z-50">
      <div className="container mx-auto flex flex-col md:flex-row items-center gap-3 md:gap-6">
        {/* Logo */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link
            to="/"
            className="text-2xl md:text-3xl font-bold tracking-tight hover:text-gray-200 flex items-center gap-1"
          >
            ShopKart <span className="text-amazon-yellow text-4xl">.</span>
          </Link>
          <div className="md:hidden flex gap-4">
            {user ? (
              <button
                onClick={logoutHandler}
                className="text-sm font-bold text-amazon-yellow"
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className="text-sm font-bold">
                Login
              </Link>
            )}
            <Link to="/cart" className="relative text-white">
              <ShoppingCart size={24} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-amazon-yellow text-amazon-blue text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={submitHandler}
          className="flex flex-grow w-full md:w-auto h-10 rounded-md overflow-hidden bg-white focus-within:ring-2 focus-within:ring-amazon-yellow"
        >
          {/* --- CATEGORY DROPDOWN --- */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-gray-100 text-gray-600 px-2 text-xs md:text-sm font-medium hover:bg-gray-200 border-r border-gray-300 outline-none cursor-pointer max-w-[80px] md:max-w-[150px] truncate"
          >
            <option value="">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {/* ------------------------- */}

          <input
            type="text"
            name="q"
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search ShopKart"
            className="flex-grow px-3 text-black outline-none placeholder-gray-500"
          />
          <button
            type="submit"
            className="bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue px-4 flex items-center justify-center transition-colors"
          >
            <Search size={22} />
          </button>
        </form>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          {user &&
            (user.isSeller ? (
              <Link
                to="/seller/dashboard"
                className="flex flex-col items-center border border-transparent hover:border-white p-2 rounded cursor-pointer"
              >
                <span className="text-xs text-gray-300">Seller</span>
                <span className="font-bold flex items-center gap-1 text-sm">
                  <LayoutDashboard size={16} /> Dashboard
                </span>
              </Link>
            ) : (
              <Link
                to="/seller/register"
                className="flex flex-col items-center border border-transparent hover:border-white p-2 rounded cursor-pointer"
              >
                <span className="text-xs text-gray-300">Become a</span>
                <span className="font-bold flex items-center gap-1 text-sm">
                  <Store size={16} /> Seller
                </span>
              </Link>
            ))}

          {user ? (
            <div className="group relative cursor-pointer border border-transparent hover:border-white p-2 rounded">
              <div className="text-xs text-gray-300">
                Hello, {user.name.split(" ")[0]}
              </div>
              <div className="font-bold text-sm">Account & Lists</div>

              <div className="absolute top-full right-0 w-48 bg-white rounded shadow-md text-gray-800 hidden group-hover:block border border-gray-200">
                <Link
                  to="/myorders"
                  className="block px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  My Orders
                </Link>
                <button
                  onClick={logoutHandler}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex flex-col border border-transparent hover:border-white p-2 rounded"
            >
              <span className="text-xs text-gray-300">Hello, sign in</span>
              <span className="font-bold text-sm">Account & Lists</span>
            </Link>
          )}

          <Link
            to="/cart"
            className="flex items-end gap-1 border border-transparent hover:border-white p-2 rounded"
          >
            <div className="relative">
              <ShoppingCart size={28} />
              <span className="absolute -top-1 -right-1 bg-amazon-yellow text-amazon-blue text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            </div>
            <span className="font-bold text-sm mb-1">Cart</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
