import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Loader, Printer, ShoppingBag } from "lucide-react";

const Invoice = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`/api/orders/${id}`, config);
        setOrder(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    if (user) fetchOrder();
  }, [id, user]);

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader className="animate-spin" />
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center p-20">{error}</div>;

  return (
    <div className="bg-white min-h-screen text-black font-sans p-8 md:p-16 print:p-0">
      {/* PRINT BUTTON (Hidden when printing) */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">Order Invoice</h1>
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 flex items-center gap-2"
        >
          <Printer size={18} /> Print / Save as PDF
        </button>
      </div>

      {/* INVOICE CONTENT */}
      <div className="max-w-4xl mx-auto border border-gray-200 p-8 md:p-12 print:border-0 print:p-0 print:max-w-full">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-8 border-b pb-8">
          <div>
            <div className="flex items-center gap-2 text-amazon-blue mb-2">
              <ShoppingBag size={28} />
              <span className="text-2xl font-bold tracking-tight">
                ShopKart
              </span>
            </div>
            <p className="text-sm text-gray-500">
              123 Commerce St, Market City
              <br />
              West Bengal, India, 721101
              <br />
              support@shopkart.com
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-200 uppercase tracking-wide mb-2">
              Invoice
            </h2>
            <p className="text-gray-600">
              <strong>Invoice #:</strong> INV-{order._id.substring(20, 24)}
            </p>
            <p className="text-gray-600">
              <strong>Date:</strong>{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p className="text-gray-600">
              <strong>Order ID:</strong> {order._id}
            </p>
          </div>
        </div>

        {/* BILL TO */}
        <div className="flex justify-between mb-8">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Bill To:
            </h3>
            <p className="font-bold text-gray-800 text-lg">{order.user.name}</p>
            <p className="text-gray-600">{order.user.email}</p>
            <p className="text-gray-600 max-w-xs mt-1">
              {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
              {order.shippingAddress.postalCode},{" "}
              {order.shippingAddress.country}
            </p>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Payment Status:
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${order.isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {order.isPaid ? "PAID" : "UNPAID"}
            </span>
            <p className="text-sm text-gray-500 mt-2">
              Method: {order.paymentMethod}
            </p>
          </div>
        </div>

        {/* TABLE */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="text-left py-3 font-bold text-gray-800">
                Item Description
              </th>
              <th className="text-center py-3 font-bold text-gray-800">Qty</th>
              <th className="text-right py-3 font-bold text-gray-800">
                Unit Price
              </th>
              <th className="text-right py-3 font-bold text-gray-800">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.orderItems.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-4 text-gray-700">{item.name}</td>
                <td className="py-4 text-center text-gray-700">{item.qty}</td>
                <td className="py-4 text-right text-gray-700">₹{item.price}</td>
                <td className="py-4 text-right font-bold text-gray-800">
                  ₹{item.price * item.qty}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOTALS */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>₹{order.itemsPrice}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (GST):</span>
              <span>₹{order.taxPrice}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping:</span>
              <span>₹{order.shippingPrice}</span>
            </div>
            <div className="flex justify-between border-t border-gray-800 pt-2 text-lg font-bold text-gray-900">
              <span>Total:</span>
              <span>₹{order.totalPrice}</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-12 border-t pt-8 text-center text-gray-500 text-sm">
          <p>Thank you for shopping with ShopKart.</p>
          <p className="mt-1">For support, visit www.shopkart.com/help</p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
