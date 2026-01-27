import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeft, Save, Loader } from "lucide-react";

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const { data } = await axios.post("/api/upload", formData, config);

      setImage(data.image); // Set the Cloudinary URL to our state
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
      alert("Image upload failed");
    }
  };

  // 1. Fetch current data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setName(data.name);
        setPrice(data.price);
        setImage(data.image);
        setBrand(data.brand);
        setCategory(data.category);
        setCountInStock(data.countInStock);
        setDescription(data.description);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // 2. Handle Form Submit
  const submitHandler = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.put(
        `/api/products/${id}`,
        {
          name,
          price,
          description,
          image,
          brand,
          category,
          countInStock,
        },
        config,
      );

      navigate("/admin/productlist");
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl font-outfit">
      <Link
        to="/admin/productlist"
        className="flex items-center text-gray-600 mb-6 hover:text-amazon-blue"
      >
        <ArrowLeft size={18} className="mr-2" /> Go Back
      </Link>

      <h1 className="text-2xl font-bold mb-6 text-amazon-blue">Edit Product</h1>

      {loading ? (
        <div className="flex justify-center">
          <Loader className="animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>
      ) : (
        <form
          onSubmit={submitHandler}
          className="bg-white p-6 rounded shadow-sm border border-gray-200 space-y-4"
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-bold mb-1">Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-amazon-yellow outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-bold mb-1">Price</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-amazon-yellow outline-none"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          {/* Image Input Section */}
          <div>
            <label className="block text-sm font-bold mb-1">Image</label>

            {/* 1. Show URL Input (Optional, kept for manual entry) */}
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Enter image URL"
            />

            {/* 2. Show File Upload Input */}
            <div className="flex items-center">
              <input
                type="file"
                onChange={uploadFileHandler}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amazon-yellow file:text-amazon-blue hover:file:bg-yellow-400"
              />
              {uploading && <Loader className="animate-spin ml-3" />}
            </div>

            {/* Preview */}
            {image && (
              <img
                src={image}
                alt="Preview"
                className="h-20 w-20 object-contain mt-2 border p-1"
              />
            )}
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-bold mb-1">Brand</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-amazon-yellow outline-none"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>

          {/* Count In Stock */}
          <div>
            <label className="block text-sm font-bold mb-1">
              Count In Stock
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-amazon-yellow outline-none"
              value={countInStock}
              onChange={(e) => setCountInStock(e.target.value)}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold mb-1">Category</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-amazon-yellow outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-amazon-yellow outline-none h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={updateLoading}
            className="w-full bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue font-bold py-2 rounded shadow-sm flex justify-center items-center transition-colors"
          >
            {updateLoading ? (
              <Loader className="animate-spin mr-2" />
            ) : (
              <Save size={18} className="mr-2" />
            )}
            Update Product
          </button>
        </form>
      )}
    </div>
  );
};

export default ProductEdit;
