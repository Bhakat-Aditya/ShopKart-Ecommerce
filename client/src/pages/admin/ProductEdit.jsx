import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom"; // Removed Link, we use button for logic
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeft,
  Save,
  Loader,
  Calculator,
  Image as ImageIcon,
} from "lucide-react";

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Product State
  const [name, setName] = useState("");
  const [mrp, setMrp] = useState(0);
  const [price, setPrice] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [image, setImage] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState("");

  // Logic State
  const [isSample, setIsSample] = useState(false); // To track if this is a "Junk" product
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);

  const categories = [
    "Electronics",
    "Mobiles",
    "Laptops",
    "Fashion",
    "Home & Kitchen",
    "Books",
    "Beauty",
    "Sports",
    "Toys",
    "Grocery",
  ];

  // 1. Fetch Data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);

        // Check if this is a "Sample" (New) product
        if (data.name === "Sample Name") {
          setIsSample(true);
          // Auto Clear fields for new products
          setName("");
          setBrand("");
          setDescription("");
          setCategory("");
        } else {
          setIsSample(false);
          setName(data.name);
          setBrand(data.brand);
          setDescription(data.description);
          setCategory(data.category);
        }

        setPrice(data.price);
        setMrp(data.mrp || 0);
        setImage(data.image);
        setCountInStock(data.countInStock);

        if (data.mrp > 0 && data.price > 0) {
          setDiscountPercent(
            Math.round(((data.mrp - data.price) / data.mrp) * 100),
          );
        }

        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // 2. Logic: Go Back & Clean Up
  const handleGoBack = async () => {
    if (
      window.confirm(
        "Are you sure you want to discard? Unsaved changes will be lost.",
      )
    ) {
      // If it was a "Sample" product (meaning user clicked Create but didn't finish), DELETE IT.
      if (isSample) {
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.delete(`/api/products/${id}`, config);
          // alert("Empty draft deleted.");
        } catch (error) {
          console.error("Could not delete draft", error);
        }
      }
      navigate("/admin/products");
    }
  };

  // 3. Logic: Submit with Validation
  const submitHandler = async (e) => {
    e.preventDefault();

    // VALIDATION CHECK
    if (!name || !brand || !category || !description || !image || price <= 0) {
      alert("Please fill in all fields correctly.");
      return;
    }

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
          mrp,
          description,
          image,
          brand,
          category,
          countInStock,
        },
        config,
      );
      navigate("/seller/products");
    } catch (error) {
      alert("Update failed");
    } finally {
      setUpdateLoading(false);
    }
  };

  // ... (Calculators and Upload Handlers remain the same)
  const handleMrpChange = (e) => {
    const newMrp = Number(e.target.value);
    setMrp(newMrp);
    const newPrice = newMrp - (newMrp * discountPercent) / 100;
    setPrice(Math.round(newPrice));
  };
  const handleDiscountChange = (e) => {
    const newDiscount = Number(e.target.value);
    setDiscountPercent(newDiscount);
    const newPrice = mrp - (mrp * newDiscount) / 100;
    setPrice(Math.round(newPrice));
  };
  const handlePriceChange = (e) => {
    const newPrice = Number(e.target.value);
    setPrice(newPrice);
    if (mrp > 0) {
      const newDiscount = ((mrp - newPrice) / mrp) * 100;
      setDiscountPercent(Math.round(newDiscount));
    }
  };
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);
    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      const { data } = await axios.post("/api/upload", formData, config);
      setImage(data.image);
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl font-outfit">
      {/* Updated Go Back Button */}
      <button
        onClick={handleGoBack}
        className="flex items-center text-gray-500 mb-6 hover:text-amazon-blue bg-transparent border-none cursor-pointer"
      >
        <ArrowLeft size={18} className="mr-2" />
        {isSample ? "Discard Draft" : "Go Back"}
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-amazon-blue">Edit Product</h1>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <Loader className="animate-spin" />
        </div>
      ) : (
        <form
          onSubmit={submitHandler}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="md:col-span-2 space-y-5 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div>
              <label className="block text-sm font-bold mb-1 text-gray-700">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded focus:ring-2 ring-amazon-yellow outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. iPhone 15 Pro Max"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">
                  Brand <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:ring-2 ring-amazon-yellow outline-none"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Apple"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full p-2 border rounded focus:ring-2 ring-amazon-yellow outline-none bg-white"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select Category...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1 text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full p-2 border rounded focus:ring-2 ring-amazon-yellow outline-none h-32"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product details..."
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1 text-gray-700">
                Product Image <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 border-2 border-dashed border-gray-300 rounded flex justify-center items-center overflow-hidden bg-gray-50">
                  {image ? (
                    <img
                      src={image}
                      alt="Preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    onChange={uploadFileHandler}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amazon-yellow file:text-amazon-blue hover:file:bg-yellow-400 cursor-pointer"
                  />
                  {uploading && (
                    <span className="text-sm text-blue-600 mt-2 block">
                      Uploading...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-amazon-blue">
                <Calculator size={20} />
                <h3 className="font-bold text-lg">Pricing Calculator</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">
                    MRP
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      className="w-full pl-6 p-2 border rounded focus:ring-2 ring-blue-300 outline-none font-bold"
                      value={mrp}
                      onChange={handleMrpChange}
                      placeholder="1000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded focus:ring-2 ring-blue-300 outline-none"
                    value={discountPercent}
                    onChange={handleDiscountChange}
                    placeholder="50"
                  />
                </div>

                <div className="pt-2 border-t border-blue-200">
                  <label className="block text-xs font-bold text-amazon-blue uppercase">
                    Selling Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-900 font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      className="w-full pl-6 p-2 border-2 border-amazon-yellow rounded focus:ring-2 ring-amazon-yellow outline-none font-bold text-xl text-amazon-blue bg-white"
                      value={price}
                      onChange={handlePriceChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <label className="block text-sm font-bold mb-1 text-gray-700">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded focus:ring-2 ring-amazon-yellow outline-none"
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={updateLoading}
              className="w-full bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue font-bold py-3 rounded shadow-md transition-all flex justify-center items-center"
            >
              {updateLoading ? (
                <Loader className="animate-spin mr-2" />
              ) : (
                <Save size={20} className="mr-2" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProductEdit;
