import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container">
      <section
        style={{
          textAlign: "center",
          padding: "3rem 0 2rem",
          maxWidth: "640px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
            letterSpacing: "-0.03em",
            marginBottom: "1rem",
            lineHeight: 1.2,
          }}
        >
          Find your next role—or hire the right candidate
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.1rem", marginBottom: "2rem" }}>
          Search jobs and internships, apply in one place, and manage listings if you
          recruit.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/jobs" className="btn btn-primary">
            Browse openings
          </Link>
          {!user && (
            <Link to="/register" className="btn btn-secondary">
              Create an account
            </Link>
          )}
        </div>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Job seekers</h3>
          <p style={{ color: "var(--muted)", marginBottom: 0 }}>
            Filter by type and location, save applications, and track status.
          </p>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Recruiters</h3>
          <p style={{ color: "var(--muted)", marginBottom: 0 }}>
            Post and edit listings, then review applicants for each role.
          </p>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Secure</h3>
          <p style={{ color: "var(--muted)", marginBottom: 0 }}>
            JWT authentication and bcrypt password hashing on the API.
          </p>
        </div>
      </div>
    </div>
  );
}
