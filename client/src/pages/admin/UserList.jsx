import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Loader, Trash2, CheckCircle, XCircle, Store, Eye } from "lucide-react"; // Changed Icon to Eye or Store

const UserList = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get("/api/users", config);
      // --- FILTER ONLY SELLERS ---
      const sellers = data.filter((u) => u.isSeller);
      setUsers(sellers);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteHandler = async (id) => {
    if (
      window.confirm("Delete this Seller? All their products will be removed.")
    ) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`/api/users/${id}`, config);
        fetchUsers();
        alert("Seller deleted");
      } catch (err) {
        alert(err.response?.data?.message || "Delete failed");
      }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader className="animate-spin" />
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center p-20">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8 font-outfit">
      <h1 className="text-2xl font-bold mb-6 text-amazon-blue flex items-center gap-2">
        <Store size={28} /> Active Sellers ({users.length})
      </h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">
                  Admin
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((usr) => (
                <tr key={usr._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    {usr._id.substring(20, 24)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {usr.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {usr.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {usr.isAdmin ? (
                      <CheckCircle
                        size={18}
                        className="text-green-500 mx-auto"
                      />
                    ) : (
                      <XCircle size={18} className="text-gray-300 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                    {/* --- VIEW PRODUCTS BUTTON --- */}
                    <Link
                      to={`/admin/seller/${usr._id}/products`}
                      className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-full hover:bg-blue-100 transition-colors"
                      title="View Products"
                    >
                      <Eye size={18} />
                    </Link>

                    {!usr.isAdmin && (
                      <button
                        onClick={() => deleteHandler(usr._id)}
                        className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full hover:bg-red-100 transition-colors"
                        title="Delete Seller"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserList;
