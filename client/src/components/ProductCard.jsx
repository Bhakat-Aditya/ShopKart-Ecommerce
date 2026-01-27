import { Link } from "react-router-dom";
import { Star } from "lucide-react";

const ProductCard = ({ product }) => {
  // Calculate discount percentage if MRP exists
  const discount =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <Link
      to={`/product/${product._id}`}
      className="bg-white border border-gray-200 rounded-sm hover:shadow-lg transition-shadow p-4 flex flex-col h-full group cursor-pointer"
    >
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
