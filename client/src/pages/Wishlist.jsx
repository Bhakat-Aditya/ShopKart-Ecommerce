import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import { Loader, Heart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Wishlist = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get("/api/users/wishlist", config);
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchWishlist();
  }, [user]);

  if (loading) return <div className="flex justify-center p-20"><Loader className="animate-spin"/></div>;

  return (
    <div className="container mx-auto px-4 py-8 font-outfit">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="text-gray-500 hover:text-amazon-blue"><ArrowLeft /></Link>
        <h1 className="text-2xl font-bold text-amazon-blue flex items-center gap-2">
            <Heart className="fill-red-500 text-red-500"/> My Wishlist
        </h1>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded shadow-sm">
            <h2 className="text-xl font-bold text-gray-400">Your List is Empty</h2>
            <Link to="/" className="text-amazon-blue underline mt-2 inline-block">Start Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map(product => (
                <ProductCard key={product._id} product={product} />
            ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;