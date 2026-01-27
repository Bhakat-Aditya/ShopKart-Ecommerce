import { Link } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      {/* Product Image */}
      <Link to={`/product/${product._id}`} className="block relative group overflow-hidden h-64 bg-gray-100">
         {/* We use a placeholder if image is missing, or the real image */}
        <img 
          src={product.image || "https://placehold.co/400x400?text=No+Image"} 
          alt={product.name} 
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        {/* Brand/Category */}
        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{product.category}</p>
        
        {/* Title */}
        <Link to={`/product/${product._id}`} className="text-gray-900 font-medium hover:text-amazon-yellow line-clamp-2 mb-2">
          {product.name}
        </Link>

        {/* Rating Mockup */}
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={14} 
              className={i < product.rating ? "text-yellow-400 fill-current" : "text-gray-300"} 
            />
          ))}
          <span className="text-xs text-blue-600 ml-1 hover:underline cursor-pointer">{product.numReviews}</span>
        </div>

        {/* Price & Action */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 line-through">₹{product.price + 500}</span>
            <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
          </div>
          
          <button className="bg-amazon-yellow text-amazon-blue p-2 rounded-full hover:bg-yellow-500 transition-colors shadow-sm">
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;