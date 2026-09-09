import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function ManagerNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const links = [
    { to: "/manager/dashboard", label: "Dashboard" },
    { to: "/manager/reports", label: "Reports" },
    { to: "/manager/projects", label: "Projects" },
    { to: "/manager/users", label: "Users" },
  ];

  return (
          Log out
        </button>
      </div>
    </div>
  );
}