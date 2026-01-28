import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader, Save, ArrowLeft, UploadCloud } from "lucide-react";

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState("");

  // --- SMART PRICE STATES ---
  const [mrp, setMrp] = useState(0); // Base Price
  const [price, setPrice] = useState(0); // Selling Price
  const [discPercent, setDiscPercent] = useState(0); // Discount %
  const [discFlat, setDiscFlat] = useState(0); // Discount ₹
  // --------------------------

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setName(data.name || "");
        setImage(data.image || "");
        setBrand(data.brand || "");
        setCategory(data.category || "");
        setCountInStock(data.countInStock || 0);
        setDescription(data.description || "");

        // Load Pricing
        const serverPrice = data.price || 0;
        const serverMrp = data.mrp || serverPrice; // If no MRP, assume MRP = Price

        setPrice(serverPrice);
        setMrp(serverMrp);

        // Calculate Initials
        if (serverMrp > 0) {
          const flat = serverMrp - serverPrice;
          const percent = (flat / serverMrp) * 100;
          setDiscFlat(Math.round(flat));
          setDiscPercent(Math.round(percent));
        }

        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // --- INTERCONNECTED MATH LOGIC ---

  const handleMrpChange = (e) => {
    const val = Number(e.target.value);
    setMrp(val);
    // If MRP changes, keep Selling Price same? Or keep Discount % same?
    // Let's keep Discount % constant.
    const newFlat = (val * discPercent) / 100;
    setDiscFlat(Math.round(newFlat));
    setPrice(Math.round(val - newFlat));
  };

  const handlePercentChange = (e) => {
    const val = Number(e.target.value);
    setDiscPercent(val);

    // Update Flat & Price
    const newFlat = (mrp * val) / 100;
    setDiscFlat(Math.round(newFlat));
    setPrice(Math.round(mrp - newFlat));
  };

  const handleFlatChange = (e) => {
    const val = Number(e.target.value);
    setDiscFlat(val);

    // Update % & Price
    if (mrp > 0) {
      setDiscPercent(Math.round((val / mrp) * 100));
    }
    setPrice(mrp - val);
  };

  const handlePriceChange = (e) => {
    const val = Number(e.target.value);
    setPrice(val);

    // Update % & Flat
    const newFlat = mrp - val;
    setDiscFlat(newFlat);
    if (mrp > 0) {
      setDiscPercent(Math.round((newFlat / mrp) * 100));
    }
  };

  // ---------------------------------

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post("/api/upload", formData, config);
      setImage(data);
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
      alert("Image Upload Failed");
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      await axios.put(
        `/api/products/${id}`,
        {
          name,
          price,
          mrp,
          image,
          brand,
          category,
          description,
          countInStock,
        },
        config,
      );
      navigate("/seller/products");
    } catch (error) {
      console.error(error);
      alert("Update Failed");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader className="animate-spin" />
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 font-outfit max-w-2xl">
      <Link
        to="/seller/products"
        className="flex items-center text-gray-500 mb-6 hover:text-amazon-blue"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Inventory
      </Link>

      <h1 className="text-2xl font-bold mb-6 text-amazon-blue">Edit Product</h1>

      <form
        onSubmit={submitHandler}
        className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6"
      >
        {/* Name */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Product Name
          </label>
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:border-amazon-yellow outline-none"
          />
        </div>

        {/* --- 4-WAY PRICING ROW --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              MRP (₹)
            </label>
            <input
              type="number"
              value={mrp}
              onChange={handleMrpChange}
              className="w-full px-2 py-1 border rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Disc (%)
            </label>
            <input
              type="number"
              value={discPercent}
              onChange={handlePercentChange}
              className="w-full px-2 py-1 border rounded text-blue-600 font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Disc (₹)
            </label>
            <input
              type="number"
              value={discFlat}
              onChange={handleFlatChange}
              className="w-full px-2 py-1 border rounded text-blue-600 font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-green-700 mb-1">
              Selling Price
            </label>
            <input
              type="number"
              value={price}
              onChange={handlePriceChange}
              className="w-full px-2 py-1 border-2 border-green-200 rounded text-green-700 font-bold bg-white"
            />
          </div>
        </div>

        {/* Brand & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Brand
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:border-amazon-yellow outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:border-amazon-yellow outline-none"
            />
          </div>
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Count In Stock
          </label>
          <input
            type="number"
            value={countInStock}
            onChange={(e) => setCountInStock(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:border-amazon-yellow outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:border-amazon-yellow outline-none h-32 resize-none"
          ></textarea>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Image
          </label>
          <div className="flex gap-4 items-center">
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="flex-grow px-4 py-2 border border-gray-300 rounded outline-none"
            />
            <label className="cursor-pointer bg-gray-100 border border-gray-300 px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-200">
              <UploadCloud size={20} />{" "}
              <span className="font-bold text-sm">Upload</span>
              <input
                type="file"
                className="hidden"
                onChange={uploadFileHandler}
              />
            </label>
          </div>
          {uploading && (
            <p className="text-sm text-blue-500 mt-2">Uploading...</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue font-bold py-3 rounded-lg shadow-sm flex justify-center items-center gap-2"
        >
          <Save size={20} /> Update Product
        </button>
      </form>
    </div>
  );
};

export default ProductEdit;
