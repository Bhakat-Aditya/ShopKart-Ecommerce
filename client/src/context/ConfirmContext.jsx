import { createContext, useContext, useState, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState({
    title: "Are you sure?",
    message: "This action cannot be undone.",
    confirmText: "Confirm",
    cancelText: "Cancel",
    type: "danger", // 'danger' (red) or 'info' (blue)
  });

  // We use a Ref to store the 'resolve' function of the Promise
  const resolveRef = useRef(null);

  const confirm = (message, title = "Are you sure?", type = "danger") => {
    setOptions({
      title,
      message,
      confirmText: "Yes, Proceed",
      cancelText: "No, Cancel",
      type,
    });
    setIsOpen(true);

    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  };

  const handleConfirm = () => {
    if (resolveRef.current) resolveRef.current(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolveRef.current) resolveRef.current(false);
    setIsOpen(false);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {/* --- MODAL UI --- */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop with Blur */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={handleCancel}
          ></div>

          {/* Modal Content */}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden transform transition-all animate-scale-up">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${options.type === "danger" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
              >
                <AlertTriangle size={20} />
              </div>
              <h3 className="font-bold text-lg text-gray-800">
                {options.title}
              </h3>
              <button
                onClick={handleCancel}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-600 leading-relaxed font-medium">
                {options.message}
              </p>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {options.cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-all transform active:scale-95 ${
                  options.type === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-amazon-blue hover:bg-gray-800"
                }`}
              >
                {options.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
