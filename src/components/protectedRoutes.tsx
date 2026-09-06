import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { Role } from "../types";
import { useAuth } from "../context/authContext";


interface Props {
  children: ReactNode;
  role?: Role;
}

// wrap any page in this to require login, and optionally restrict by role
// usage: <ProtectedRoute role="manager"><ManagerDashboard /></ProtectedRoute>
export default function ProtectedRoute({ children, role }: Props) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}