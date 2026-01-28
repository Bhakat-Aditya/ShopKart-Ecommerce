import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
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
  const categoryParam = searchParams.get("category") || "";

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

  // --- SEARCH VIEW (If searching) ---
  if (keyword) {
    return (
      <div className="container mx-auto px-4 py-8 font-outfit">
        <h2 className="text-2xl font-bold mb-6">
          Results for "{keyword}" {categoryParam && `in ${categoryParam}`}
        </h2>
        <ProductRow
          title="Search Results"
          keyword={keyword}
          category={categoryParam}
        />
      </div>
    );
  }

  // --- HOME PAGE VIEW ---
  return (
    <div className="bg-gray-100 min-h-screen font-outfit pb-10">
      {/* HERO CAROUSEL */}
      <div className="relative w-full h-[250px] md:h-[400px] lg:h-[500px] overflow-hidden group">
        <div
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((img, index) => (
            <div key={index} className="w-full h-full flex-shrink-0 relative">
              {/* Gradient Mask for Amazon feel */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-100 z-10" />

              <img
                src={img}
                alt={`Banner ${index}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/4 md:top-1/3 bg-transparent hover:bg-white/20 border-2 border-transparent hover:border-white p-2 rounded focus:outline-none transition z-20 text-white"
        >
          <ChevronLeft size={32} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/4 md:top-1/3 bg-transparent hover:bg-white/20 border-2 border-transparent hover:border-white p-2 rounded focus:outline-none transition z-20 text-white"
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* --- CONTENT SECTION (Overlapping Hero) --- */}
      <div className="relative z-20 -mt-16 md:-mt-32 lg:-mt-60 space-y-6 max-w-[1500px] mx-auto">
        {/* 1. DEALS SECTION (High Priority) */}
        <ProductRow
          title="Todays Deals: Up to 50% Off"
          minDiscount={50} // Shows items with >50% discount
        />

        <ProductRow title="Budget Buys: Min 20% Off" minDiscount={20} />

        {/* 2. CATEGORY SECTIONS (Only show if products exist) */}
        <ProductRow title="Latest Mobiles" category="Mobiles" />
        <ProductRow title="Top Electronics" category="Electronics" />
        <ProductRow title="Fashion & Apparel" category="Fashion" />
        <ProductRow title="Home & Kitchen" category="Home & Kitchen" />
        <ProductRow title="Beauty & Health" category="Beauty & Health" />

        {/* 3. FALLBACK SECTION */}
        <ProductRow title="Recommended for You" category="" />
      </div>
    </div>
  );
};

export default Home;
