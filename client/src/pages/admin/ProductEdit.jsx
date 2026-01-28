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

  // Smart Price States
  const [mrp, setMrp] = useState(0);
  const [price, setPrice] = useState(0);
  const [discPercent, setDiscPercent] = useState(0);
  const [discFlat, setDiscFlat] = useState(0);

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- AMAZON-STYLE CATEGORIES ---
  const categories = [
    "Mobiles",
    "Computers",
    "TV, Audio & Cameras",
    "Appliances",
    "Fashion",
    "Home & Kitchen",
    "Beauty & Health",
    "Sports & Fitness",
    "Toys & Baby Products",
    "Books",
    "Video Games",
    "Automotive",
    "Tools & Home Improvement",
    "Pet Supplies",
    "Grocery & Gourmet Foods",
    "Office Products",
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);

        // Logic to clear "Placeholder" text so inputs appear empty
        setName(data.name === "New Product Name" ? "" : data.name);
        setBrand(data.brand === "Brand Name" ? "" : data.brand);
        setCategory(data.category === "Category" ? "" : data.category);
        setDescription(
          data.description === "Please add a description."
            ? ""
            : data.description,
        );
        setImage(data.image === "/images/sample.jpg" ? "" : data.image);

        setCountInStock(data.countInStock || 0);

        const serverPrice = data.price || 0;
        const serverMrp = data.mrp || serverPrice;

        setPrice(serverPrice);
        setMrp(serverMrp);

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

  // --- MATH LOGIC ---
  const handleMrpChange = (e) => {
    const val = Number(e.target.value);
    setMrp(val);
    const newFlat = (val * discPercent) / 100;
    setDiscFlat(Math.round(newFlat));
    setPrice(Math.round(val - newFlat));
  };

  const handlePercentChange = (e) => {
    const val = Number(e.target.value);
    setDiscPercent(val);
    const newFlat = (mrp * val) / 100;
    setDiscFlat(Math.round(newFlat));
    setPrice(Math.round(mrp - newFlat));
  };

  const handleFlatChange = (e) => {
    const val = Number(e.target.value);
    setDiscFlat(val);
    if (mrp > 0) {
      setDiscPercent(Math.round((val / mrp) * 100));
    }
    setPrice(mrp - val);
  };

  const handlePriceChange = (e) => {
    const val = Number(e.target.value);
    setPrice(val);
    const newFlat = mrp - val;
    setDiscFlat(newFlat);
    if (mrp > 0) {
      setDiscPercent(Math.round((newFlat / mrp) * 100));
    }
  };

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

    // --- 1. NEW VALIDATION CHECK ---
    if (!name || !brand || !category || !description || !image) {
      alert(
        "Please fill in all required fields (Name, Brand, Category, Description, Image)",
      );
      return;
    }
    // -------------------------------

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
      // --- 2. SHOW EXACT SERVER ERROR ---
      alert(error.response?.data?.message || "Update Failed");
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
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Adidas Running Shoes"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:border-amazon-yellow outline-none"
            required
          />
        </div>

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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Brand <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Nike"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:border-amazon-yellow outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:border-amazon-yellow outline-none bg-white"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

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

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Describe your product features..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:border-amazon-yellow outline-none h-32 resize-none"
            required
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Image <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Image URL or Upload"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="flex-grow px-4 py-2 border border-gray-300 rounded outline-none"
              required
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
