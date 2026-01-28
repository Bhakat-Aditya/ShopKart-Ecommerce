import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Mail,
  Lock,
  KeyRound,
  Loader,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP & New Pass
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post("/api/users/forgot-password", {
        email,
      });
      setMessage(data.message);
      setStep(2);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post("/api/users/reset-password", {
        email,
        otp,
        password,
      });
      alert(data.message);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 font-outfit">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
        <Link
          to="/login"
          className="flex items-center text-sm text-gray-500 hover:text-amazon-blue mb-6"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Login
        </Link>

        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          {step === 1 ? "Forgot Password?" : "Reset Password"}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {step === 1
            ? "Enter your registered email to receive a reset OTP."
            : `Enter the OTP sent to ${email} and your new password.`}
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm flex items-center gap-2">
            <CheckCircle size={16} /> {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Email Address
              </label>
              <div className="flex items-center border border-gray-300 rounded px-3 py-2 focus-within:border-amazon-yellow bg-white">
                <Mail size={18} className="text-gray-400 mr-2" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full outline-none text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue font-bold py-2.5 rounded shadow-sm transition-colors flex justify-center"
            >
              {loading ? <Loader className="animate-spin" /> : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Enter OTP
              </label>
              <div className="flex items-center border border-gray-300 rounded px-3 py-2 focus-within:border-amazon-yellow bg-white">
                <KeyRound size={18} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="6-digit OTP"
                  className="w-full outline-none text-sm tracking-widest font-mono"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                New Password
              </label>
              <div className="flex items-center border border-gray-300 rounded px-3 py-2 focus-within:border-amazon-yellow bg-white">
                <Lock size={18} className="text-gray-400 mr-2" />
                <input
                  type="password"
                  placeholder="New password"
                  className="w-full outline-none text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="flex items-center border border-gray-300 rounded px-3 py-2 focus-within:border-amazon-yellow bg-white">
                <Lock size={18} className="text-gray-400 mr-2" />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full outline-none text-sm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue font-bold py-2.5 rounded shadow-sm transition-colors flex justify-center"
            >
              {loading ? <Loader className="animate-spin" /> : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
