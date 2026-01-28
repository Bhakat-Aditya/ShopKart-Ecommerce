import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { Loader } from "lucide-react";

// Accepts category AND keyword now
const ProductRow = ({ title, category = "", keyword = "" }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Build Query String
        let query = `/api/products?`;
        if (keyword) query += `&keyword=${keyword}`;
        if (category) query += `&category=${category}`;

        const { data } = await axios.get(query);
        setProducts(data.products);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, keyword]); // Re-run when these change

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader className="animate-spin text-amazon-blue" />
      </div>
    );

  if (products.length === 0) {
    return (
      <div className="bg-white p-6 md:mx-4 rounded shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-gray-500">No products found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-6 md:mx-4 rounded shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-amazon-blue">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductRow;
