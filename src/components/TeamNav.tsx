import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function TeamNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
      <span className="font-semibold">Weekly reports</span>
      <div className="flex items-center gap-6 text-sm">
        <Link to="/my-reports" className="text-gray-700 hover:text-gray-900">
          My reports
        </Link>
        <Link to="/my-reports/new" className="text-gray-700 hover:text-gray-900">
          New report
        </Link>
        <span className="text-gray-400">{user?.name}</span>
        <button onClick={handleLogout} className="text-gray-500 hover:text-gray-900">
          Log out
        </button>
      </div>
    </div>
  );
}