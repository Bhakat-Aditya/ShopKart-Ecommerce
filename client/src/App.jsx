import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProductDetails from "./pages/ProductDetails";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Shipping from "./pages/Shipping";
import PlaceOrder from "./pages/PlaceOrder";
import MyOrders from "./pages/MyOrders";
import AdminRoute from "./components/AdminRoute";
import ProductList from "./pages/admin/ProductList";

function App() {
  return (
    <div className="min-h-screen flex flex-col font-outfit bg-gray-100">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/placeorder" element={<PlaceOrder />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/admin" element={<AdminRoute />}>
            <Route path="productlist" element={<ProductList />} />
          </Route>
        </Routes>
      </main>
      <footer className="bg-amazon-light text-white p-4 text-center mt-auto">
        &copy; 2026 ShopKart
      </footer>
    </div>
  );
}

export default App;
