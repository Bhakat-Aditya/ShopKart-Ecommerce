import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Store, Calendar, Package } from "lucide-react";
import ProductCard from "../components/ProductCard";

const SellerShop = () => {
  const { id } = useParams();
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const { data } = await axios.get(`/api/seller/profile/${id}`);
        setShopData(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchShop();
  }, [id]);

  if (loading) return <div className="text-center py-20">Loading Shop...</div>;
  if (!shopData) return <div className="text-center py-20">Shop Not Found</div>;

  const { seller, products } = shopData;

  return (
    <div className="container mx-auto px-4 py-8 font-outfit">
      {/* --- SHOP HEADER --- */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-24 h-24 bg-amazon-yellow rounded-full flex items-center justify-center text-amazon-blue">
          {seller.logo ? (
            <img
              src={seller.logo}
              alt={seller.name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <Store size={40} />
          )}
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">{seller.name}</h1>
          <p className="text-gray-500 mt-2 max-w-2xl">
            {seller.description || "No description provided."}
          </p>

          <div className="flex items-center gap-6 mt-4 text-sm text-gray-500 justify-center md:justify-start">
            <span className="flex items-center gap-1">
              <Calendar size={16} /> Joined{" "}
              {new Date(seller.joined).getFullYear()}
            </span>
            <span className="flex items-center gap-1">
              <Package size={16} /> {products.length} Products
            </span>
          </div>
        </div>
      </div>

      {/* --- PRODUCT GRID --- */}
      <h2 className="text-xl font-bold mb-4">Shop Products</h2>
      {products.length === 0 ? (
        <p className="text-gray-500">This seller has no active products.</p>
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

export default SellerShop;
