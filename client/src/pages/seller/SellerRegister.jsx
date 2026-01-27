import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Store, Loader } from "lucide-react";

const SellerRegister = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, login } = useAuth(); // We need login() to update the user in context
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      // Hit the API
      const { data } = await axios.post(
        "/api/seller/register",
        { name, description },
        config,
      );

      // Update Context with new "isSeller: true" data
      login(data);

      alert("Congratulations! You are now a Seller.");
      navigate("/seller/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 font-outfit flex justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
            <Store size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Setup Your Shop</h1>
          <p className="text-gray-500">
            Start selling to millions of ShopKart customers today.
          </p>
        </div>

        <form onSubmit={submitHandler} className="space-y-5">
          <div>
            <label className="block text-sm font-bold mb-2">Shop Name</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amazon-yellow outline-none"
              placeholder="e.g. Tech Heaven"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Shop Description
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amazon-yellow outline-none h-32"
              placeholder="What do you sell?"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amazon-yellow text-amazon-blue font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors flex justify-center"
          >
            {loading ? <Loader className="animate-spin" /> : "Register My Shop"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerRegister;
