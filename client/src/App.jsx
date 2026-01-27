import { Routes, Route } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Navbar from "./components/Navbar";
import ProductDetails from "./pages/ProductDetails";

const Home = () => (
  <div className="p-10 text-2xl font-bold text-amazon-light">
    Home Page Content
  </div>
);
function App() {
  useGSAP(() => {
    gsap.fromTo("body", { opacity: 0 }, { opacity: 1, duration: 1 });
  });

  return (
    <div className="min-h-screen flex flex-col font-outfit bg-gray-100">
      <Navbar />

      <main className="grow">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* The Route is already correct, just using the new component now */}
          <Route path="/product/:id" element={<ProductDetails />} />
        </Routes>
      </main>

      <footer className="bg-amazon-light text-white p-4 text-center mt-auto">
        &copy; 2026 ShopKart
      </footer>
    </div>
  );
}

export default App;
