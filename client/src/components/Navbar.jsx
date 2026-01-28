import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  ShoppingCart,
  Search,
  Store,
  LayoutDashboard,
  Menu,
  X,
  User,
  LogOut,
  MapPin,
  Package,
} from "lucide-react";

const Navbar = () => {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for Mobile Menu

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
    // Navigate to the new SearchPage with query params
    if (keyword.trim()) {
      navigate(`/search?keyword=${keyword}&category=${category}`);
      setIsMenuOpen(false);
    } else {
      // If no keyword but category selected, go to search page too
      if (category) {
        navigate(`/search?category=${category}`);
      } else {
        navigate("/");
      }
    }
  };

  const logoutHandler = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-amazon-blue text-white p-2 md:p-3 font-outfit sticky top-0 z-50">
      <div className="container mx-auto flex flex-col md:flex-row items-center gap-3 md:gap-6">
        {/* --- ROW 1: Logo + Mobile Actions --- */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link
            to="/"
            className="text-2xl md:text-3xl font-bold tracking-tight hover:text-gray-200 flex items-center gap-1"
            onClick={() => setIsMenuOpen(false)}
          >
            ShopKart <span className="text-amazon-yellow text-4xl">.</span>
          </Link>

          {/* MOBILE ICONS (Cart + Hamburger) */}
          <div className="md:hidden flex items-center gap-4">
            {/* Cart (Always Visible) */}
            <Link
              to="/cart"
              className="relative text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingCart size={24} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-amazon-yellow text-amazon-blue text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* Hamburger Button */}
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* --- ROW 2: Search Bar (Always Visible) --- */}
        <form
          onSubmit={submitHandler}
          className="flex flex-grow w-full md:w-auto h-10 rounded-md overflow-hidden bg-white focus-within:ring-2 focus-within:ring-amazon-yellow"
        >
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

        {/* --- DESKTOP NAVIGATION (Hidden on Mobile) --- */}
        <div className="hidden md:flex items-center gap-6">
          {/* Seller Link */}
          {user &&
            (user.isSeller ? (
              <Link
                to="/seller/dashboard"
                className="flex flex-col items-center hover:border-white border border-transparent p-2 rounded"
              >
                <span className="text-xs text-gray-300">Seller</span>
                <span className="font-bold flex items-center gap-1 text-sm">
                  <LayoutDashboard size={16} /> Dashboard
                </span>
              </Link>
            ) : (
              <Link
                to="/seller/register"
                className="flex flex-col items-center hover:border-white border border-transparent p-2 rounded"
              >
                <span className="text-xs text-gray-300">Become a</span>
                <span className="font-bold flex items-center gap-1 text-sm">
                  <Store size={16} /> Seller
                </span>
              </Link>
            ))}

          {/* Account Dropdown */}
          {user ? (
            <div className="group relative cursor-pointer border border-transparent hover:border-white p-2 rounded">
              <div className="text-xs text-gray-300">
                Hello, {user.name.split(" ")[0]}
              </div>
              <div className="font-bold text-sm">Account & Lists</div>
              <div className="absolute top-full right-0 w-48 bg-white rounded shadow-md text-gray-800 hidden group-hover:block border border-gray-200">
                <Link
                  to="/profile"
                  className="block px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  My Profile
                </Link>
                <Link
                  to="/addresses"
                  className="block px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  Your Addresses
                </Link>
                <Link
                  to="/wishlist"
                  className="block px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  Your Wishlist
                </Link>
                <Link
                  to="/myorders"
                  className="block px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  My Orders
                </Link>
                {user.isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="block px-4 py-2 hover:bg-gray-100 text-sm font-bold text-purple-600"
                  >
                    Admin Dashboard
                  </Link>
                )}
                {user.isAdmin && (
                  <Link
                    to="/admin/users"
                    className="block px-4 py-2 hover:bg-gray-100 text-sm font-bold text-purple-600"
                  >
                    Manage Sellers
                  </Link>
                )}
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

          {/* Cart Desktop */}
          <Link
            to="/cart"
            className="flex items-end gap-1 border border-transparent hover:border-white p-2 rounded"
          >
            <div className="relative">
              <ShoppingCart size={28} />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amazon-yellow text-amazon-blue text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </div>
            <span className="font-bold text-sm mb-1">Cart</span>
          </Link>
        </div>
      </div>

      {/* --- MOBILE MENU OVERLAY (Visible only when isMenuOpen is true) --- */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-[100%] left-0 w-full bg-white text-gray-800 shadow-xl border-t border-gray-200 z-40">
          <div className="p-4 bg-amazon-light text-white flex items-center gap-3">
            <User
              size={24}
              className="bg-white text-amazon-light p-1 rounded-full w-8 h-8"
            />
            <span className="font-bold text-lg">
              Hello, {user ? user.name.split(" ")[0] : "Guest"}
            </span>
          </div>

          <div className="py-2">
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={toggleMenu}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-gray-100 text-sm font-medium border-b border-gray-100"
                >
                  <User size={18} /> My Profile
                </Link>
                <Link
                  to="/myorders"
                  onClick={toggleMenu}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-gray-100 text-sm font-medium border-b border-gray-100"
                >
                  <Package size={18} /> My Orders
                </Link>
                <Link
                  to="/addresses"
                  onClick={toggleMenu}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-gray-100 text-sm font-medium border-b border-gray-100"
                >
                  <MapPin size={18} /> Saved Addresses
                </Link>

                {/* Seller Link Mobile */}
                {user.isSeller ? (
                  <Link
                    to="/seller/dashboard"
                    onClick={toggleMenu}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-gray-100 text-sm font-medium border-b border-gray-100 text-blue-600"
                  >
                    <LayoutDashboard size={18} /> Seller Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/seller/register"
                    onClick={toggleMenu}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-gray-100 text-sm font-medium border-b border-gray-100 text-blue-600"
                  >
                    <Store size={18} /> Become a Seller
                  </Link>
                )}

                <button
                  onClick={logoutHandler}
                  className="w-full flex items-center gap-3 px-6 py-3 hover:bg-red-50 text-sm font-bold text-red-600 mt-2"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </>
            ) : (
              <div className="p-4 text-center">
                <p className="text-gray-600 mb-4 text-sm">
                  Sign in to see your orders and profile.
                </p>
                <Link
                  to="/login"
                  onClick={toggleMenu}
                  className="block w-full bg-amazon-yellow text-amazon-blue font-bold py-3 rounded mb-3"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={toggleMenu}
                  className="block w-full bg-gray-100 text-gray-800 font-bold py-3 rounded hover:bg-gray-200"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
