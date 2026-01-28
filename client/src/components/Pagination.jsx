import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, pages, changePage }) => {
  if (pages <= 1) return null; // Don't show if only 1 page

  return (
    <div className="flex justify-center items-center mt-10 space-x-2">
      {/* Previous Button */}
      <button
        onClick={() => changePage(page - 1)}
        disabled={page === 1}
        className={`p-2 rounded-md border border-gray-300 flex items-center justify-center ${
          page === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white hover:bg-gray-50 text-gray-700"
        }`}
      >
        <ChevronLeft size={20} />
        <span className="sr-only">Previous</span>
      </button>

      {/* Page Numbers */}
      {[...Array(pages).keys()].map((x) => (
        <button
          key={x + 1}
          onClick={() => changePage(x + 1)}
          className={`px-4 py-2 text-sm font-medium rounded-md border ${
            x + 1 === page
              ? "bg-amazon-blue text-white border-amazon-blue"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          {x + 1}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => changePage(page + 1)}
        disabled={page === pages}
        className={`p-2 rounded-md border border-gray-300 flex items-center justify-center ${
          page === pages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white hover:bg-gray-50 text-gray-700"
        }`}
      >
        <ChevronRight size={20} />
        <span className="sr-only">Next</span>
      </button>
    </div>
  );
};

export default Pagination;
