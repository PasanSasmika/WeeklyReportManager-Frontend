import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/authContext";
import { useState, type FormEvent } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(email, password);

      if (loggedInUser.role === "manager") {
        navigate("/manager/dashboard");
      } else {
        navigate("/my-reports");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error?.message || "Login failed. Try again.");
      } else {
        setError("Login failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl shadow-indigo-100/50 border border-slate-200 rounded-2xl p-8 w-full max-w-sm"
      >
        <div className="text-center mb-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">WR</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">Log in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          placeholder="you@example.com"
        />

        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-6 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          placeholder="••••••••"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-sm font-medium shadow-sm shadow-indigo-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="text-sm text-slate-500 text-center mt-5">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-600 font-medium hover:text-indigo-700">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}