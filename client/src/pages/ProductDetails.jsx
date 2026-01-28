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
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false); // New state for visual feedback

  const [rating, setRating] = useState(0);
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
    const interval = setInterval(() => {
      fetchProduct(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchProduct]);

  const cartItem = cartItems.find((item) => item._id === id);
  const qtyInCart = cartItem ? cartItem.qty : 0;
  const availableToAdd = product ? product.countInStock - qtyInCart : 0;

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAdded(true); // Show "Added" feedback
    setTimeout(() => setAdded(false), 2000); // Hide after 2 seconds
    // navigate("/cart"); <--- REMOVED THIS LINE
  };

  const increaseQty = () => {
    if (qty < availableToAdd) setQty(qty + 1);
  };

  const decreaseQty = () => {
    if (qty > 1) setQty(qty - 1);
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
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
      alert("Review Submitted!");
      setReviewLoading(false);
      setRating(0);
      setComment("");
      await fetchProduct(false);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
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
    <div className="container mx-auto px-4 py-8 font-outfit">
      <Link
        to="/"
        className="inline-flex items-center text-gray-500 hover:text-amazon-blue mb-6 transition-colors font-medium"
      >
        <ArrowLeft size={18} className="mr-2" /> Back to Results
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Image */}
        <div className="flex justify-center items-center bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-[500px] w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
          {discount > 0 && (
            <span className="absolute top-4 left-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col space-y-6">
          <div className="border-b border-gray-100 pb-6">
            <p className="text-sm text-amazon-blue font-bold tracking-widest uppercase mb-2 opacity-80">
              {product.brand}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
              {product.name}
            </h1>
            <div className="flex items-center space-x-3">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
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
              <span className="text-4xl font-bold text-gray-900">
                ₹{product.price}
              </span>
              {product.mrp > product.price && (
                <span className="text-xl text-gray-400 line-through font-medium">
                  ₹{product.mrp}
                </span>
              )}
            </div>
            <p className="text-green-600 text-sm font-bold mt-2">
              Inclusive of all taxes
            </p>
          </div>

          <div className="flex space-x-8 text-sm text-gray-600 py-2">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="bg-blue-50 p-3 rounded-full text-amazon-blue">
                <Truck size={22} />
              </div>
              <span className="font-medium">Free Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="bg-blue-50 p-3 rounded-full text-amazon-blue">
                <ShieldCheck size={22} />
              </div>
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

          <div className="py-2">
            <h3 className="font-bold text-gray-800 mb-2 text-lg">
              About this item
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm mt-4 w-full md:max-w-sm relative">
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
                <span className="text-sm font-normal text-gray-500">
                  ({product.countInStock} total)
                </span>
              </span>

              {qtyInCart >= product.countInStock &&
                product.countInStock > 0 && (
                  <span className="text-xs text-red-500 font-bold flex items-center gap-1">
                    <AlertCircle size={12} /> Max limit reached
                  </span>
                )}
            </div>

            {availableToAdd > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Quantity:
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={decreaseQty}
                      disabled={qty <= 1}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="px-4 font-bold text-lg min-w-[3rem] text-center">
                      {qty}
                    </span>
                    <button
                      onClick={increaseQty}
                      disabled={qty >= availableToAdd}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={availableToAdd === 0}
              className={`w-full flex items-center justify-center py-3.5 px-4 rounded-full shadow-md text-base font-bold text-white transition-all transform active:scale-95 ${availableToAdd > 0 ? (added ? "bg-green-600" : "bg-amazon-yellow text-amazon-blue hover:bg-yellow-400") : "bg-gray-200 cursor-not-allowed text-gray-400 shadow-none"}`}
            >
              {added ? (
                <>
                  <Check size={20} className="mr-2" /> Added
                </>
              ) : (
                <>
                  <ShoppingCart size={20} className="mr-2" />
                  {availableToAdd > 0 ? "Add to Cart" : "Unavailable"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <div className="mt-16 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-amazon-blue">
          Customer Reviews
        </h2>
        {(!product.reviews || product.reviews.length === 0) && (
          <div className="bg-blue-50 text-blue-700 p-4 rounded mb-6 font-medium">
            No Reviews Yet. Be the first!
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            {(product.reviews || []).map((review) => (
              <div
                key={review._id}
                className="border-b border-gray-100 pb-6 last:border-0"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 text-lg uppercase">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{review.name}</div>
                    <div className="flex text-yellow-400 text-xs mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
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
                <p className="text-gray-700 text-sm leading-relaxed ml-14">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 h-fit">
            <h3 className="text-xl font-bold mb-4">Write a Review</h3>
            {user ? (
              <form onSubmit={submitReviewHandler} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1 text-gray-700">
                    Rating
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:border-amazon-yellow outline-none bg-white"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Good</option>
                    <option value="4">4 - Very Good</option>
                    <option value="5">5 - Excellent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-gray-700">
                    Comment
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:border-amazon-yellow outline-none h-32 resize-none"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="w-full bg-amazon-blue hover:bg-gray-800 text-white font-bold py-3 rounded shadow-md transition-colors flex justify-center"
                >
                  {reviewLoading ? (
                    <Loader className="animate-spin text-white" />
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-6">
                <p className="mb-4 text-gray-600">
                  Please sign in to write a review.
                </p>
                <Link
                  to="/login"
                  className="inline-block bg-amazon-yellow text-amazon-blue font-bold py-2 px-6 rounded hover:bg-yellow-400 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
