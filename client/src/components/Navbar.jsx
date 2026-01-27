import { ShoppingCart, User, Search, Menu, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // Hook for navigation

  const [keyword, setKeyword] = useState(""); // Search state

  const searchBarRef = useRef(null);
  const { contextSafe } = useGSAP();

  const handleSearchFocus = contextSafe(() => {
    gsap.to(searchBarRef.current, {
      width: "100%",
      duration: 0.4,
      ease: "power2.out",
    });
  });

  const handleSearchBlur = contextSafe(() => {
    gsap.to(searchBarRef.current, { width: "80%", duration: 0.4 });
  });

  // --- SEARCH HANDLER ---
  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword}`);
    } else {
      navigate("/");
    }
  };

  return (
    <nav className="bg-amazon-blue text-white sticky top-0 z-50 shadow-md font-outfit">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tighter flex items-center gap-1"
          >
            Shop<span className="text-amazon-yellow">Kart</span>
            <div className="h-2 w-2 bg-amazon-yellow rounded-full mt-3"></div>
          </Link>
        </div>

        {/* Search Bar (Updated) */}
        <div className="hidden md:flex flex-grow justify-center max-w-2xl relative">
          <form
            onSubmit={submitHandler}
            ref={searchBarRef}
            className="flex items-center bg-white rounded-md overflow-hidden w-[80%]"
          >
            <input
              type="text"
              className="w-full px-4 py-2 text-black outline-none"
              placeholder="Search ShopKart..."
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              onChange={(e) => setKeyword(e.target.value)} // Bind input
              value={keyword}
            />
            <button
              type="submit"
              className="bg-amazon-yellow text-amazon-blue p-2 hover:bg-yellow-500"
            >
              <Search size={22} />
            </button>
          </form>
        </div>

        {/* Right Icons (Keep existing code exactly as it was) */}
        <div className="flex items-center gap-6">
          {/* ... (Copy your existing User/Cart logic here) ... */}
          {/* If you need the full code block for this section let me know, 
               otherwise keep what you had for User/Cart/Orders */}

          {/* User Section */}
          {user ? (
            <div className="hidden md:flex flex-col text-xs leading-tight cursor-pointer group relative">
              <span className="text-gray-200">
                Hello, {user.name.split(" ")[0]}
              </span>
              <span className="font-bold text-sm">Account & Lists</span>
              <div className="absolute top-full right-0 mt-2 w-48 bg-white text-black rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2 z-50">
                <button
                  onClick={logout}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-red-600 font-bold"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:flex flex-col text-xs leading-tight cursor-pointer hover:underline"
            >
              <span className="text-gray-200">Hello, Sign in</span>
              <span className="font-bold text-sm">Account & Lists</span>
            </Link>
          )}

          <Link
            to="/myorders"
            className="hidden md:flex flex-col text-xs leading-tight cursor-pointer hover:underline"
          >
            <span className="text-gray-200">Returns</span>
            <span className="font-bold text-sm">& Orders</span>
          </Link>

          <Link
            to="/cart"
            className="flex items-end gap-1 relative hover:text-amazon-yellow transition-colors"
          >
            <div className="relative">
              <ShoppingCart size={28} />
              <span className="absolute -top-1 -right-2 bg-amazon-yellow text-amazon-blue text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            </div>
            <span className="font-bold hidden md:block mt-2">Cart</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
