import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { Loader } from "lucide-react";

// Now accepts minDiscount
const ProductRow = ({
  title,
  category = "",
  keyword = "",
  minDiscount = 0,
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Build Query String
        let query = `/api/products?limit=10`; // Limit to 10 for rows
        if (keyword) query += `&keyword=${keyword}`;
        if (category) query += `&category=${category}`;
        if (minDiscount) query += `&minDiscount=${minDiscount}`;

        const { data } = await axios.get(query);

        if (data.products.length === 0) {
          setIsEmpty(true);
        } else {
          setProducts(data.products);
          setIsEmpty(false);
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
        setIsEmpty(true); // Hide on error
      }
    };
    fetchProducts();
  }, [category, keyword, minDiscount]);

  // --- HIDE SECTION IF EMPTY ---
  if (isEmpty && !keyword) return null;
  // Note: If 'keyword' exists (search results), we might want to show "No results" message
  // handled by the parent Home component or a separate logic.
  // For home page rows (no keyword), we return null.

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader className="animate-spin text-amazon-blue" />
      </div>
    );

  return (
    <div className="bg-white p-6 mx-4 mb-6 rounded-sm shadow-sm border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        {minDiscount > 0 && (
          <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
            Min {minDiscount}% Off
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductRow;
