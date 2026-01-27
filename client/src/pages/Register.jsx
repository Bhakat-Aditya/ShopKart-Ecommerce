import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { User, Mail, Lock, Loader, KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext"; // Import Context to auto-login after register

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // OTP State
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth(); // To save token after verification

  // STEP 1: Register Data & Request OTP
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Backend route: /api/users
      const { data } = await axios.post("/api/users", {
        name,
        email,
        password,
      });
      alert(data.message); // "OTP sent to email"
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP & Finalize Account
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post("/api/users/verify-otp", {
        email,
        otp,
      });
      login(data); // Save user to context
      navigate("/"); // Go home
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
          /* --- STEP 1: CREATE ACCOUNT --- */
          <>
            <h1 className="text-2xl font-medium mb-6">Create Account</h1>
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">
                  Your Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:border-amazon-yellow outline-none"
                    placeholder="First and last name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
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
                    placeholder="At least 6 characters"
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
                  "Send OTP"
                )}
              </button>
            </form>
            <div className="mt-6 text-sm text-center">
              <span className="text-gray-600">Already have an account? </span>
              <Link to="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </>
        ) : (
          /* --- STEP 2: VERIFY OTP --- */
          <>
            <h1 className="text-2xl font-medium mb-2">Verify Email</h1>
            <p className="text-sm text-gray-500 mb-6">
              Enter the code sent to {email}
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
                  "Create Account"
                )}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-blue-600 text-sm hover:underline mt-2"
              >
                Back to Edit Details
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
