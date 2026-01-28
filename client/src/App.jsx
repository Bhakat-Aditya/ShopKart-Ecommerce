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
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";
import SavedAddresses from "./pages/SavedAddresses";
import Wishlist from "./pages/Wishlist";
import ForgotPassword from "./pages/ForgotPassword";
import AdminRoute from "./components/AdminRoute";
import UserList from "./pages/admin/UserList";
import UserEdit from "./pages/admin/UserEdit";
import SellerProducts from "./pages/admin/SellerProducts";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SearchPage from "./pages/SearchPage";
import Invoice from "./pages/Invoice";

// Seller Imports
import SellerRoute from "./components/SellerRoute";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerRegister from "./pages/seller/SellerRegister";
import ProductList from "./pages/admin/ProductList";
import ProductEdit from "./pages/admin/ProductEdit";
import SellerOrders from "./pages/seller/SellerOrders";
import SellerShop from "./pages/SellerShop";

import { ToastProvider } from "./context/ToastContext";
import { ConfirmProvider } from "./context/ConfirmContext";

function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <div className="min-h-screen flex flex-col font-outfit bg-gray-100">
          <Navbar />
          <main className="grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/search/:keyword" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/register" element={<Register />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/placeorder" element={<PlaceOrder />} />
              <Route path="/myorders" element={<MyOrders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/addresses" element={<SavedAddresses />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/order/:id" element={<OrderDetails />} />
              <Route path="/order/:id/invoice" element={<Invoice />} />
              <Route path="/shop/:id" element={<SellerShop />} />

              {/* Seller Registration */}
              <Route path="/seller/register" element={<SellerRegister />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserList />} />
                <Route path="user/:id/edit" element={<UserEdit />} />
                <Route
                  path="seller/:id/products"
                  element={<SellerProducts />}
                />
              </Route>

              {/* Protected Seller Area */}
              <Route path="/seller" element={<SellerRoute />}>
                <Route path="dashboard" element={<SellerDashboard />} />
                <Route path="products" element={<ProductList />} />{" "}
                <Route path="orders" element={<SellerOrders />} />
                {/* List "My" Products */}
                <Route path="product/:id/edit" element={<ProductEdit />} />
              </Route>
            </Routes>
          </main>
          <footer className="bg-amazon-light text-white p-4 text-center mt-auto">
            &copy; 2026 ShopKart
          </footer>
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;
