import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Truck, Zap } from "lucide-react";

const Shipping = () => {
  const { saveShippingAddress, shippingAddress } = useCart();
  const navigate = useNavigate();

  // Load existing values
  const [address, setAddress] = useState(shippingAddress?.address || "");
  const [city, setCity] = useState(shippingAddress?.city || "");
  const [postalCode, setPostalCode] = useState(
    shippingAddress?.postalCode || "",
  );
  const [country, setCountry] = useState(shippingAddress?.country || "");

  // Express Delivery State (Default false)
  const [isExpress, setIsExpress] = useState(
    shippingAddress?.isExpress || false,
  );

  const submitHandler = (e) => {
    e.preventDefault();
    // Save the Express preference inside the address object
    saveShippingAddress({ address, city, postalCode, country, isExpress });
    navigate("/placeorder");
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 w-full max-w-md">
        <h1 className="text-2xl font-medium mb-6 flex items-center gap-2">
          <Truck /> Shipping Details
        </h1>

        <form onSubmit={submitHandler} className="space-y-4">
          {/* ... (Keep Address, City, PostalCode, Country inputs same as before) ... */}
          <input
            type="text"
            placeholder="Address"
            required
            className="w-full p-2 border rounded"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <input
            type="text"
            placeholder="City"
            required
            className="w-full p-2 border rounded"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <input
            type="text"
            placeholder="Postal Code"
            required
            className="w-full p-2 border rounded"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />
          <input
            type="text"
            placeholder="Country"
            required
            className="w-full p-2 border rounded"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />

          {/* EXPRESS DELIVERY OPTION */}
          <div
            className="bg-blue-50 p-4 rounded border border-blue-200 mt-4 cursor-pointer"
            onClick={() => setIsExpress(!isExpress)}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isExpress}
                onChange={(e) => setIsExpress(e.target.checked)}
                className="h-5 w-5 text-amazon-yellow cursor-pointer"
              />
              <div>
                <span className="font-bold text-amazon-blue flex items-center gap-1">
                  <Zap
                    size={16}
                    fill="currentColor"
                    className="text-yellow-500"
                  />{" "}
                  Express Delivery
                </span>
                <p className="text-xs text-gray-600">
                  Get it by tomorrow (+₹85)
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amazon-yellow hover:bg-yellow-400 font-bold py-2 rounded mt-4"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default Shipping;
