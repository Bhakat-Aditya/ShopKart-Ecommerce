import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, Loader, KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // OTP State
  const [step, setStep] = useState(1); // 1 = Login Form, 2 = OTP Form
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  // STEP 1: Check credentials & Request OTP
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Note: Make sure your backend route is /api/users/login
      const { data } = await axios.post("/api/users/login", {
        email,
        password,
      });
      alert(data.message); // "OTP sent"
      setStep(2); // Move to OTP step
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP & Get Token
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post("/api/users/verify-otp", {
        email,
        otp,
      });
      login(data); // Save user to context/localstorage
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] font-outfit">
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 w-full max-w-sm">
        {step === 1 ? (
          /* --- STEP 1: EMAIL & PASSWORD --- */
          <>
            <h1 className="text-2xl font-medium mb-6">Sign In</h1>
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Email</label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:border-amazon-yellow outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Password</label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={18}
                  />
                  <input
                    type="password"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:border-amazon-yellow outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue font-medium py-2 rounded shadow-sm flex justify-center"
              >
                {loading ? (
                  <Loader className="animate-spin" size={20} />
                ) : (
                  "Continue"
                )}
              </button>
            </form>
            <div className="mt-6 text-sm text-center">
              <span className="text-gray-600">New to ShopKart? </span>
              <Link to="/register" className="text-blue-600 hover:underline">
                Create your account
              </Link>
            </div>
          </>
        ) : (
          /* --- STEP 2: OTP VERIFICATION --- */
          <>
            <h1 className="text-2xl font-medium mb-2">Verify OTP</h1>
            <p className="text-sm text-gray-500 mb-6">
              We sent a code to {email}
            </p>
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">
                  Enter OTP
                </label>
                <div className="relative">
                  <KeyRound
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:border-amazon-yellow outline-none tracking-widest text-lg font-bold"
                    placeholder="123456"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue font-medium py-2 rounded shadow-sm flex justify-center"
              >
                {loading ? (
                  <Loader className="animate-spin" size={20} />
                ) : (
                  "Verify & Login"
                )}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-blue-600 text-sm hover:underline mt-2"
              >
                Back to Login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
