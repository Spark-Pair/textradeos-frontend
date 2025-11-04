import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Input from "../components/Input";
import Button from "../components/Button";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    document.title = "Login | TexTradeOS";
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosClient.post("/users/login", form);
      login(res.data);
      navigate("/dashboard");
      addToast("Login Successfully!", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e8f9f9] via-[#f8fbfb] to-[#d3f0f0] p-4 overflow-hidden relative">
      {/* 🔹 Main Card */}
      <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row bg-white/90 rounded-3xl border border-gray-300 shadow-lg overflow-hidden w-full max-w-6xl" >
        {/* 🔹 Left Side - Image */}
        <div className="hidden md:flex w-1/2 p-8 py-15">
          <img
            src="https://i.pinimg.com/1200x/3b/4d/c2/3b4dc268587f3bd530a5b231af4f6565.jpg"
            alt="Login Illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* 🔹 Right Side - Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-10 py-12 relative text-sm">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-sm mx-auto space-y-6"
          >
            {/* Header */}
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
                Welcome Back 👋
              </h1>
              <p className="text-gray-500 text-sm">
                Sign in to continue to{" "}
                <span className="font-medium text-[#127475]/90">TexTradeOS</span>
              </p>
            </div>
            <div className="border-t border-gray-300 my-4"></div>

            {/* Form Fields */}
            <div className="space-y-5">
              <Input
                label="Username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>

            {/* Divider + Footer */}
            <div className="border-t border-gray-300 my-6"></div>
            <p className="text-center text-gray-500 text-xs">
              TexTradeOS · powered by{" "}
              <a
                href="https://sparkpair.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[#127475]/85 hover:text-[#0c5859] transition"
              >
                SparkPair ⚡
              </a>
            </p>
          </motion.form>

          {/* Copyright */}
          <div className="absolute bottom-4 right-5.5 text-xs text-gray-400">
            © 2025 TexTradeOS ·{" "}
            <a
              href="https://sparkpair.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-gray-500 hover:text-[#127475]/85"
            >
              SparkPair
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
