import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/authContext";
import Login from "./pages/login";
import Register from "./pages/register";
import ProtectedRoute from "./components/protectedRoutes";
import ReportHistory from "./pages/team/ReportHistory";
import ReportForm from "./pages/team/ReportForm";
import ReportDetail from "./pages/team/ReportDetail";
import ManagerReportDetail from "./pages/manager/ManagerReportDetail";
import ManagerDashboard from "./pages/manager/managerDashboard";
import ManagerReportsList from "./pages/manager/ManagerReportsList";
import ManagerProjects from "./pages/manager/ManagerProjects";


function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === "manager"
    ? <Navigate to="/manager/dashboard" replace />
    : <Navigate to="/my-reports" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/my-reports" element={<ProtectedRoute role="team_member"><ReportHistory /></ProtectedRoute>}/>
          
          <Route path="/manager/dashboard" element={<ProtectedRoute role="manager"><ManagerDashboard /></ProtectedRoute>}/>
          <Route path="/my-reports/new" element={<ProtectedRoute role="team_member"><ReportForm /></ProtectedRoute>}/>
         <Route path="/my-reports/:id/edit" element={<ProtectedRoute role="team_member"><ReportForm /></ProtectedRoute>}/>
         <Route path="/my-reports/:id" element={<ProtectedRoute role="team_member"><ReportDetail /></ProtectedRoute>}/>
         <Route path="/manager/dashboard" element={<ProtectedRoute role="manager"> <ManagerDashboard /> </ProtectedRoute>}/>
         <Route path="/manager/reports/:id" element={<ProtectedRoute role="manager"><ManagerReportDetail /></ProtectedRoute>}/>
         <Route path="/manager/reports" element={<ProtectedRoute role="manager"><ManagerReportsList /></ProtectedRoute>}/>
         <Route path="/manager/projects" element={<ProtectedRoute role="manager"><ManagerProjects /></ProtectedRoute>}/>
         
         </Routes>
  
      </AuthProvider>
    </BrowserRouter>
  );
}