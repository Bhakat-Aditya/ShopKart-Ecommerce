import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom"; // Import useSearchParams
import ProductRow from "../components/ProductRow";
import { ChevronLeft, ChevronRight } from "lucide-react";

const banners = [
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2101&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
];

const Home = () => {
  const { keyword } = useParams();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || ""; // Read category from URL

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));

  // --- SEARCH VIEW ---
  if (keyword) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">
          Results for "{keyword}" {categoryParam && `in ${categoryParam}`}
        </h2>
        {/* FIX: Pass keyword and category to ProductRow */}
        <ProductRow
          title="Search Results"
          keyword={keyword}
          category={categoryParam}
        />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-outfit pb-20">
      {/* HERO CAROUSEL */}
      <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((img, index) => (
            <div key={index} className="w-full h-full flex-shrink-0 relative">
              <img
                src={img}
                alt={`Banner ${index}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent flex items-end pb-12 pl-8 md:pl-20">
                <div className="text-white max-w-xl animate-fade-in-up">
                  <h1 className="text-3xl md:text-5xl font-bold mb-2 shadow-sm">
                    {index === 0
                      ? "Big Savings on Tech"
                      : index === 1
                        ? "New Arrivals"
                        : "Fashion Trends"}
                  </h1>
                  <p className="text-lg md:text-xl opacity-90 mb-4">
                    Up to 50% off on your favorite brands. Limited time offer.
                  </p>
                  <button className="bg-amazon-yellow text-amazon-blue px-6 py-3 rounded-full font-bold hover:bg-yellow-400 transition transform hover:scale-105">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white p-2 rounded-full backdrop-blur-sm transition"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white p-2 rounded-full backdrop-blur-sm transition"
        >
          <ChevronRight size={24} />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? "w-8 bg-amazon-yellow" : "w-2 bg-white/50"}`}
            />
          ))}
        </div>
      </div>

      {/* --- CONTENT ROWS --- */}
      <div className="relative z-10 -mt-10 md:-mt-20 space-y-4">
        <ProductRow title="Latest Drops" category="" />
        <ProductRow title="Top Electronics" category="Electronics" />
        <ProductRow title="Best Selling Mobiles" category="Mobiles" />
        <ProductRow title="Fashion & Apparel" category="Fashion" />
        <ProductRow
          title="Home & Kitchen Essentials"
          category="Home & Kitchen"
        />
      </div>
    </div>
  );
};

export default Home;
