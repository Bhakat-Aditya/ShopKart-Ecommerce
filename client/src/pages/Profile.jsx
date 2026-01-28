import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  User,
  Mail,
  Lock,
  Save,
  Loader,
  Package,
  ShoppingBag,
} from "lucide-react";

const Profile = () => {
  const { user, login } = useAuth(); // 'login' updates the local context

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Stats State
  const [orders, setOrders] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      fetchMyOrders();
    }
  }, [user]);

  const fetchMyOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get("/api/orders/myorders", config);
      setOrders(data);
      setStatsLoading(false);
    } catch (error) {
      console.error(error);
      setStatsLoading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const { data } = await axios.put(
        "/api/users/profile",
        { name, password },
        config,
      );

      setLoading(false);
      login(data); // Update Context & LocalStorage with new Name/Token
      alert("Profile Updated Successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setLoading(false);
      setMessage(err.response?.data?.message || "Update Failed");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 font-outfit max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-amazon-blue">Your Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* --- LEFT COL: EDIT FORM --- */}
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <User size={20} /> User Details
          </h2>

          {message && (
            <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={submitHandler} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-amazon-yellow outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Email
              </label>
              <div className="flex items-center bg-gray-100 border border-gray-300 rounded px-3 py-2">
                <Mail size={16} className="text-gray-500 mr-2" />
                <span className="text-gray-500">{email}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Email cannot be changed.
              </p>
            </div>

            <hr className="my-4" />

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                New Password
              </label>
              <div className="flex items-center border border-gray-300 rounded px-3 py-2 focus-within:border-amazon-yellow">
                <Lock size={16} className="text-gray-400 mr-2" />
                <input
                  type="password"
                  placeholder="Leave blank to keep same"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="flex items-center border border-gray-300 rounded px-3 py-2 focus-within:border-amazon-yellow">
                <Lock size={16} className="text-gray-400 mr-2" />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue font-bold py-2 rounded shadow-sm flex justify-center items-center gap-2 mt-2 transition-colors"
            >
              {loading ? (
                <Loader className="animate-spin" size={18} />
              ) : (
                <>
                  <Save size={18} /> Update Profile
                </>
              )}
            </button>
          </form>
        </div>

        {/* --- RIGHT COL: STATS --- */}
        <div className="md:col-span-2">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 flex items-center gap-4">
              <div className="bg-blue-200 p-3 rounded-full text-blue-800">
                <ShoppingBag size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold uppercase">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {statsLoading ? "..." : orders.length}
                </p>
              </div>
            </div>
            <div className="bg-green-50 p-6 rounded-lg border border-green-100 flex items-center gap-4">
              <div className="bg-green-200 p-3 rounded-full text-green-800">
                <Package size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold uppercase">
                  Items Purchased
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {statsLoading
                    ? "..."
                    : orders.reduce(
                        (acc, order) => acc + order.orderItems.length,
                        0,
                      )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
            {orders.length === 0 ? (
              <p className="text-gray-500">No orders placed yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 3).map((order) => (
                  <div
                    key={order._id}
                    className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0"
                  >
                    <div>
                      <span className="font-mono text-xs text-gray-500">
                        #{order._id.substring(20, 24)}
                      </span>
                      <p className="text-sm font-bold text-gray-800">
                        ₹{order.totalPrice}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {order.createdAt.substring(0, 10)}
                      </p>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${order.isDelivered ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                      >
                        {order.isDelivered ? "Delivered" : "Processing"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
