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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-sm border border-gray-200 rounded-lg p-8 w-full max-w-sm"
      >
        <h1 className="text-xl font-semibold mb-6 text-center">Log in</h1>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <label className="block text-sm text-gray-600 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-sm"
          placeholder="you@example.com"
        />

        <label className="block text-sm text-gray-600 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-6 text-sm"
          placeholder="••••••••"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="text-sm text-gray-500 text-center mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-gray-900 font-medium">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}