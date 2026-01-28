import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Loader, Trash2, ArrowLeft, Package, X, Eye } from "lucide-react";

const SellerProducts = () => {
  const { id } = useParams(); // Seller ID
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/products/admin/${id}`, config);
      setProducts(data);
      setLoading(false);
    } catch (error) {
      alert("Failed to load products");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [id]);

  const deleteHandler = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`/api/products/${productId}`, config);
        fetchProducts();
        alert("Product deleted");
        setSelectedProduct(null); // Close modal if open
      } catch (error) {
        alert("Delete failed");
      }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader className="animate-spin" />
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 font-outfit relative">
      <Link
        to="/admin/users"
        className="flex items-center text-gray-500 mb-6 hover:text-amazon-blue"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Sellers
      </Link>

      <h1 className="text-2xl font-bold mb-6 text-amazon-blue flex items-center gap-2">
        <Package size={28} /> Seller Inventory ({products.length})
      </h1>

      {products.length === 0 ? (
        <div className="bg-white p-8 rounded shadow text-center text-gray-500">
          This seller has no products.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={product.image}
                        alt=""
                        className="w-10 h-10 object-contain rounded border bg-gray-100"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-full hover:bg-blue-100 transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => deleteHandler(product._id)}
                        className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full hover:bg-red-100 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- READ-ONLY DETAILS MODAL --- */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>

            <div className="p-8">
              <div className="flex gap-6 flex-col md:flex-row">
                <div className="w-full md:w-1/3 bg-gray-100 rounded flex items-center justify-center p-2">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="max-h-48 object-contain mix-blend-multiply"
                  />
                </div>
                <div className="w-full md:w-2/3 space-y-3">
                  <h2 className="text-2xl font-bold text-amazon-blue">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Brand:{" "}
                    <span className="font-bold text-gray-800">
                      {selectedProduct.brand}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Category:{" "}
                    <span className="font-bold text-gray-800">
                      {selectedProduct.category}
                    </span>
                  </p>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{selectedProduct.price}
                    </span>
                    {selectedProduct.mrp > selectedProduct.price && (
                      <span className="text-sm text-gray-500 line-through">
                        MRP: ₹{selectedProduct.mrp}
                      </span>
                    )}
                  </div>

                  <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 border">
                    <span className="font-bold block mb-1">Description:</span>
                    {selectedProduct.description}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t pt-4">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 bg-gray-200 rounded text-gray-800 font-bold hover:bg-gray-300"
                >
                  Close
                </button>
                <button
                  onClick={() => deleteHandler(selectedProduct._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 size={18} /> Delete Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
