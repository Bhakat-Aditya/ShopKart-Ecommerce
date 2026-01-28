import { Link } from "react-router-dom";
import { Star, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);

  // --- FIX: CHECK IF ALREADY WISHLISTED ---
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (user) {
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          // Fetch latest wishlist to check status
          // Optimization: Ideally pass 'wishlist' prop from parent, but this works for standalone cards
          const { data } = await axios.get("/api/users/wishlist", config);

          // Check if THIS product is in the fetched list
          // The backend returns an array of populated objects, so we check ._id
          const found = data.some((item) => item._id === product._id);
          setIsWishlisted(found);
        } catch (error) {
          console.error("Wishlist check failed", error);
        }
      }
    };
    checkWishlistStatus();
  }, [user, product._id]);
  // ----------------------------------------

  const toggleWishlistHandler = async (e) => {
    e.preventDefault(); // Prevent navigating to product page
    if (!user) {
      alert("Please login to save items.");
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/users/wishlist/${product._id}`, {}, config);

      // Toggle state immediately for UI feedback
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update wishlist");
    }
  };

  // Calculate discount percentage if MRP exists
  const discount =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <Link
      to={`/product/${product._id}`}
      className="bg-white border border-gray-200 rounded-sm hover:shadow-lg transition-shadow p-4 flex flex-col h-full group cursor-pointer relative"
    >
      {/* --- HEART BUTTON --- */}
      <button
        onClick={toggleWishlistHandler}
        className="absolute top-2 right-2 z-10 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors shadow-sm"
        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        <Heart
          size={18}
          className={`transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`}
        />
      </button>
      {/* -------------------- */}

      {/* Image Container */}
      <div className="bg-gray-100 h-48 flex justify-center items-center rounded-sm mb-4 relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            {discount}% off
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex-grow flex flex-col">
        <h3 className="text-gray-900 font-medium text-lg leading-snug mb-1 group-hover:text-amazon-yellow transition-colors line-clamp-2">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                fill={i < product.rating ? "currentColor" : "none"}
                className={i >= product.rating ? "text-gray-300" : ""}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-2">
            {product.numReviews}
          </span>
        </div>

        {/* Price Section */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">
              ₹{product.price}
            </span>
            {product.mrp > product.price && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.mrp}
              </span>
            )}
          </div>
          {product.mrp > product.price && (
            <p className="text-xs text-gray-500">
              Save ₹{product.mrp - product.price} ({discount}%)
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
