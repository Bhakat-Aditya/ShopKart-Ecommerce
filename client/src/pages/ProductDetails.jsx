import { useToast } from "../context/ToastContext";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Star,
  ShoppingCart,
  ArrowLeft,
  Loader,
  Truck,
  ShieldCheck,
  Plus,
  Minus,
  AlertCircle,
  RefreshCw,
  Check,
  Zap, // Icon for Buy Now
  ChevronRight, // Icon for Breadcrumbs
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import ProductRow from "../components/ProductRow"; // <--- IMPORT THIS

const ProductDetails = () => {
  const toast = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  const [rating, setRating] = useState(5); // Default to 5 stars
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const [qty, setQty] = useState(1);
  const [isLiveUpdating, setIsLiveUpdating] = useState(false);

  const fetchProduct = useCallback(
    async (isBackground = false) => {
      try {
        if (!isBackground) setLoading(true);
        if (isBackground) setIsLiveUpdating(true);

        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);

        if (!isBackground) setLoading(false);
        if (isBackground) setIsLiveUpdating(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    fetchProduct(false);
    // Real-time stock updates (Polling)
    const interval = setInterval(() => {
      fetchProduct(true);
    }, 5000); // Increased to 5s to reduce server load
    return () => clearInterval(interval);
  }, [fetchProduct]);

  // Scroll to top when ID changes (clicked related product)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const cartItem = cartItems.find((item) => item._id === id);
  const qtyInCart = cartItem ? cartItem.qty : 0;
  const availableToAdd = product ? product.countInStock - qtyInCart : 0;

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAdded(true);
    toast.success("Added to Cart");
    setTimeout(() => setAdded(false), 2000);
  };

  // --- NEW: BUY NOW HANDLER ---
  const handleBuyNow = () => {
    addToCart(product, qty); // Add to cart
    navigate("/shipping"); // Skip cart, go straight to checkout
  };
  // ----------------------------

  const increaseQty = () => {
    if (qty < availableToAdd) setQty(qty + 1);
  };

  const decreaseQty = () => {
    if (qty > 1) setQty(qty - 1);
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (!comment) return alert("Please add a comment");
    setReviewLoading(true);
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.post(
        `/api/products/${id}/reviews`,
        { rating, comment },
        config,
      );
      toast.success("Review Submitted Successfully!");
      setReviewLoading(false);
      setRating(5);
      setComment("");
      await fetchProduct(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Review Failed");
      setReviewLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader className="animate-spin text-amazon-blue" size={40} />
      </div>
    );
  if (error)
    return (
      <div className="text-red-500 text-center py-20 font-bold">
        Error: {error}
      </div>
    );
  if (!product)
    return <div className="text-center py-20">Product not found</div>;

  const discount =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <div className="container mx-auto px-4 py-4 font-outfit">
      {/* --- BREADCRUMBS --- */}
      <nav className="flex items-center text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-amazon-blue">
          Home
        </Link>
        <ChevronRight size={14} className="mx-2" />
        <Link
          to={`/search/category?category=${product.category}`}
          className="hover:text-amazon-blue"
        >
          {product.category}
        </Link>
        <ChevronRight size={14} className="mx-2" />
        <span className="text-gray-900 font-medium truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>
      {/* ------------------- */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Image */}
        <div className="flex justify-center items-center bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group h-fit">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-[400px] md:max-h-[500px] w-full object-contain transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
          />
          {discount > 0 && (
            <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col space-y-6">
          <div className="border-b border-gray-100 pb-6">
            <p className="text-xs text-amazon-blue font-bold tracking-widest uppercase mb-2 opacity-80">
              {product.brand}
            </p>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
              {product.name}
            </h1>
            <div className="flex items-center space-x-3">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < product.rating ? "currentColor" : "none"}
                    className={i >= product.rating ? "text-gray-300" : ""}
                  />
                ))}
              </div>
              <span className="text-blue-600 font-medium text-sm hover:underline cursor-pointer">
                {product.numReviews} verified ratings
              </span>
            </div>
          </div>

          <div className="py-2">
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl md:text-4xl font-bold text-gray-900">
                ₹{product.price}
              </span>
              {product.mrp > product.price && (
                <span className="text-lg text-gray-400 line-through font-medium">
                  ₹{product.mrp}
                </span>
              )}
            </div>
            <p className="text-green-600 text-xs font-bold mt-1">
              Inclusive of all taxes
            </p>
          </div>

          <div className="flex gap-4 text-sm text-gray-600 py-2">
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg text-amazon-blue">
              <Truck size={18} />{" "}
              <span className="font-medium">Free Delivery</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg text-amazon-blue">
              <ShieldCheck size={18} />{" "}
              <span className="font-medium">1 Year Warranty</span>
            </div>
          </div>

          <div className="text-sm text-gray-500 py-2">
            Sold by:{" "}
            <Link
              to={`/shop/${product.user?._id || product.user}`}
              className="text-blue-600 hover:underline font-bold"
            >
              {product.user?.seller?.name ||
                product.user?.name ||
                "View Seller Shop"}
            </Link>
          </div>

          <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm mt-4 w-full md:max-w-md relative">
            <div className="absolute top-2 right-2">
              {isLiveUpdating && (
                <RefreshCw size={14} className="animate-spin text-gray-400" />
              )}
            </div>

            <div className="mb-5 flex justify-between items-center">
              <span
                className={`text-lg font-bold flex items-center gap-2 ${availableToAdd > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {availableToAdd > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {availableToAdd > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center border border-gray-300 rounded-md w-fit">
                  <button
                    onClick={decreaseQty}
                    disabled={qty <= 1}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 font-bold text-lg min-w-[3rem] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={increaseQty}
                    disabled={qty >= availableToAdd}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {/* BUY NOW BUTTON */}
              <button
                onClick={handleBuyNow}
                disabled={availableToAdd === 0}
                className="w-full flex items-center justify-center py-3 rounded-full shadow-sm text-base font-bold text-amazon-blue bg-amazon-yellow hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap size={20} className="mr-2 fill-current" /> Buy Now
              </button>

              {/* ADD TO CART BUTTON */}
              <button
                onClick={handleAddToCart}
                disabled={availableToAdd === 0}
                className={`w-full flex items-center justify-center py-3 rounded-full shadow-sm text-base font-bold transition-colors ${added ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
              >
                {added ? (
                  <>
                    <Check size={20} className="mr-2" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} className="mr-2" /> Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="font-bold text-gray-800 mb-2 text-md">
              Description
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* --- RELATED PRODUCTS --- */}
      {/* We reuse the ProductRow component, passing the current product's category */}
      <div className="mb-16">
        <ProductRow
          title={`More in ${product.category}`}
          category={product.category}
        />
      </div>
      {/* ------------------------ */}

      {/* REVIEWS SECTION */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-amazon-blue">
          Customer Reviews
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* List of Reviews */}
          <div className="lg:col-span-2 space-y-6">
            {(!product.reviews || product.reviews.length === 0) && (
              <div className="bg-gray-50 text-gray-500 p-6 rounded text-center">
                No reviews yet. Be the first to share your thoughts!
              </div>
            )}
            {product.reviews.map((review) => (
              <div
                key={review._id}
                className="border-b border-gray-100 pb-6 last:border-0"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600 text-lg uppercase shadow-inner">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">
                      {review.name}
                    </div>
                    <div className="flex text-yellow-400 text-xs mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < review.rating ? "currentColor" : "none"}
                          className={i >= review.rating ? "text-gray-300" : ""}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="ml-auto text-xs text-gray-400">
                    {review.createdAt.substring(0, 10)}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed ml-12 bg-gray-50 p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>

          {/* Write Review Form */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Write a Review</h3>
              {user ? (
                <form onSubmit={submitReviewHandler} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 text-gray-600 uppercase tracking-wider">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            size={24}
                            fill={star <= rating ? "#FBBF24" : "none"}
                            className={
                              star <= rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 text-gray-600 uppercase tracking-wider">
                      Comment
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:border-amazon-yellow outline-none h-32 resize-none text-sm"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="What did you like or dislike?"
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="w-full bg-amazon-blue hover:bg-gray-800 text-white font-bold py-2 rounded shadow transition-colors flex justify-center text-sm"
                  >
                    {reviewLoading ? (
                      <Loader className="animate-spin text-white" size={20} />
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <p className="mb-4 text-gray-600 text-sm">
                    Please sign in to write a review.
                  </p>
                  <Link
                    to="/login"
                    className="inline-block bg-white border border-amazon-blue text-amazon-blue font-bold py-2 px-6 rounded hover:bg-gray-50 transition-colors text-sm"
                  >
                    Sign In Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
