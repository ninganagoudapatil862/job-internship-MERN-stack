import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";

const statusClass = {
  pending: "badge-pending",
  reviewed: "badge-reviewed",
  shortlisted: "badge-shortlisted",
  rejected: "badge-rejected",
};

export default function MyApplications() {
  const [applications, setApplications] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/applications/me");
        if (!cancelled) setApplications(data.applications);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container">
      <h1 style={{ marginBottom: "0.5rem" }}>My applications</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        Track status for each role you applied to.
      </p>

      {error && <div className="alert alert-error">{error}</div>}
      {!applications && !error && (
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      )}
      {applications?.length === 0 && (
        <p style={{ color: "var(--muted)" }}>
          You have not applied yet.{" "}
          <Link to="/jobs">Browse openings</Link>.
        </p>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {applications?.map((app) => (
          <li key={app._id} className="card" style={{ marginBottom: "1rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.1rem" }}>
                  {app.job?.title || "Role"}
                </h2>
                <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.95rem" }}>
                  {app.job?.company} · {app.job?.location}
                </p>
                <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
                  Applied {new Date(app.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`badge ${statusClass[app.status] || "badge-pending"}`}>
                {app.status}
              </span>
            </div>
            {app.coverLetter ? (
              <p
                style={{
                  margin: "1rem 0 0",
                  fontSize: "0.9rem",
                  color: "var(--muted)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {app.coverLetter}
              </p>
            ) : null}
            {app.job?._id && (
              <Link
                to={`/jobs/${app.job._id}`}
                style={{ display: "inline-block", marginTop: "0.75rem", fontSize: "0.9rem" }}
              >
                View listing
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
