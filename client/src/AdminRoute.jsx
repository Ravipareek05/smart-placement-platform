import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    if (decoded.role !== "ADMIN") {
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  } catch (error) {
    // Invalid or expired token
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
}