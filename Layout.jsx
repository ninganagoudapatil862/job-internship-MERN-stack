import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navStyle = ({ isActive }) => ({
  color: isActive ? "var(--text)" : "var(--muted)",
  fontWeight: isActive ? 600 : 500,
  textDecoration: "none",
});

export default function Layout() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            paddingTop: "1rem",
            paddingBottom: "1rem",
          }}
        >
          <NavLink to="/" style={{ textDecoration: "none", color: "var(--text)" }}>
            <strong style={{ fontSize: "1.15rem", letterSpacing: "-0.02em" }}>
              Job & Internship Board
            </strong>
          </NavLink>
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
              flexWrap: "wrap",
            }}
          >
            <NavLink to="/jobs" style={navStyle}>
              Browse
            </NavLink>
            {!loading && user?.role === "seeker" && (
              <NavLink to="/applications" style={navStyle}>
                My applications
              </NavLink>
            )}
            {!loading && user?.role === "recruiter" && (
              <>
                <NavLink to="/recruiter/jobs" style={navStyle}>
                  My listings
                </NavLink>
                <NavLink to="/recruiter/jobs/new" style={navStyle}>
                  Post a role
                </NavLink>
              </>
            )}
            {!loading && !user && (
              <>
                <NavLink to="/login" style={navStyle}>
                  Log in
                </NavLink>
                <NavLink to="/register">
                  <span className="btn btn-primary" style={{ textDecoration: "none" }}>
                    Sign up
                  </span>
                </NavLink>
              </>
            )}
            {!loading && user && (
              <>
                <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                  {user.name}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Log out
                </button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
        <Outlet />
      </main>
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "1.5rem 0",
          color: "var(--muted)",
          fontSize: "0.875rem",
        }}
      >
        <div className="container">
          Job & Internship Board — MERN demo. MongoDB on localhost.
        </div>
      </footer>
    </>
  );
}
