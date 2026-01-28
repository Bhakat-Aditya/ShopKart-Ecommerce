import { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, []);

  // Remove a toast manually
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Helper functions
  const toast = {
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    info: (msg) => addToast(msg, "info"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* --- TOAST CONTAINER (Fixed Overlay) --- */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 min-w-[300px] max-w-sm p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 animate-slide-in ${
              t.type === "success"
                ? "bg-white border-green-500 text-gray-800"
                : t.type === "error"
                  ? "bg-white border-red-500 text-gray-800"
                  : "bg-white border-blue-500 text-gray-800"
            }`}
          >
            {/* Icon */}
            <div className="flex-shrink-0">
              {t.type === "success" && (
                <CheckCircle className="text-green-500" size={20} />
              )}
              {t.type === "error" && (
                <AlertCircle className="text-red-500" size={20} />
              )}
              {t.type === "info" && (
                <Info className="text-blue-500" size={20} />
              )}
            </div>

            {/* Message */}
            <p className="text-sm font-medium flex-grow">{t.message}</p>

            {/* Close Button */}
            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
