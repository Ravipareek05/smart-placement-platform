import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Problems from "./Problems";
import SolveProblem from "./SolveProblem";
import AdminDashboard from "./AdminDashboard";

import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ---------- DEFAULT ---------- */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ---------- PUBLIC ---------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ---------- USER PROTECTED ---------- */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/problems"
          element={
            <ProtectedRoute>
              <Problems />
            </ProtectedRoute>
          }
        />

        {/* ✅ SOLVE PAGE (USER + ADMIN) */}
        <Route
          path="/problems/:id"
          element={
            <ProtectedRoute>
              <SolveProblem />
            </ProtectedRoute>
          }
        />

        {/* ---------- ADMIN ONLY ---------- */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* ---------- FALLBACK ---------- */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;