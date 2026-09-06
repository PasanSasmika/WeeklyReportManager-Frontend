import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import axios from "axios";
import { useState, type FormEvent } from "react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      
      await api.post("/auth/register", { name, email, password, role: "team_member" });
      navigate("/login");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error?.message || "Registration failed.");
      } else {
        setError("Registration failed.");
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
        <h1 className="text-xl font-semibold mb-6 text-center">Create account</h1>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <label className="block text-sm text-gray-600 mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-sm"
        />

        <label className="block text-sm text-gray-600 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-sm"
        />

        <label className="block text-sm text-gray-600 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-6 text-sm"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="text-sm text-gray-500 text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-gray-900 font-medium">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}