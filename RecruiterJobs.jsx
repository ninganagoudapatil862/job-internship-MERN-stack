import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const { data } = await api.get("/jobs/my");
      setJobs(data.jobs);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function removeJob(id) {
    if (!window.confirm("Delete this listing permanently?")) return;
    try {
      await api.delete(`/jobs/${id}`);
      setJobs((list) => list.filter((j) => j._id !== id));
    } catch (e) {
      alert(e.response?.data?.message || "Delete failed");
    }
  }

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 0.35rem" }}>My listings</h1>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Manage postings and review applicants.
          </p>
        </div>
        <Link to="/recruiter/jobs/new" className="btn btn-primary">
          New listing
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {!jobs && !error && <p style={{ color: "var(--muted)" }}>Loading…</p>}
      {jobs?.length === 0 && (
        <p style={{ color: "var(--muted)" }}>
          No listings yet. <Link to="/recruiter/jobs/new">Create one</Link>.
        </p>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {jobs?.map((job) => (
          <li key={job._id} className="card" style={{ marginBottom: "1rem" }}>
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
                <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.15rem" }}>
                  {job.title}{" "}
                  {!job.isActive && (
                    <span style={{ color: "var(--muted)", fontWeight: 400 }}>
                      (inactive)
                    </span>
                  )}
                </h2>
                <p style={{ margin: 0, color: "var(--muted)" }}>
                  {job.company} · {job.location}
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <Link
                  to={`/recruiter/jobs/${job._id}/applications`}
                  className="btn btn-secondary"
                  style={{ fontSize: "0.875rem", padding: "0.5rem 0.85rem" }}
                >
                  Applications
                </Link>
                <Link
                  to={`/recruiter/jobs/${job._id}/edit`}
                  className="btn btn-secondary"
                  style={{ fontSize: "0.875rem", padding: "0.5rem 0.85rem" }}
                >
                  Edit
                </Link>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ fontSize: "0.875rem", padding: "0.5rem 0.85rem" }}
                  onClick={() => removeJob(job._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
