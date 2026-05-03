import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("seeker");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register({ name, email, password, role });
      navigate(role === "recruiter" ? "/recruiter/jobs" : "/jobs", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: "420px" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Create account</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        Already registered? <Link to="/login">Log in</Link>
      </p>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label className="label" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div className="form-group">
          <label className="label" htmlFor="role">
            I am a
          </label>
          <select
            id="role"
            className="select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="seeker">Job seeker</option>
            <option value="recruiter">Recruiter</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: "100%" }}>
          {submitting ? "Creating…" : "Sign up"}
        </button>
      </form>
    </div>
  );
}
