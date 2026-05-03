import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading, token } = useAuth();
  const location = useLocation();

  if (loading && token) {
    return (
      <div className="container" style={{ paddingTop: "2rem" }}>
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
