import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Star,
  ShoppingCart,
  ArrowLeft,
  Loader,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  // Refs for animation
  const imageRef = useRef(null);
  const infoRef = useRef(null);

  // 1. Fetch Data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // 2. Animate when product loads
  useGSAP(() => {
    if (product) {
      gsap.from(imageRef.current, {
        x: -100,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
      gsap.from(infoRef.current, {
        x: 100,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      });
    }
  }, [product]);

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


  const handleAddToCart = () => {
    addToCart(product, qty);
    navigate("/cart");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center text-gray-500 hover:text-amazon-blue mb-6 transition-colors"
      >
        <ArrowLeft size={18} className="mr-2" /> Back to Results
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column: Image */}
        <div
          ref={imageRef}
          className="flex justify-center items-start bg-white p-8 rounded-xl border border-gray-200 shadow-sm"
        >
          <img
            src={product.image}
            alt={product.name}
            className="max-h-[500px] w-full object-contain"
          />
        </div>

        {/* Right Column: Info */}
        <div ref={infoRef} className="flex flex-col space-y-4">
          {/* Title & Brand */}
          <div className="border-b border-gray-200 pb-4">
            <p className="text-sm text-amazon-blue font-bold tracking-wide uppercase mb-1">
              {product.brand}
            </p>
            <h1 className="text-3xl font-medium text-gray-900 leading-tight mb-2">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center space-x-2">
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
              <span className="text-blue-600 hover:underline cursor-pointer text-sm">
                {product.numReviews} ratings
              </span>
            </div>
          </div>

          {/* Price Block */}
          <div className="py-2">
            <div className="flex items-baseline space-x-2">
              <span className="text-sm text-gray-500 font-normal">Price:</span>
              <span className="text-3xl font-bold text-gray-900">
                ₹{product.price}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
          </div>

          {/* Badges */}
          <div className="flex space-x-6 text-sm text-gray-600 py-2">
            <div className="flex flex-col items-center text-center w-20">
              <div className="bg-gray-100 p-3 rounded-full mb-1">
                <Truck size={20} className="text-amazon-blue" />
              </div>
              <span>Free Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center w-20">
              <div className="bg-gray-100 p-3 rounded-full mb-1">
                <ShieldCheck size={20} className="text-amazon-blue" />
              </div>
              <span>1 Year Warranty</span>
            </div>
          </div>

          {/* Description */}
          <div className="py-2">
            <h3 className="font-bold text-gray-800 mb-2">About this item:</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              {product.description}
            </p>
          </div>

          {/* Add to Cart Section */}
          <div className="border border-gray-300 rounded-lg p-5 bg-white shadow-sm mt-4 w-full md:max-w-xs">
            <div className="mb-4">
              <span
                className={`text-lg font-bold ${product.countInStock > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {product.countInStock > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {product.countInStock > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity:
                </label>
                <select
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-amazon-yellow focus:border-amazon-yellow sm:text-sm bg-gray-50"
                >
                  {[...Array(product.countInStock).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>
                      {x + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={product.countInStock === 0}
              className={`w-full flex items-center justify-center py-3 px-4 rounded-full shadow-sm text-sm font-medium text-amazon-blue transition-all ${
                product.countInStock > 0
                  ? "bg-amazon-yellow hover:bg-yellow-400 cursor-pointer"
                  : "bg-gray-200 cursor-not-allowed opacity-75"
              }`}
            >
              <ShoppingCart size={20} className="mr-2" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
