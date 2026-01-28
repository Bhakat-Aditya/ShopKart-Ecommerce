import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Loader, Save, ArrowLeft, UserCheck, Store } from "lucide-react";

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeller, setIsSeller] = useState(false);

  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`/api/users/${id}`, config);

        setName(data.name);
        setEmail(data.email);
        setIsAdmin(data.isAdmin);
        setIsSeller(data.isSeller);
        setLoading(false);
      } catch (error) {
        alert("Failed to fetch user");
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, user]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(
        `/api/users/${id}`,
        { name, email, isAdmin, isSeller },
        config,
      );
      alert("User Updated Successfully");
      navigate("/admin/users");
    } catch (error) {
      alert(error.response?.data?.message || "Update Failed");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader className="animate-spin" />
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 font-outfit max-w-lg">
      <Link
        to="/admin/users"
        className="flex items-center text-gray-500 mb-6 hover:text-amazon-blue"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Users
      </Link>

      <h1 className="text-2xl font-bold mb-6 text-amazon-blue">
        Edit User Privileges
      </h1>

      <form
        onSubmit={submitHandler}
        className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 space-y-6"
      >
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
            disabled // Prevent changing name/email here for safety, focus on roles
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
            disabled
          />
        </div>

        <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-3">
          <h3 className="font-bold text-gray-700 text-sm uppercase mb-2">
            Roles & Permissions
          </h3>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              className="w-5 h-5 text-amazon-yellow rounded focus:ring-amazon-yellow border-gray-300"
            />
            <span className="flex items-center gap-2 text-gray-800 font-medium">
              <UserCheck size={18} className="text-purple-600" /> Is Admin?
            </span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isSeller}
              onChange={(e) => setIsSeller(e.target.checked)}
              className="w-5 h-5 text-amazon-yellow rounded focus:ring-amazon-yellow border-gray-300"
            />
            <span className="flex items-center gap-2 text-gray-800 font-medium">
              <Store size={18} className="text-blue-600" /> Is Seller?
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={updateLoading}
          className="w-full bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue font-bold py-3 rounded-lg shadow-sm flex justify-center items-center gap-2"
        >
          {updateLoading ? (
            <Loader className="animate-spin" />
          ) : (
            <>
              <Save size={20} /> Update Privileges
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default UserEdit;
