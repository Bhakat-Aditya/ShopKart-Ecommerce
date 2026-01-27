import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { User, Mail, Lock, Loader } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post("/api/auth/register", { name, email, password });
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/");
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 w-full max-w-sm">
        <h1 className="text-2xl font-medium mb-6">Create Account</h1>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Your Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="text" 
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:border-amazon-yellow focus:ring-1 focus:ring-amazon-yellow outline-none" 
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
              <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="email" 
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:border-amazon-yellow focus:ring-1 focus:ring-amazon-yellow outline-none" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="password" 
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:border-amazon-yellow focus:ring-1 focus:ring-amazon-yellow outline-none" 
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
            className="w-full bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue font-medium py-2 rounded shadow-sm transition-colors flex justify-center"
          >
            {loading ? <Loader className="animate-spin" size={20} /> : "Register"}
          </button>
        </form>

        <div className="mt-6 text-sm text-center">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;