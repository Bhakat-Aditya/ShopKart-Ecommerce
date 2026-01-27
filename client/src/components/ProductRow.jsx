import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { Loader, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const ProductRow = ({ title, category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch 10 items for this specific category
        // If category is empty, it fetches "Latest" items
        const url = category 
            ? `/api/products?category=${category}&limit=10`
            : `/api/products?limit=10`;
            
        const { data } = await axios.get(url);
        setProducts(data.products);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch row data", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  if (loading) return <div className="py-10 flex justify-center"><Loader className="animate-spin text-gray-300"/></div>;
  if (products.length === 0) return null; // Don't show empty rows

  return (
    <div className="my-8 relative z-10">
      <div className="flex justify-between items-end px-4 md:px-8 mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h2>
        <Link to={`/search/category:${category || 'all'}`} className="text-sm font-bold text-amazon-blue hover:text-amazon-yellow flex items-center">
            See all <ChevronRight size={16}/>
        </Link>
      </div>
      
      {/* Horizontal Scroll Container */}
      <div className="flex overflow-x-auto gap-4 px-4 md:px-8 pb-4 scrollbar-hide snap-x">
        {products.map((product) => (
          <div key={product._id} className="min-w-[250px] md:min-w-[280px] snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductRow;