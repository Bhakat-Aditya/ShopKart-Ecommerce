import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Truck } from "lucide-react";

const Shipping = () => {
  const { saveShippingAddress, shippingAddress } = useCart(); 
  const navigate = useNavigate();

  const [address, setAddress] = useState(shippingAddress?.address || "");
  const [city, setCity] = useState(shippingAddress?.city || "");
  const [postalCode, setPostalCode] = useState(
    shippingAddress?.postalCode || "",
  );
  const [country, setCountry] = useState(shippingAddress?.country || "");

  const submitHandler = (e) => {
    e.preventDefault();
    saveShippingAddress({ address, city, postalCode, country });
    navigate("/placeorder");
};

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 w-full max-w-md">
        <div className="flex items-center gap-2 mb-6 text-amazon-blue">
          <Truck size={28} />
          <h1 className="text-2xl font-medium">Shipping Address</h1>
        </div>

        <form onSubmit={submitHandler} className="space-y-4">
          {/* Address Field */}
          <div>
            <label className="block text-sm font-bold mb-1">Address</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-amazon-yellow focus:ring-1 focus:ring-amazon-yellow outline-none"
              placeholder="Enter street address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* City Field */}
          <div>
            <label className="block text-sm font-bold mb-1">City</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-amazon-yellow focus:ring-1 focus:ring-amazon-yellow outline-none"
              placeholder="Enter city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          {/* Postal Code Field */}
          <div>
            <label className="block text-sm font-bold mb-1">Postal Code</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-amazon-yellow focus:ring-1 focus:ring-amazon-yellow outline-none"
              placeholder="Enter postal code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>

          {/* Country Field */}
          <div>
            <label className="block text-sm font-bold mb-1">Country</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-amazon-yellow focus:ring-1 focus:ring-amazon-yellow outline-none"
              placeholder="Enter country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue font-bold py-2 rounded shadow-sm transition-colors mt-4"
          >
            Continue to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default Shipping;
