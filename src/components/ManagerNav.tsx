import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function ManagerNav() {
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
        <Link to="/manager/dashboard" className="text-gray-700 hover:text-gray-900">
          Dashboard
        </Link>
        <Link to="/manager/reports" className="text-gray-700 hover:text-gray-900">
          Reports
        </Link>
        <Link to="/manager/projects" className="text-gray-700 hover:text-gray-900">
          Projects
        </Link>
        <Link to="/manager/users" className="text-gray-700 hover:text-gray-900">
          Users
        </Link>
        <span className="text-gray-400">{user?.name}</span>
        <button onClick={handleLogout} className="text-gray-500 hover:text-gray-900">
          Log out
        </button>
      </div>
    </div>
  );
}