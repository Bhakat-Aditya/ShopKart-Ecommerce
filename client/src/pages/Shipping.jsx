import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext"; // Use Auth for backend calls
import axios from "axios";
import { Truck, Plus, MapPin, Check, Loader } from "lucide-react";

const Shipping = () => {
  const { saveShippingAddress, shippingAddress } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [isExpress, setIsExpress] = useState(false); // Express checkbox

  // 1. Fetch Saved Addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get("/api/users/address", config);
        setSavedAddresses(data);

        // If cart has no address but user has saved ones, auto-select default
        if (!shippingAddress.address && data.length > 0) {
          const defaultAddr = data.find((a) => a.isDefault) || data[0];
          selectAddress(defaultAddr);
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [user, shippingAddress.address]);

  // 2. Select Address Handler
  const selectAddress = (addr) => {
    saveShippingAddress({
      address: addr.address,
      city: addr.city,
      postalCode: addr.postalCode,
      country: addr.country,
      isExpress: isExpress, // Keep express preference
    });
    setShowForm(false);
  };

  // 3. Save New Address
  const submitNewAddress = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const newAddr = { name, phone, address, city, postalCode, country };

      // Save to Backend
      const { data } = await axios.post("/api/users/address", newAddr, config);
      setSavedAddresses(data); // Update list

      // Auto Select it for this order
      selectAddress(newAddr);
      setShowForm(false); // Close form
    } catch (error) {
      alert("Failed to save address");
    }
  };

  const continueHandler = () => {
    if (!shippingAddress.address) return alert("Please select an address");
    // Ensure Express preference is saved
    saveShippingAddress({ ...shippingAddress, isExpress });
    navigate("/placeorder");
  };

  if (loading)
    return (
      <div className="p-10 flex justify-center">
        <Loader className="animate-spin" />
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 font-outfit max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-amazon-blue">
        Select a delivery address
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* --- LIST OF ADDRESSES --- */}
        <div className="space-y-4">
          {savedAddresses.map((addr, index) => (
            <div
              key={index}
              onClick={() => selectAddress(addr)}
              className={`border-2 rounded-lg p-4 cursor-pointer hover:bg-gray-50 relative transition-all ${
                shippingAddress.address === addr.address
                  ? "border-amazon-yellow bg-orange-50"
                  : "border-gray-200"
              }`}
            >
              {shippingAddress.address === addr.address && (
                <div className="absolute top-2 right-2 text-amazon-blue">
                  <Check size={20} />
                </div>
              )}
              <div className="font-bold text-gray-900">{addr.name}</div>
              <div className="text-sm text-gray-600">
                {addr.address}, {addr.city}
              </div>
              <div className="text-sm text-gray-600 uppercase">
                {addr.postalCode}, {addr.country}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Phone: {addr.phone}
              </div>
            </div>
          ))}

          {/* Add New Button */}
          <div
            onClick={() => setShowForm(!showForm)}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-gray-400 flex items-center justify-center text-gray-500 gap-2"
          >
            <Plus size={20} /> Add a new address
          </div>
        </div>

        {/* --- ADD NEW FORM (Collapsible) --- */}
        {showForm && (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="font-bold mb-4">Add a new address</h2>
            <form onSubmit={submitNewAddress} className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-2 border rounded"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Phone Number"
                className="w-full p-2 border rounded"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <input
                type="text"
                placeholder="Address Line"
                className="w-full p-2 border rounded"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  className="w-full p-2 border rounded"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Zip Code"
                  className="w-full p-2 border rounded"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
              <input
                type="text"
                placeholder="Country"
                className="w-full p-2 border rounded"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />

              <button
                type="submit"
                className="w-full bg-amazon-yellow hover:bg-yellow-400 font-bold py-2 rounded shadow-sm"
              >
                Save Address
              </button>
            </form>
          </div>
        )}
      </div>

      {/* --- EXPRESS OPTION & CONTINUE --- */}
      <div className="mt-8 border-t pt-6">
        <div
          className="flex items-center gap-2 mb-6 cursor-pointer w-fit"
          onClick={() => setIsExpress(!isExpress)}
        >
          <input
            type="checkbox"
            checked={isExpress}
            readOnly
            className="h-5 w-5 text-amazon-yellow"
          />
          <span className="font-bold text-blue-700 flex items-center gap-1">
            <Truck size={18} /> Express Delivery (+₹85)
          </span>
        </div>

        <button
          onClick={continueHandler}
          className="bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue px-8 py-3 rounded-lg font-bold shadow-md"
        >
          Use this address
        </button>
      </div>
    </div>
  );
};

export default Shipping;
