import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function TeamNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const links = [
    { to: "/my-reports", label: "My reports" },
    { to: "/my-reports/new", label: "New report" },
  ];

  return (
    <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-semibold">WR</span>
        </div>
        <span className="font-semibold text-slate-900">Weekly reports</span>
      </div>

      <div className="flex items-center gap-1 text-sm">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {link.label}
            </Link>
          );
        })}

        <div className="w-px h-5 bg-slate-200 mx-2" />

        <span className="text-slate-400 px-1">{user?.name}</span>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
        >
          Log out
        </button>
      </div>
    </div>
  );
}