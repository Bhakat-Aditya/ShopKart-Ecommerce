import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { Edit, Trash2, Plus } from "lucide-react";

const ProductList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  // FETCH MY PRODUCTS
  const fetchProducts = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      // Fetch only logged-in seller's products
      const { data } = await axios.get("/api/products/myproducts", config);
      setProducts(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load your products");
    }
  };

  useEffect(() => {
    if (user && user.isSeller) {
      fetchProducts();
    } else {
      navigate("/seller/register");
    }
  }, [user, navigate]);

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`/api/products/${id}`, config);
        fetchProducts(); // Refresh list
      } catch (error) {
        alert(error.response?.data?.message || "Delete failed");
      }
    }
  };

  const createProductHandler = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post("/api/products", {}, config);
      navigate(`/seller/product/${data._id}/edit`); // Redirect to edit
    } catch (error) {
      alert(error.response?.data?.message || "Create failed");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 font-outfit">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Inventory</h1>
          <p className="text-gray-500 text-sm">Manage your stocks and prices</p>
        </div>
        <button
          onClick={createProductHandler}
          className="bg-amazon-yellow text-amazon-blue px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-yellow-400"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product._id.substring(20, 24)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₹{product.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.countInStock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/seller/product/${product._id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900 mr-4 inline-block"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => deleteHandler(product._id)}
                    className="text-red-600 hover:text-red-900"
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
  );
};

export default ProductList;
