import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // Import useParams
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { Loader } from "lucide-react";

const Home = () => {
  const { keyword } = useParams(); // Get keyword from URL
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State (We'll use this later)
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Construct URL with keyword if it exists
        const url = keyword
          ? `/api/products?keyword=${keyword}`
          : `/api/products`;

        const { data } = await axios.get(url);

        // Backend now returns { products, page, pages }
        setProducts(data.products);
        setPage(data.page);
        setPages(data.pages);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword]); // Refetch when keyword changes

  return (
    <div className="container mx-auto py-8 px-4 font-outfit">
      {/* Show "Back" button if searching */}
      {keyword && (
        <Link
          to="/"
          className="bg-gray-200 px-4 py-2 rounded mb-4 inline-block hover:bg-gray-300"
        >
          Go Back
        </Link>
      )}

      <h1 className="text-3xl font-bold text-amazon-light mb-6">
        {keyword ? `Results for "${keyword}"` : "Latest Products"}
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin text-amazon-blue" size={48} />
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          Error: {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
