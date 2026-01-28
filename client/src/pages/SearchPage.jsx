import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination"; // <--- IMPORT
import { Loader, Filter, Star, X, CheckSquare, Square } from "lucide-react";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const categoryParam = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1); // Total pages

  // Filter States
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    "Mobiles",
    "Fashion",
    "Electronics",
    "Home & Kitchen",
    "Beauty",
    "Grocery",
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Include pageNumber in query
      let query = `/api/products?keyword=${keyword}&pageNumber=${page}`;

      if (categoryParam) query += `&category=${categoryParam}`;
      if (minPrice) query += `&minPrice=${minPrice}`;
      if (maxPrice && maxPrice !== 100000) query += `&maxPrice=${maxPrice}`;
      if (minRating) query += `&minRating=${minRating}`;

      const { data } = await axios.get(query);
      setProducts(data.products);
      setPage(data.page);
      setPages(data.pages);
      setLoading(false);

      // Scroll to top on page change
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // Reset page to 1 when filters change (but not when page changes)
  useEffect(() => {
    setPage(1);
  }, [keyword, categoryParam, minPrice, maxPrice, minRating]);

  useEffect(() => {
    fetchProducts();
  }, [page, keyword, categoryParam, minPrice, maxPrice, minRating]);

  // Handlers
  const handleCategoryChange = (cat) => {
    const newCat = categoryParam === cat ? "" : cat;
    setSearchParams({ keyword, category: newCat });
  };

  const handleRatingClick = (rating) => {
    setMinRating((prev) => (prev === rating ? 0 : rating));
  };

  return (
    <div className="container mx-auto px-4 py-8 font-outfit min-h-screen">
      {/* Mobile Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="md:hidden flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded mb-4 font-bold text-sm w-full justify-center shadow-sm"
      >
        <Filter size={16} /> {showFilters ? "Hide Filters" : "Filter Results"}
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        {/* SIDEBAR (Keep existing sidebar code exactly as is) */}
        <div
          className={`md:w-1/5 space-y-8 ${showFilters ? "block" : "hidden md:block"}`}
        >
          {/* Category Filter */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Category</h3>
            <ul className="space-y-2 text-sm">
              {categories.map((cat) => (
                <li
                  key={cat}
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => handleCategoryChange(cat)}
                >
                  {categoryParam === cat ? (
                    <CheckSquare
                      size={18}
                      className="text-amazon-yellow fill-current"
                    />
                  ) : (
                    <Square
                      size={18}
                      className="text-gray-300 group-hover:text-gray-400"
                    />
                  )}
                  <span
                    className={`${categoryParam === cat ? "font-bold text-amazon-blue" : "text-gray-700"} group-hover:text-amazon-yellow transition-colors`}
                  >
                    {cat}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Filter */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Price</h3>
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amazon-yellow"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>₹0</span>
                <span>₹{maxPrice.toLocaleString()}+</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute left-2 top-2 text-gray-500 text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full border border-gray-300 rounded pl-5 pr-1 py-1 text-sm outline-none focus:border-amazon-yellow"
                />
              </div>
              <span className="text-gray-400">-</span>
              <div className="relative">
                <span className="absolute left-2 top-2 text-gray-500 text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice === 100000 ? "" : maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded pl-5 pr-1 py-1 text-sm outline-none focus:border-amazon-yellow"
                />
              </div>
              <button
                onClick={fetchProducts}
                className="border border-gray-300 rounded px-2 py-1 text-xs font-bold hover:bg-gray-100"
              >
                Go
              </button>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">
              Customer Review
            </h3>
            <ul className="space-y-3">
              {[4, 3, 2, 1].map((star) => (
                <li
                  key={star}
                  onClick={() => handleRatingClick(star)}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  {minRating === star ? (
                    <CheckSquare
                      size={18}
                      className="text-amazon-yellow fill-current"
                    />
                  ) : (
                    <Square
                      size={18}
                      className="text-gray-300 group-hover:text-gray-400"
                    />
                  )}
                  <div className="flex items-center text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < star ? "currentColor" : "none"}
                        className={
                          i < star ? "text-yellow-400" : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-amazon-yellow">
                    & Up
                  </span>
                </li>
              ))}
            </ul>
            {(minRating > 0 ||
              minPrice ||
              maxPrice < 100000 ||
              categoryParam) && (
              <button
                onClick={() => {
                  setMinRating(0);
                  setMinPrice("");
                  setMaxPrice(100000);
                  setSearchParams({ keyword });
                }}
                className="text-xs text-blue-600 mt-4 flex items-center hover:underline font-medium"
              >
                <X size={12} className="mr-1" /> Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* --- MAIN RESULTS --- */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h2 className="text-lg font-bold text-gray-800">
              {keyword ? `Results for "${keyword}"` : "All Products"}
            </h2>
            <span className="text-sm text-gray-500 font-medium border border-gray-300 rounded px-3 py-1 bg-white">
              {products.length} items (Page {page} of {pages})
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center p-20">
              <Loader className="animate-spin text-amazon-blue" size={40} />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded border border-gray-200">
              <h3 className="text-lg font-bold text-gray-600 mb-2">
                No products found
              </h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* --- PAGINATION CONTROL --- */}
              <Pagination page={page} pages={pages} changePage={setPage} />
              {/* -------------------------- */}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
