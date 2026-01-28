import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Loader, MapPin, Plus, Home, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const SavedAddresses = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const fetchAddresses = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      // Matches the route in auth.routes.js -> /api/users/address
      const { data } = await axios.get("/api/users/address", config);
      setAddresses(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load addresses");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  const addAddressHandler = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        "/api/users/address",
        { address, city, postalCode, country },
        config
      );
      setAddresses(data); // Server returns updated list
      setShowForm(false);
      setAddress("");
      setCity("");
      setPostalCode("");
      setCountry("");
      alert("Address Saved!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save address");
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader className="animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 py-8 font-outfit max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/profile" className="text-gray-500 hover:text-amazon-blue">
            <ArrowLeft size={24}/>
        </Link>
        <h1 className="text-3xl font-bold text-amazon-blue">Your Addresses</h1>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* --- ADD ADDRESS CARD --- */}
        <div 
            onClick={() => setShowForm(!showForm)}
            className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-gray-50 hover:border-amazon-yellow transition-colors min-h-[200px]"
        >
            <Plus size={40} className="text-gray-400 mb-2"/>
            <h2 className="text-xl font-bold text-gray-500">Add Address</h2>
        </div>

        {/* --- EXISTING ADDRESSES --- */}
        {addresses.map((addr) => (
            <div key={addr._id} className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm relative min-h-[200px]">
                <div className="flex items-center gap-2 mb-3">
                    <Home size={20} className="text-amazon-blue"/>
                    <span className="font-bold text-gray-800">Saved Address</span>
                </div>
                <p className="text-gray-600 mb-1">{user.name}</p>
                <p className="text-gray-700 font-medium">{addr.address}</p>
                <p className="text-gray-700">{addr.city}, {addr.postalCode}</p>
                <p className="text-gray-700 uppercase tracking-wide font-bold text-xs mt-1">{addr.country}</p>
            </div>
        ))}
      </div>

      {/* --- MODAL / FORM --- */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Add New Address</h2>
                <form onSubmit={addAddressHandler} className="space-y-4">
                    <input 
                        type="text" placeholder="Street Address" required 
                        className="w-full border p-2 rounded"
                        value={address} onChange={(e) => setAddress(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input 
                            type="text" placeholder="City" required 
                            className="w-full border p-2 rounded"
                            value={city} onChange={(e) => setCity(e.target.value)}
                        />
                        <input 
                            type="text" placeholder="Postal Code" required 
                            className="w-full border p-2 rounded"
                            value={postalCode} onChange={(e) => setPostalCode(e.target.value)}
                        />
                    </div>
                    <input 
                        type="text" placeholder="Country" required 
                        className="w-full border p-2 rounded"
                        value={country} onChange={(e) => setCountry(e.target.value)}
                    />
                    <div className="flex gap-4 mt-4">
                        <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="flex-1 bg-amazon-yellow text-amazon-blue font-bold py-2 rounded hover:bg-yellow-400">Save Address</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default SavedAddresses;