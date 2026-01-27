import { ShoppingCart, User, Search, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  // Refs for GSAP animations
  const searchBarRef = useRef(null);
  const searchInputRef = useRef(null);

  // GSAP Animation: Expand Search Bar on Focus
  const { contextSafe } = useGSAP();

  const handleSearchFocus = contextSafe(() => {
    gsap.to(searchBarRef.current, {
      width: "100%", // Expands to fill available space
      duration: 0.4,
      ease: "power2.out",
      boxShadow: "0px 0px 10px rgba(254, 189, 105, 0.5)", // Amazon yellow glow
    });
  });

  const handleSearchBlur = contextSafe(() => {
    gsap.to(searchBarRef.current, {
      width: "80%", // Shrinks back
      duration: 0.4,
      ease: "power2.in",
      boxShadow: "none",
    });
  });
  const { cartItems } = useCart();

  return (
    <nav className="bg-amazon-blue text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* 1. Logo & Mobile Menu */}
        <div className="flex items-center gap-2">
          <button className="md:hidden text-white">
            <Menu size={24} />
          </button>
          <Link
            to="/"
            className="text-2xl font-bold tracking-tighter flex items-center gap-1"
          >
            Shop<span className="text-amazon-yellow">Kart</span>
            <div className="h-2 w-2 bg-amazon-yellow rounded-full mt-3"></div>
          </Link>
        </div>

        {/* 2. Search Bar (Hidden on mobile for now, visible md+) */}
        <div className="hidden md:flex flex-grow justify-center max-w-2xl relative">
          <div
            ref={searchBarRef}
            className="flex items-center bg-white rounded-md overflow-hidden w-[80%] transition-all"
          >
            <div className="bg-gray-100 px-3 py-2 text-gray-600 border-r border-gray-300 text-sm cursor-pointer hover:bg-gray-200">
              All
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className="w-full px-4 py-2 text-black outline-none"
              placeholder="Search ShopKart..."
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            <button className="bg-amazon-yellow text-amazon-blue p-2 hover:bg-yellow-500 transition-colors">
              <Search size={22} />
            </button>
          </div>
        </div>

        {/* 3. Right Icons (User & Cart) */}
        <div className="flex items-center gap-6">
          {/* Sign In / Profile */}
          <div className="hidden md:flex flex-col text-xs leading-tight cursor-pointer hover:underline">
            <span className="text-gray-200">Hello, Sign in</span>
            <span className="font-bold text-sm">Account & Lists</span>
          </div>

          {/* Returns & Orders */}
          <div className="hidden md:flex flex-col text-xs leading-tight cursor-pointer hover:underline">
            <span className="text-gray-200">Returns</span>
            <span className="font-bold text-sm">& Orders</span>
          </div>

          {/* Cart Icon */}
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

      {/* Mobile Search Bar (Only visible on small screens) */}
      <div className="md:hidden px-4 pb-3">
        <div className="flex items-center bg-white rounded-md overflow-hidden w-full">
          <input
            type="text"
            className="w-full px-4 py-2 text-black outline-none"
            placeholder="Search ShopKart..."
          />
          <button className="bg-amazon-yellow text-amazon-blue p-2">
            <Search size={22} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
